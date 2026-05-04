import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

interface Call {
  id: string;
  ticket: string | null;
  numero: string;
  atendimento: string | null;
  call_date: string;
  created_at: string;
}

function IndexPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [calls, setCalls] = useState<Call[]>([]);
  const [ticket, setTicket] = useState("");
  const [numero, setNumero] = useState("");
  const [atendimento, setAtendimento] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user, date]);

  async function load() {
    if (!user) return;
    const { data, error } = await supabase
      .from("calls")
      .select("id,ticket,numero,atendimento,call_date,created_at")
      .eq("user_id", user.id)
      .eq("call_date", date)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    else setCalls(data ?? []);
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!user || !numero.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("calls").insert({
      user_id: user.id,
      call_date: date,
      ticket: ticket.trim() || null,
      numero: numero.trim(),
      atendimento: atendimento.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setTicket(""); setNumero(""); setAtendimento("");
    void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("calls").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setCalls((c) => c.filter((x) => x.id !== id)); toast.success("Removido"); }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Minhas ligações</h1>
            <p className="text-sm text-muted-foreground">Registre as ligações atendidas no dia.</p>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <Label htmlFor="date" className="text-xs">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
            </div>
            <Card className="px-4 py-2 flex items-center gap-3 shadow-[var(--shadow-soft)]">
              <div className="size-9 rounded-md grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>
                <Phone className="size-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total no dia</div>
                <div className="text-2xl font-bold leading-none">{calls.length}</div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-4 shadow-[var(--shadow-soft)]">
          <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="ticket" className="text-xs">Ticket</Label>
              <Input id="ticket" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="opcional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero" className="text-xs">Número *</Label>
              <Input id="numero" required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ex: 30534-83996952205" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="atend" className="text-xs">Atendimento</Label>
              <Input id="atend" value={atendimento} onChange={(e) => setAtendimento(e.target.value)} placeholder="ex: encaminhado para s2" />
            </div>
            <Button type="submit" disabled={busy}>
              <Plus className="size-4" /> Adicionar
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
          <div className="grid grid-cols-[60px_140px_1fr_1fr_60px] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2">
            <div>#</div><div>Ticket</div><div>Número</div><div>Atendimento</div><div></div>
          </div>
          {calls.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma ligação registrada nesta data.</div>
          ) : calls.map((c, i) => (
            <div key={c.id} className="grid grid-cols-[60px_140px_1fr_1fr_60px] items-center px-4 py-2.5 border-t text-sm">
              <div className="text-muted-foreground">{i + 1}</div>
              <div>{c.ticket || "—"}</div>
              <div className="font-mono">{c.numero}</div>
              <div className="text-muted-foreground">{c.atendimento || "—"}</div>
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </main>
    </div>
  );
}
