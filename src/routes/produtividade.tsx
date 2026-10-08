import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link2, Loader2, RefreshCw } from "lucide-react";
import { fetchSheetCsv } from "@/lib/sheets.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/produtividade")({
  component: ProdutividadePage,
  head: () => ({
    meta: [
      { title: "Produtividade — CallTrack" },
      { name: "description", content: "Produtividade diária de Suporte e Generalista vinda da planilha vinculada." },
      { property: "og:title", content: "Produtividade — CallTrack" },
      { property: "og:description", content: "Produtividade diária de Suporte e Generalista vinda da planilha vinculada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STORAGE_KEY = "produtividade_sheet_url"; // legado (localStorage), usado só para migração
const SETTINGS_KEY = "produtividade_sheet_url";
const METRICS = ["FONE", "CHAT", "TICKET", "TOTAL"];

export function parseSheetUrl(url: string): { sheetId: string; gid: string } | null {
  const id = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!id) return null;
  const gid = url.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
  return { sheetId: id, gid };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

interface Group { day: string; cols: { idx: number; metric: string }[] }
interface Section { title: string; rows: { name: string; values: string[] }[] }

function buildTable(rows: string[][]) {
  const norm = (s: string) => s.trim().toUpperCase();
  const metricRowIdx = rows.findIndex((r) => r.filter((c) => METRICS.includes(norm(c))).length >= 2);
  if (metricRowIdx < 0) return null;
  const metricRow = rows[metricRowIdx];
  // find date row above the metrics row
  let dateRow: string[] = [];
  for (let i = metricRowIdx - 1; i >= 0; i--) {
    if (rows[i].some((c) => /\d{1,2}\/\d{1,2}/.test(c))) { dateRow = rows[i]; break; }
  }
  const groups: Group[] = [];
  let current: Group | null = null;
  metricRow.forEach((c, idx) => {
    const m = norm(c);
    if (!METRICS.includes(m)) return;
    const d = (dateRow[idx] ?? "").trim();
    if (d || !current || current.cols.some((x) => x.metric === m)) {
      current = { day: d || (current?.day ?? ""), cols: [] };
      groups.push(current);
    }
    current.cols.push({ idx, metric: m });
  });
  const nameCol = Math.max(0, metricRow.findIndex((c) => METRICS.includes(norm(c))) - 1);
  const sections: Section[] = [];
  let sec: Section | null = null;
  for (const r of rows.slice(metricRowIdx + 1)) {
    const joined = norm(r.join(" "));
    const label = norm(r[0] ?? "") || norm(r[nameCol] ?? "");
    if (/^SUPORTE|^GENERALISTA/.test(label) || (/SUPORTE|GENERALISTA/.test(joined) && r.filter((c) => c.trim()).length <= 2)) {
      sec = { title: label.includes("GENERALISTA") || joined.includes("GENERALISTA") ? "GENERALISTA" : "SUPORTE", rows: [] };
      sections.push(sec);
      const name = (r[nameCol] ?? "").trim();
      if (name && !/SUPORTE|GENERALISTA/i.test(name)) sec.rows.push({ name, values: groups.flatMap((g) => g.cols.map((c) => r[c.idx] ?? "")) });
      continue;
    }
    const name = (r[nameCol] ?? "").trim() || (r[0] ?? "").trim();
    if (!name) continue;
    if (!sec) { sec = { title: "SUPORTE", rows: [] }; sections.push(sec); }
    sec.rows.push({ name, values: groups.flatMap((g) => g.cols.map((c) => r[c.idx] ?? "")) });
  }
  return { groups, sections };
}

function ProdutividadePage() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();
  const fetchCsv = useServerFn(fetchSheetCsv);
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState("");
  const [rows, setRows] = useState<string[][] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
      let saved = data?.value ?? "";
      if (!saved) {
        // Migração automática: se o link existia apenas neste navegador, sobe para a nuvem (admin)
        const local = localStorage.getItem(STORAGE_KEY) ?? "";
        if (local && role === "admin") {
          await supabase.from("app_settings").upsert({ key: SETTINGS_KEY, value: local });
          saved = local;
        }
      }
      setUrl(saved); setDraft(saved);
    })();
  }, [user, role]);

  const load = useCallback(async (u: string) => {
    const p = parseSheetUrl(u);
    if (!p) return;
    setSyncing(true); setError(null);
    try {
      const { csv } = await fetchCsv({ data: p });
      setRows(parseCsv(csv));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao sincronizar");
    } finally { setSyncing(false); }
  }, [fetchCsv]);

  useEffect(() => { if (url && user) void load(url); }, [url, user, load]);

  const table = useMemo(() => (rows ? buildTable(rows) : null), [rows]);

  async function save() {
    const p = parseSheetUrl(draft);
    if (!p) return toast.error("URL inválida. Cole o link completo da planilha do Google Sheets.");
    const { error: err } = await supabase.from("app_settings").upsert({ key: SETTINGS_KEY, value: draft });
    if (err) return toast.error("Não foi possível salvar o link. Apenas administradores podem alterar.");
    localStorage.removeItem(STORAGE_KEY);
    setUrl(draft);
    toast.success(`Planilha vinculada para todos (aba gid=${p.gid})`);
  }

  if (loading || !user) return null;
  const parsed = parseSheetUrl(draft);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Produtividade</h1>
            <p className="text-sm text-muted-foreground">Dados sincronizados da planilha vinculada.</p>
          </div>
          {url && (
            <Button variant="outline" onClick={() => load(url)} disabled={syncing}>
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Atualizar
            </Button>
          )}
        </div>

        {role === "admin" && (
          <Card className="p-4 shadow-[var(--shadow-soft)] space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Link2 className="size-4" /> Vincular planilha</h3>
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">URL da planilha do Google Sheets</Label>
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=836060842" />
              </div>
              <Button onClick={save} className="bg-coral text-coral-foreground hover:bg-coral/85">Salvar</Button>
            </div>
            {draft && (
              <p className="text-xs text-muted-foreground">
                {parsed ? <>ID: <code>{parsed.sheetId}</code> · Aba (gid): <code>{parsed.gid}</code></> : "Não foi possível identificar o ID da planilha."}
              </p>
            )}
            <p className="text-xs text-muted-foreground">A planilha precisa estar compartilhada como "Qualquer pessoa com o link pode ver".</p>
          </Card>
        )}

        {!url ? (
          <Card className="p-8 text-center text-muted-foreground">
            {role === "admin" ? "Cole a URL da planilha acima para começar." : "Nenhuma planilha vinculada ainda. Peça ao administrador."}
          </Card>
        ) : syncing && !rows ? (
          <Card className="p-12 grid place-items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            Sincronizando planilha...
          </Card>
        ) : error ? (
          <Card className="p-6 text-destructive text-sm">{error}</Card>
        ) : !table ? (
          <Card className="p-6 text-sm text-muted-foreground">Não encontrei as colunas FONE / CHAT / TICKET / TOTAL nesta aba.</Card>
        ) : (
          <Card className="overflow-hidden shadow-[var(--shadow-soft)] relative">
            {syncing && (
              <div className="absolute inset-0 bg-background/60 grid place-items-center z-20">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}
            <div className="overflow-auto">
              <table className="text-xs border-collapse min-w-full">
                <thead>
                  <tr className="bg-brand-dark text-coral">
                    <th rowSpan={2} className="sticky left-0 z-10 bg-brand-dark px-3 py-2 text-left border border-border min-w-40">Colaborador</th>
                    {table.groups.map((g, i) => (
                      <th key={i} colSpan={g.cols.length} className="px-2 py-2 border border-border font-bold">{g.day}</th>
                    ))}
                  </tr>
                  <tr className="bg-muted">
                    {table.groups.flatMap((g, i) => g.cols.map((c) => (
                      <th key={`${i}-${c.idx}`} className={`px-2 py-1.5 border border-border font-semibold ${c.metric === "TOTAL" ? "text-primary" : "text-muted-foreground"}`}>{c.metric}</th>
                    )))}
                  </tr>
                </thead>
                <tbody>
                  {table.sections.map((s, si) => (
                    <SectionRows key={si} section={s} groups={table.groups} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function SectionRows({ section, groups }: { section: Section; groups: Group[] }) {
  const metrics = groups.flatMap((g) => g.cols.map((c) => c.metric));
  const total = metrics.length + 1;
  return (
    <>
      <tr>
        <td colSpan={total} className="sticky left-0 bg-accent text-accent-foreground font-bold px-3 py-2 border border-border tracking-wide">{section.title}</td>
      </tr>
      {section.rows.map((r, i) => (
        <tr key={i} className="hover:bg-muted/50">
          <td className="sticky left-0 bg-card px-3 py-1.5 border border-border font-medium whitespace-nowrap">{r.name}</td>
          {r.values.map((v, j) => (
            <td key={j} className={`px-2 py-1.5 border border-border text-center ${metrics[j] === "TOTAL" ? "font-bold bg-muted/40" : ""}`}>{v}</td>
          ))}
        </tr>
      ))}
    </>
  );
}
