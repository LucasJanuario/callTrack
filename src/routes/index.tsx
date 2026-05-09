import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Phone, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

interface Call {
  id: string;
  ticket: string | null;
  numero: string;
  atendimento: string | null;
  canal: string | null;
  call_date: string;
  created_at: string;
  checked: boolean;
}

function IndexPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [calls, setCalls] = useState<Call[]>([]);
  const [ticket, setTicket] = useState("");
  const [numero, setNumero] = useState("");
  const [atendimento, setAtendimento] = useState("");
  const [canal, setCanal] = useState("Fone");
  const [busy, setBusy] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState("");
  const [editNumero, setEditNumero] = useState("");
  const [editAtendimento, setEditAtendimento] = useState("");
  const [editCanal, setEditCanal] = useState("Fone");

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
      .select("id,ticket,numero,atendimento,canal,call_date,created_at,checked")
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
      canal: canal,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setTicket(""); setNumero(""); setAtendimento(""); setCanal("Fone");
    void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("calls").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  }

  function startEdit(c: Call) {
    setEditId(c.id);
    setEditTicket(c.ticket ?? "");
    setEditNumero(c.numero);
    setEditAtendimento(c.atendimento ?? "");
    setEditCanal(c.canal ?? "Fone");
  }

  function cancelEdit() {
    setEditId(null);
  }

  async function saveEdit(id: string) {
    if (!editNumero.trim()) return toast.error("Número é obrigatório");
    const { error } = await supabase.from("calls").update({
      ticket: editTicket.trim() || null,
      numero: editNumero.trim(),
      atendimento: editAtendimento.trim() || null,
      canal: editCanal,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
    setEditId(null);
    void load();
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
          <form
            onSubmit={add}
            className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_130px_auto] gap-3 items-end"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket" className="text-xs">Ticket</Label>
              <Input id="ticket" className="h-10" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="opcional" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="numero" className="text-xs">Número *</Label>
              <Input id="numero" className="h-10" required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ex: 3088-99567070" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="atendimento" className="text-xs">Atendimento</Label>
              <Input id="atendimento" className="h-10" value={atendimento} onChange={(e) => setAtendimento(e.target.value)} placeholder="ex: Devolução para fornecedor" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="canal" className="text-xs">Canal</Label>
              <Select value={canal} onValueChange={setCanal}>
                <SelectTrigger id="canal" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fone">Fone</SelectItem>
                  <SelectItem value="Chat">Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={busy} className="h-10">
              <Plus className="size-4" /> Adicionar
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
          <div className="grid grid-cols-[60px_120px_1fr_1fr_90px_96px] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2">
            <div>#</div><div>Ticket</div><div>Número</div><div>Atendimento</div><div>Canal</div><div></div>
          </div>
          {calls.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma ligação registrada nesta data.</div>
          ) : calls.map((c, i) => (
            <div key={c.id} className="grid grid-cols-[60px_120px_1fr_1fr_90px_96px] items-center px-4 py-2.5 border-t text-sm">
              <div className="text-muted-foreground">{i + 1}</div>
              {editId === c.id ? (
                <>
                  <Input value={editTicket} onChange={(e) => setEditTicket(e.target.value)} placeholder="opcional" className="h-7 text-sm" />
                  <Input value={editNumero} onChange={(e) => setEditNumero(e.target.value)} required className="h-7 text-sm font-mono" />
                  <Input value={editAtendimento} onChange={(e) => setEditAtendimento(e.target.value)} className="h-7 text-sm" />
                  <Select value={editCanal} onValueChange={setEditCanal}>
                    <SelectTrigger className="h-7 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fone">Fone</SelectItem>
                      <SelectItem value="Chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => saveEdit(c.id)}>
                      <Check className="size-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit}>
                      <X className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>{c.ticket || "—"}</div>
                  <div className="font-mono">{c.numero}</div>
                  <div className="text-muted-foreground">{c.atendimento || "—"}</div>
                  <div>{c.canal || "—"}</div>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </Card>
      </main>
    </div>
  );
}
