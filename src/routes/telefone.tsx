import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePhone } from "@/hooks/usePhone";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, PhoneOff, Mic, MicOff, Search, UserRound, MonitorUp, MonitorX } from "lucide-react";

export const Route = createFileRoute("/telefone")({
  component: TelefonePage,
  head: () => ({ meta: [
    { title: "Telefone interno — CallTrack" },
    { name: "description", content: "Ligue por voz para outros funcionários conectados ao CallTrack." },
    { property: "og:title", content: "Telefone interno — CallTrack" },
    { property: "og:description", content: "Ligue por voz para outros funcionários conectados ao CallTrack." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function TelefonePage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { status, peer, online, muted, startedAt, call, accept, hangup, toggleMute, sharing, remoteScreen, toggleShare } = usePhone();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current) videoRef.current.srcObject = remoteScreen; }, [remoteScreen]);
  const [q, setQ] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  if (loading || !user) return null;

  const list = online.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const label = {
    idle: "Pronto para ligar",
    calling: "Chamando…",
    ringing: "Ligação recebida",
    connecting: "Conectando…",
    incall: startedAt ? fmt(now - startedAt) : "Em ligação",
  }[status];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase text-primary mb-1">Comunicação interna</p>
          <h1 className="text-2xl font-bold">Telefone</h1>
          <p className="text-sm text-muted-foreground">Ligue por voz para colegas que estão com o sistema aberto.</p>
        </div>

        {remoteScreen && (
          <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
            <div className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground border-b">Tela de {peer?.name}</div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[70vh] bg-brand-dark object-contain" />
          </Card>
        )}
        {sharing && <p className="text-sm text-primary font-semibold">Você está compartilhando sua tela.</p>}

        <div className="grid gap-6 md:grid-cols-[340px_1fr]">
          <Card className="p-6 flex flex-col items-center text-center shadow-[var(--shadow-soft)] bg-brand-dark text-coral-foreground">
            <div className={`size-28 rounded-full flex items-center justify-center bg-coral/20 ${status === "calling" || status === "ringing" ? "animate-pulse" : ""}`}>
              <div className="size-20 rounded-full bg-coral flex items-center justify-center">
                {peer ? <span className="text-3xl font-display font-bold">{peer.name.charAt(0).toUpperCase()}</span> : <Phone className="size-9" />}
              </div>
            </div>
            <p className="mt-5 text-xl font-display font-bold truncate max-w-full">{peer?.name ?? "Nenhuma ligação"}</p>
            <p className="text-sm opacity-75 tabular-nums">{label}</p>

            <div className="mt-6 flex gap-4">
              {status === "ringing" && (
                <Button size="icon" className="size-14 rounded-full bg-success hover:bg-success/85 text-success-foreground" aria-label="Atender" onClick={accept}>
                  <Phone className="size-6" />
                </Button>
              )}
              {(status === "incall" || status === "connecting") && (
                <Button size="icon" variant="secondary" className="size-14 rounded-full" aria-label={muted ? "Ativar microfone" : "Silenciar"} onClick={toggleMute}>
                  {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                </Button>
              )}
              {status === "incall" && (
                <Button size="icon" variant="secondary" className="size-14 rounded-full" aria-label={sharing ? "Parar compartilhamento" : "Compartilhar tela"} title={sharing ? "Parar compartilhamento" : "Compartilhar tela"} onClick={toggleShare}>
                  {sharing ? <MonitorX className="size-6" /> : <MonitorUp className="size-6" />}
                </Button>
              )}
              {status !== "idle" && (
                <Button size="icon" variant="destructive" className="size-14 rounded-full" aria-label="Desligar" onClick={hangup}>
                  <PhoneOff className="size-6" />
                </Button>
              )}
            </div>
          </Card>

          <section>
            <div className="flex items-center justify-between mb-3 gap-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase">Online agora ({online.length})</h2>
              <div className="relative w-48">
                <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="h-9 pl-8" />
              </div>
            </div>
            <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
              {list.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Nenhum colega online no momento.</div>
              ) : list.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-t first:border-t-0">
                  <div className="relative size-9 rounded-full bg-accent flex items-center justify-center">
                    <UserRound className="size-4 text-accent-foreground" />
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success border-2 border-card" />
                  </div>
                  <span className="flex-1 font-semibold truncate">{p.name}</span>
                  <Button size="sm" disabled={status !== "idle"} onClick={() => call(p)} className="bg-coral text-coral-foreground hover:bg-coral/85">
                    <Phone className="size-4" /> Ligar
                  </Button>
                </div>
              ))}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
