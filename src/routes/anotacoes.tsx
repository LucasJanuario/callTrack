import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/anotacoes")({
  component: AnotacoesPage,
  head: () => ({ meta: [{ title: "Anotações — CallTrack" }] }),
});

interface Note {
  id: string;
  content: string;
  created_by: string;
  updated_at: string;
  updated_by: string | null;
}

function AnotacoesPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    void load();
    const ch = supabase
      .channel("notes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => void load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  async function load() {
    const { data, error } = await supabase
      .from("notes")
      .select("id,content,created_by,updated_at,updated_by")
      .order("updated_at", { ascending: false });
    if (error) return toast.error(error.message);
    const list = data ?? [];
    setNotes(list);
    setDrafts((prev) => {
      const next = { ...prev };
      for (const n of list) if (!(n.id in next)) next[n.id] = n.content;
      return next;
    });
    const ids = Array.from(new Set(list.flatMap((n) => [n.created_by, n.updated_by]).filter(Boolean) as string[]));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      const map: Record<string, string> = {};
      profs?.forEach((p) => { map[p.id] = p.full_name; });
      setAuthors(map);
    }
  }

  async function add() {
    if (!user) return;
    const { error } = await supabase.from("notes").insert({ created_by: user.id, content: "" });
    if (error) toast.error(error.message);
  }

  async function save(id: string) {
    if (!user) return;
    const { error } = await supabase.from("notes").update({ content: drafts[id] ?? "", updated_by: user.id }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Anotação salva");
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta anotação?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) toast.error(error.message);
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><StickyNote className="size-6" /> Anotações</h1>
            <p className="text-sm text-muted-foreground">Bloco de notas compartilhado — visível para todos.</p>
          </div>
          <Button onClick={add}><Plus className="size-4" /> Nova anotação</Button>
        </div>

        {notes.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">Nenhuma anotação ainda.</Card>
        ) : notes.map((n) => {
          const dirty = (drafts[n.id] ?? "") !== n.content;
          const author = authors[n.updated_by ?? n.created_by] ?? "—";
          return (
            <Card key={n.id} className="p-4 space-y-3 shadow-[var(--shadow-soft)]">
              <Textarea
                value={drafts[n.id] ?? ""}
                onChange={(e) => setDrafts((p) => ({ ...p, [n.id]: e.target.value }))}
                placeholder="Escreva aqui..."
                rows={5}
                className="resize-y"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Última edição por <span className="font-medium">{author}</span> · {new Date(n.updated_at).toLocaleString("pt-BR")}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => remove(n.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                  <Button size="sm" onClick={() => save(n.id)} disabled={!dirty}>
                    <Save className="size-4" /> Salvar
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
