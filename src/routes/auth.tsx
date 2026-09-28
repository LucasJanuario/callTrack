import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [
    { title: "Entrar — CallTrack" },
    { name: "description", content: "Acesse o CallTrack para registrar seus atendimentos." },
    { property: "og:title", content: "Entrar — CallTrack" },
    { property: "og:description", content: "Acesse o CallTrack para registrar seus atendimentos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

function AuthPage() {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    nav({ to: "/" });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Bem-vindo!"); nav({ to: "/" }); }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <Card className="w-full max-w-sm p-8 shadow-[var(--shadow-elev)] border-border">
        <div className="flex flex-col items-center mb-7">
          <div className="size-12 rounded-md grid place-items-center bg-brand-dark text-coral mb-4">
            <Phone className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">CallTrack</h1>
          <p className="text-sm text-muted-foreground">Entre para registrar suas ligações</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-coral text-coral-foreground hover:bg-coral/85" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-xs text-center text-muted-foreground">
          Sem conta? Peça ao administrador.{" "}
          <Link to="/setup" className="text-primary hover:underline">Primeiro acesso</Link>
        </p>
      </Card>
    </div>
  );
}
