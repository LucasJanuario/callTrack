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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus, Pencil, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import simpsonsAsset from "@/assets/simpsons.png.asset.json";
import rockAsset from "@/assets/rock.png.asset.json";
import ruivoAsset from "@/assets/ruivo.png.asset.json";
import shrekAsset from "@/assets/shrek.png.asset.json";
import lulaAsset from "@/assets/lula.png.asset.json";

function getMoodImage(count: number): { url: string; alt: string } {
  if (count === 13) return { url: lulaAsset.url, alt: "Lula" };
  if (count >= 15) return { url: shrekAsset.url, alt: "Shrek" };
  if (count >= 10) return { url: ruivoAsset.url, alt: "Ruivo" };
  if (count >= 5) return { url: rockAsset.url, alt: "The Rock" };
  return { url: simpsonsAsset.url, alt: "Simpsons" };
}

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => ({ meta: [
    { title: "Minhas ligações — CallTrack" },
    { name: "description", content: "Registre e acompanhe suas ligações atendidas por data no CallTrack." },
    { property: "og:title", content: "Minhas ligações — CallTrack" },
    { property: "og:description", content: "Registre e acompanhe suas ligações atendidas por data no CallTrack." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
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
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [editId, setEditId] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState("");
  const [editNumero, setEditNumero] = useState("");
  const [editAtendimento, setEditAtendimento] = useState("");
  const [editCanal, setEditCanal] = useState("Fone");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user, date, sortDir]);

  async function load() {
    if (!user) return;
    const { data, error } = await supabase
      .from("calls")
      .select("id,ticket,numero,atendimento,canal,call_date,created_at,checked")
      .eq("user_id", user.id)
      .eq("call_date", date)
      .order("created_at", { ascending: sortDir === "asc" });
    if (error) toast.error(error.message);
    else setCalls(data ?? []);
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!user || !numero.trim()) return;
    setBusy(true);
    const ticketTrim = ticket.trim();
    const { error } = await supabase.from("calls").insert({
      user_id: user.id,
      call_date: date,
      ticket: ticketTrim || null,
      numero: numero.trim(),
      atendimento: atendimento.trim() || null,
      canal: canal,
      checked: ticketTrim.length > 0,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setTicket(""); setNumero(""); setAtendimento(""); setCanal("Fone");
    void load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("calls").delete().eq("id", deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
    if (error) return toast.error(error.message);
    void load();
  }

  function askDelete(id: string) {
    setDeleteId(id);
    setDeleteOpen(true);
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
    const ticketTrim = editTicket.trim();
    const current = calls.find((c) => c.id === id);
    const update = {
      ticket: ticketTrim || null,
      numero: editNumero.trim(),
      atendimento: editAtendimento.trim() || null,
      canal: editCanal,
      checked: ticketTrim.length > 0 ? true : (current?.checked ?? false),
    };
    const { error } = await supabase.from("calls").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
    setEditId(null);
    void load();
  }

  async function toggleChecked(id: string, value: boolean) {
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, checked: value } : c)));
    const { error } = await supabase.from("calls").update({ checked: value }).eq("id", id);
    if (error) {
      toast.error(error.message);
      void load();
    }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader date={date} onDateChange={setDate} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-primary mb-1">Painel de atendimento</p>
            <h1 className="text-2xl font-bold">Minhas ligações</h1>
            <p className="text-sm text-muted-foreground">Registre as ligações atendidas no dia.</p>
          </div>

          <div className="flex items-stretch gap-3 w-full sm:w-auto">
            {(() => {
              const mood = getMoodImage(calls.length);
              return (
                <Card className="p-2 shadow-[var(--shadow-soft)] shrink-0">
                  <img
                    src={mood.url}
                    alt={mood.alt}
                    className="size-24 object-cover rounded-md"
                  />
                </Card>
              );
            })()}
            <Card className="px-5 py-3 flex-1 sm:flex-none flex flex-col items-center justify-center gap-1 shadow-[var(--shadow-soft)] min-w-0 sm:min-w-[180px] min-h-[112px]">
              <div className="text-base sm:text-lg text-muted-foreground font-semibold text-center">Total no dia</div>
              <div className="text-4xl font-display font-bold leading-none text-foreground tabular-nums">{calls.length}</div>
            </Card>
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-3">
          <Label htmlFor="date-mobile" className="text-sm font-semibold shrink-0">Data</Label>
          <Input id="date-mobile" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto max-w-full bg-card" />
        </div>

        <section>
        <h2 className="text-sm font-bold text-muted-foreground uppercase mb-3">Novo registro</h2>
        <Card className="p-4 shadow-[var(--shadow-soft)]">
          <form
            onSubmit={add}
            className="grid grid-cols-2 md:grid-cols-[140px_1fr_2fr_130px_auto] gap-3 items-end"
          >
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="ticket" className="text-xs">Ticket</Label>
              <Input id="ticket" className="h-10" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="opcional" />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="numero" className="text-xs">Número *</Label>
              <Input id="numero" className="h-10" required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ex: 3088-99567070" />
            </div>

            <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1 min-w-0">
              <Label htmlFor="atendimento" className="text-xs">Atendimento</Label>
              <Input id="atendimento" className="h-10" value={atendimento} onChange={(e) => setAtendimento(e.target.value)} placeholder="ex: Devolução para fornecedor" />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
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

            <Button type="submit" disabled={busy} className="h-10 bg-coral text-coral-foreground hover:bg-coral/85 md:w-auto">
              <Plus className="size-4" /> Adicionar
            </Button>
          </form>
        </Card>
        </section>

        <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase">Ligações registradas</h2>
          <Button type="button" variant="ghost" size="sm" className="md:hidden text-primary" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
            {sortDir === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />} Ordenar
          </Button>
        </div>
        <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
          <div className="hidden md:grid grid-cols-[44px_60px_120px_1fr_1fr_90px_96px] bg-muted/60 text-xs font-medium uppercase text-muted-foreground px-4 py-3">
            <div></div>
            <div>
              <Button variant="ghost" size="sm"
                type="button"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="h-auto p-0 inline-flex items-center gap-1 hover:text-foreground transition-colors"
                title={sortDir === "asc" ? "Ordenar do mais recente" : "Ordenar do mais antigo"}
              >
                #
                {sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              </Button>
            </div>
            <div>Ticket</div><div>Número</div><div>Atendimento</div><div>Canal</div><div></div>
          </div>
          {calls.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma ligação registrada nesta data.</div>
          ) : calls.map((c, i) => (
            <div key={c.id} className="grid grid-cols-[36px_1fr_auto] md:grid-cols-[44px_60px_120px_1fr_1fr_90px_96px] items-center gap-x-2 md:gap-x-0 px-4 py-3 border-t text-sm">
              <div className="row-span-3 md:row-span-1 self-start md:self-center pt-1 md:pt-0">
                <Checkbox aria-label={`Marcar ligação ${i + 1}`} checked={c.checked} onCheckedChange={(v) => toggleChecked(c.id, v === true)} />
              </div>
              <div className="hidden md:block text-muted-foreground">{i + 1}</div>
              {editId === c.id ? (
                <>
                  <Input aria-label="Editar ticket" value={editTicket} onChange={(e) => setEditTicket(e.target.value)} placeholder="Ticket" className="col-span-2 md:col-span-1 h-8 text-sm" />
                  <Input aria-label="Editar número" value={editNumero} onChange={(e) => setEditNumero(e.target.value)} required className="col-span-2 md:col-span-1 h-8 text-sm font-mono" />
                  <Input aria-label="Editar atendimento" value={editAtendimento} onChange={(e) => setEditAtendimento(e.target.value)} className="col-span-2 md:col-span-1 h-8 text-sm" />
                  <Select value={editCanal} onValueChange={setEditCanal}>
                    <SelectTrigger className="h-7 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fone">Fone</SelectItem>
                      <SelectItem value="Chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="Salvar edição" onClick={() => saveEdit(c.id)}>
                      <Check className="size-4 text-success" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Cancelar edição" onClick={cancelEdit}>
                      <X className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="hidden md:block">{c.ticket || "—"}</div>
                  <div className="font-semibold md:font-normal break-all md:break-normal">{c.numero}<span className="md:hidden text-xs text-muted-foreground font-normal ml-2">#{i + 1}{c.ticket ? ` · Ticket ${c.ticket}` : ""}</span></div>
                  <div className="col-start-2 md:col-auto text-muted-foreground whitespace-normal break-words min-w-0">{c.atendimento || "—"}</div>
                  <div className="col-start-2 md:col-auto text-xs md:text-sm text-primary">{c.canal || "—"}</div>
                  <div className="col-start-3 row-start-1 row-span-3 md:col-auto md:row-auto flex justify-end gap-1 self-start md:self-center">
                    <Button variant="ghost" size="icon" aria-label="Editar ligação" onClick={() => startEdit(c)}>
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir ligação" onClick={() => askDelete(c.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </Card>
        </section>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
