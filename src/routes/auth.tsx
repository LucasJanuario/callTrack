import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import logoAsset from "@/assets/calltrack-logo.png.asset.json";
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
    <main className="min-h-screen grid md:grid-cols-2 bg-background">
      <section className="relative isolate flex min-h-64 items-center justify-center overflow-hidden bg-background px-8 py-12 md:min-h-screen" aria-label="Calltrack">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-48 size-[26rem] rounded-full border border-primary/25 md:size-[38rem] md:-left-64 md:-top-64" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-36 size-[26rem] rounded-full border border-primary/15 md:size-[38rem] md:-left-44 md:-top-48" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-48 -bottom-56 size-[26rem] rounded-full border border-primary/20 md:size-[38rem] md:-right-72 md:-bottom-72" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -bottom-44 size-[26rem] rounded-full border border-primary/10 md:size-[38rem] md:-right-52 md:-bottom-56" />
        <img src={logoAsset.url} alt="Calltrack" className="relative z-10 w-full max-w-56 md:max-w-lg object-contain" />
      </section>
      <section className="relative flex min-h-[34rem] flex-col items-center justify-center bg-brand-dark px-4 py-16 md:min-h-screen md:px-8">
        <Card className="w-full max-w-sm p-8 shadow-[var(--shadow-elev)] border-border">
          <div className="flex flex-col items-center mb-7">
            <h1 className="text-2xl font-bold">Entrar</h1>
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
        <footer className="absolute bottom-5 left-4 right-4 flex items-center justify-between gap-4 text-xs text-primary-foreground/60 md:left-8 md:right-8">
          <span>Suporte: fale com o administrador</span>
          <span>Calltrack · Versão web</span>
        </footer>
      </section>
    </main>
  );
}
