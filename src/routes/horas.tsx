import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { calcOvertime } from "@/lib/overtime";

export const Route = createFileRoute("/horas")({
  component: HorasPage,
  head: () => ({ meta: [
    { title: "Horas Extras — CallTrack" },
    { name: "description", content: "Calcule o valor das suas horas extras a 100% e 70% no CallTrack." },
    { property: "og:title", content: "Horas Extras — CallTrack" },
    { property: "og:description", content: "Calcule o valor das suas horas extras a 100% e 70% no CallTrack." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

interface OvertimeEntry {
  id: string;
  user_id: string;
  entry_date: string;
  hours_100: number;
  hours_70: number;
}

const HOURS_PER_MONTH = 220;

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function HorasPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  const [salary, setSalary] = useState("");
  const [savedSalary, setSavedSalary] = useState<number | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [entries, setEntries] = useState<OvertimeEntry[]>([]);

  const [date, setDate] = useState(todayStr());
  const [h100, setH100] = useState("");
  const [h70, setH70] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editH100, setEditH100] = useState("");
  const [editH70, setEditH70] = useState("");

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    void loadSalary();
    void loadEntries();
    const ch = supabase
      .channel("overtime_entries")
      .on("postgres_changes", { event: "*", schema: "public", table: "overtime_entries" }, () => void loadEntries())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, month]);

  async function loadSalary() {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("salario").eq("id", user.id).maybeSingle();
    const s = data?.salario != null ? Number(data.salario) : null;
    setSavedSalary(s);
    if (s != null) setSalary(String(s).replace(".", ","));
  }

  async function loadEntries() {
    if (!user) return;
    const [y, m] = month.split("-").map(Number);
    const start = `${month}-01`;
    const end = new Date(y, m, 0).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("overtime_entries")
      .select("id,user_id,entry_date,hours_100,hours_70")
      .eq("user_id", user.id)
      .gte("entry_date", start)
      .lte("entry_date", end)
      .order("entry_date", { ascending: false });
    if (error) return toast.error(error.message);
    setEntries((data ?? []) as OvertimeEntry[]);
  }

  async function saveSalary() {
    if (!user) return;
    const value = Number(salary.replace(/\./g, "").replace(",", "."));
    if (!value || value <= 0) return toast.error("Informe um salário válido.");
    const { error } = await supabase.from("profiles").update({ salario: value }).eq("id", user.id);
    if (error) return toast.error(error.message);
    setSavedSalary(value);
    toast.success("Salário salvo");
  }

  function parseHours(v: string) {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  async function addEntry() {
    if (!user) return;
    const a = parseHours(h100) ?? 0;
    const b = parseHours(h70) ?? 0;
    if (a === 0 && b === 0) return toast.error("Informe ao menos uma quantidade de horas.");
    if (!date) return toast.error("Informe a data.");
    const { error } = await supabase.from("overtime_entries").insert({
      user_id: user.id,
      entry_date: date,
      hours_100: a,
      hours_70: b,
    });
    if (error) return toast.error(error.message);
    await loadEntries();
    setH100("");
    setH70("");
    toast.success("Horas adicionadas");
  }

  function startEdit(e: OvertimeEntry) {
    setEditingId(e.id);
    setEditDate(e.entry_date);
    setEditH100(String(e.hours_100).replace(".", ","));
    setEditH70(String(e.hours_70).replace(".", ","));
  }

  async function saveEdit() {
    if (!editingId) return;
    const a = parseHours(editH100) ?? 0;
    const b = parseHours(editH70) ?? 0;
    const { error } = await supabase
      .from("overtime_entries")
      .update({ entry_date: editDate, hours_100: a, hours_70: b })
      .eq("id", editingId);
    if (error) return toast.error(error.message);
    await loadEntries();
    setEditingId(null);
    toast.success("Horas atualizadas");
  }

  async function removeEntry(id: string) {
    if (!confirm("Excluir este registro de horas?")) return;
    const { error } = await supabase.from("overtime_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await loadEntries();
  }

  const totals = useMemo(() => {
    const t100 = entries.reduce((s, e) => s + Number(e.hours_100), 0);
    const t70 = entries.reduce((s, e) => s + Number(e.hours_70), 0);
    return { t100, t70, ...calcOvertime(savedSalary ?? 0, t100, t70, month) };
  }, [entries, savedSalary, month]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="size-6" /> Horas Extras</h1>
            <p className="text-sm text-muted-foreground">Calcule quanto você fez em horas extras no mês.</p>
          </div>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 w-auto text-sm px-2 bg-muted border-0"
          />
        </div>

        <Card className="p-4 shadow-[var(--shadow-soft)] space-y-3">
          <div className="text-sm font-medium">Seu salário mensal</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="3.000,00"
                inputMode="decimal"
                className="pl-9 w-44"
              />
            </div>
            <Button onClick={saveSalary} className="bg-coral text-coral-foreground hover:bg-coral/85">
              <Save className="size-4" /> Salvar salário
            </Button>
            {savedSalary != null && (
              <span className="text-xs text-muted-foreground">
                Hora normal: {brl(totals.hourly)} · Hora 100%: {brl(totals.hourly * 2)} · Hora 70%: {brl(totals.hourly * 1.7)}
              </span>
            )}
          </div>
        </Card>

        <Card className="p-4 shadow-[var(--shadow-soft)] space-y-3">
          <div className="text-sm font-medium">Adicionar horas</div>
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto] gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-40" />
            <Input value={h100} onChange={(e) => setH100(e.target.value)} placeholder="Horas 100% (ex: 2)" inputMode="decimal" />
            <Input value={h70} onChange={(e) => setH70(e.target.value)} placeholder="Horas 70% (ex: 1,5)" inputMode="decimal" />
            <Button onClick={addEntry} className="bg-coral text-coral-foreground hover:bg-coral/85">
              <Plus className="size-4" /> Adicionar
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 shadow-[var(--shadow-soft)]">
            <div className="text-xs text-muted-foreground">Horas a 100%</div>
            <div className="text-xl font-bold">{totals.t100.toLocaleString("pt-BR")}h</div>
            <div className="text-sm text-muted-foreground">{brl(totals.v100)}</div>
          </Card>
          <Card className="p-4 shadow-[var(--shadow-soft)]">
            <div className="text-xs text-muted-foreground">Horas a 70%</div>
            <div className="text-xl font-bold">{totals.t70.toLocaleString("pt-BR")}h</div>
            <div className="text-sm text-muted-foreground">{brl(totals.v70)}</div>
          </Card>
          <Card className="p-4 shadow-[var(--shadow-soft)]">
            <div className="text-xs text-muted-foreground">Repouso s/ Horas Extras</div>
            <div className="text-xl font-bold">{totals.dsrHours.toLocaleString("pt-BR")}h</div>
            <div className="text-sm text-muted-foreground">{brl(totals.dsr)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{totals.workDays} dias úteis · {totals.restDays} domingos</div>
          </Card>
          <Card className="p-4 shadow-[var(--shadow-soft)] bg-coral text-coral-foreground">
            <div className="text-xs opacity-80">Total a receber</div>
            <div className="text-xl font-bold">{brl(totals.total)}</div>
            <div className="text-sm opacity-80">{(totals.t100 + totals.t70).toLocaleString("pt-BR")}h + repouso</div>
          </Card>
        </div>

        <Card className="p-4 shadow-[var(--shadow-soft)]">
          {entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Nenhum registro neste mês.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-4 font-medium">Data</th>
                    <th className="py-2 pr-4 font-medium">Horas 100%</th>
                    <th className="py-2 pr-4 font-medium">Horas 70%</th>
                    <th className="py-2 pr-4 font-medium">Valor do dia</th>
                    <th className="py-2 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const dayValue = Number(e.hours_100) * totals.hourly * 2 + Number(e.hours_70) * totals.hourly * 1.7;
                    const isEditing = editingId === e.id;
                    return (
                      <tr key={e.id} className="border-b last:border-0">
                        {isEditing ? (
                          <>
                            <td className="py-2 pr-4"><Input type="date" value={editDate} onChange={(ev) => setEditDate(ev.target.value)} className="h-8 w-36 text-sm" /></td>
                            <td className="py-2 pr-4"><Input value={editH100} onChange={(ev) => setEditH100(ev.target.value)} className="h-8 w-24 text-sm" inputMode="decimal" /></td>
                            <td className="py-2 pr-4"><Input value={editH70} onChange={(ev) => setEditH70(ev.target.value)} className="h-8 w-24 text-sm" inputMode="decimal" /></td>
                            <td className="py-2 pr-4 text-muted-foreground">—</td>
                            <td className="py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={saveEdit} aria-label="Salvar"><Save className="size-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar"><X className="size-4" /></Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 pr-4">{new Date(e.entry_date + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                            <td className="py-2 pr-4">{Number(e.hours_100).toLocaleString("pt-BR")}h</td>
                            <td className="py-2 pr-4">{Number(e.hours_70).toLocaleString("pt-BR")}h</td>
                            <td className="py-2 pr-4">{savedSalary != null ? brl(dayValue) : "—"}</td>
                            <td className="py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={() => startEdit(e)} aria-label="Editar"><Pencil className="size-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => removeEntry(e.id)} aria-label="Excluir"><Trash2 className="size-4 text-destructive" /></Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
