import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, FileBarChart2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorio")({
  component: RelatorioPage,
  head: () => ({ meta: [{ title: "Relatório — CallTrack" }] }),
});

interface Profile { id: string; full_name: string }
interface Call { id: string; user_id: string; call_date: string; ticket: string | null; numero: string; atendimento: string | null; canal: string | null }

function RelatorioPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [employee, setEmployee] = useState<string>("all");
  const [canal, setCanal] = useState<string>("all");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);
  useEffect(() => { void loadProfiles(); }, []);
  useEffect(() => { void run(); }, [from, to, employee, canal]);

  async function loadProfiles() {
    const { data } = await supabase.from("profiles").select("id,full_name").order("full_name");
    setProfiles(data ?? []);
  }
  async function run() {
    let q = supabase.from("calls").select("id,user_id,call_date,ticket,numero,atendimento,canal")
      .gte("call_date", from).lte("call_date", to).order("call_date").order("created_at");
    if (employee !== "all") q = q.eq("user_id", employee);
    if (canal !== "all") q = q.eq("canal", canal);
    const { data, error } = await q;
    if (error) toast.error(error.message); else setCalls(data ?? []);
  }

  const nameOf = useMemo(() => {
    const m = new Map(profiles.map((p) => [p.id, p.full_name]));
    return (id: string) => m.get(id) ?? "—";
  }, [profiles]);

  const summary = useMemo(() => {
    const byUser = new Map<string, number>();
    for (const c of calls) byUser.set(c.user_id, (byUser.get(c.user_id) ?? 0) + 1);
    return Array.from(byUser.entries())
      .map(([uid, count]) => ({ uid, name: nameOf(uid), count }))
      .sort((a, b) => b.count - a.count);
  }, [calls, nameOf]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 print:p-0">
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileBarChart2 className="size-6" /> Relatório</h1>
            <p className="text-sm text-muted-foreground">Filtre por funcionário e período.</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" /> Imprimir
          </Button>
        </div>

        <Card className="p-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Funcionário</Label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Canal</Label>
              <Select value={canal} onValueChange={setCanal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Fone">Fone</SelectItem>
                  <SelectItem value="Chat">Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data início</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data fim</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </Card>

        <div className="hidden print:block text-center mb-4">
          <h2 className="text-xl font-bold">
            Relatório {employee === "all" ? "— Todos" : `de ${nameOf(employee)}`}
          </h2>
          <p className="text-sm">Período: {fmt(from)} a {fmt(to)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 lg:col-span-1">
            <h3 className="font-semibold mb-3">Resumo quantitativo</h3>
            {summary.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <ul className="space-y-2">
                {summary.map((s) => (
                  <li key={s.uid} className="flex items-center justify-between border-b last:border-0 pb-2">
                    <span className="text-sm">{s.name}</span>
                    <span className="font-bold tabular-nums">{s.count}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-2 font-semibold">
                  <span>Total</span><span className="tabular-nums">{calls.length}</span>
                </li>
              </ul>
            )}
          </Card>

          <Card className="lg:col-span-2 overflow-hidden">
            <div className="grid grid-cols-[110px_1fr_1.5fr_1fr] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2">
              <div>Data</div><div>Funcionário</div><div>Número</div><div>Atendimento</div>
            </div>
            {calls.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Sem registros para o filtro.</div>
            ) : calls.map((c) => (
              <div key={c.id} className="grid grid-cols-[110px_1fr_1.5fr_1fr] px-4 py-2 border-t text-sm">
                <div className="tabular-nums">{fmt(c.call_date)}</div>
                <div>{nameOf(c.user_id)}</div>
                <div className="font-mono">{c.numero}</div>
                <div className="text-muted-foreground">{c.atendimento || "—"}</div>
              </div>
            ))}
            <div className="px-4 py-2 border-t bg-muted/40 text-sm font-semibold">
              Total de registros: {calls.length}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
