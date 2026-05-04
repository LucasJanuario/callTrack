import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Funcionários — CallTrack" }] }),
});

interface Row { id: string; full_name: string; role: "admin" | "employee" }

function AdminPage() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/auth" });
    else if (role && role !== "admin") nav({ to: "/" });
  }, [user, role, loading, nav]);

  useEffect(() => { if (role === "admin") void load(); }, [role]);

  async function load() {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,full_name").order("full_name"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const roleMap = new Map<string, "admin" | "employee">();
    roles?.forEach((r) => {
      if (r.role === "admin") roleMap.set(r.user_id, "admin");
      else if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, "employee");
    });
    setRows((profiles ?? []).map((p) => ({ id: p.id, full_name: p.full_name, role: roleMap.get(p.id) ?? "employee" })));
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Funcionário cadastrado!");
    setName(""); setEmail(""); setPassword("");
    setTimeout(load, 500);
  }

  if (loading || role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="text-sm text-muted-foreground">Cadastre e gerencie quem pode acessar o sistema.</p>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><UserPlus className="size-4" /> Cadastrar funcionário</h3>
          <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">E-mail</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Senha provisória</Label>
              <Input type="text" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Criando..." : "Cadastrar"}</Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_120px] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2">
            <div>Nome</div><div>Função</div>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_120px] px-4 py-3 border-t items-center">
              <div className="text-sm">{r.full_name || "(sem nome)"}</div>
              <Badge variant={r.role === "admin" ? "default" : "secondary"}>
                {r.role === "admin" ? "Admin" : "Funcionário"}
              </Badge>
            </div>
          ))}
        </Card>
      </main>
    </div>
  );
}
