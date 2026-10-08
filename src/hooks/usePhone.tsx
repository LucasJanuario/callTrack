import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "calling" | "ringing" | "connecting" | "incall";
export interface Peer { id: string; name: string }

interface PhoneCtx {
  status: Status;
  peer: Peer | null;
  online: Peer[];
  muted: boolean;
  startedAt: number | null;
  call: (p: Peer) => void;
  accept: () => void;
  hangup: () => void;
  toggleMute: () => void;
  sharing: boolean;
  remoteScreen: MediaStream | null;
  toggleShare: () => void;
}

const Ctx = createContext<PhoneCtx | undefined>(undefined);
const ICE = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];

export function PhoneProvider({ children }: { children: ReactNode }) {
  const { user, fullName } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [peer, setPeer] = useState<Peer | null>(null);
  const [online, setOnline] = useState<Peer[]>([]);
  const [muted, setMuted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [remoteScreen, setRemoteScreen] = useState<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const screenSender = useRef<RTCRtpSender | null>(null);

  const chRef = useRef<RealtimeChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef<Status>("idle");
  const peerRef = useRef<Peer | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  statusRef.current = status;
  peerRef.current = peer;

  const send = useCallback((event: string, to: string, payload: Record<string, unknown> = {}) => {
    void chRef.current?.send({ type: "broadcast", event, payload: { ...payload, to, from: user?.id, fromName: fullName ?? "Usuário" } });
  }, [user?.id, fullName]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    screenRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current = null; screenSender.current = null;
    setSharing(false); setRemoteScreen(null);
    pendingIce.current = [];
    if (audioRef.current) audioRef.current.srcObject = null;
    setStatus("idle"); setPeer(null); setMuted(false); setStartedAt(null);
  }, []);

  const makePc = useCallback(async (to: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localRef.current = stream;
    const pc = new RTCPeerConnection({ iceServers: ICE });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => { if (e.candidate) send("ice", to, { candidate: e.candidate.toJSON() }); };
    pc.ontrack = (e) => {
      if (e.track.kind === "video") { setRemoteScreen(new MediaStream([e.track])); e.track.onended = () => setRemoteScreen(null); return; }
      if (audioRef.current) { audioRef.current.srcObject = e.streams[0]; void audioRef.current.play().catch(() => {}); } };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") { setStatus("incall"); setStartedAt(Date.now()); }
      if (pc.connectionState === "failed") { toast.error("A ligação caiu"); cleanup(); }
    };
    pcRef.current = pc;
    return pc;
  }, [send, cleanup]);

  const flushIce = async () => {
    const pc = pcRef.current; if (!pc) return;
    for (const c of pendingIce.current) await pc.addIceCandidate(c).catch(() => {});
    pendingIce.current = [];
  };

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("calltrack-phone", { config: { presence: { key: user.id }, broadcast: { self: false } } });
    chRef.current = ch;

    const refreshOnline = () => {
      const state = ch.presenceState<{ name: string }>();
      setOnline(Object.entries(state).filter(([id]) => id !== user.id).map(([id, metas]) => ({ id, name: metas[0]?.name ?? "Usuário" })));
    };
    ch.on("presence", { event: "sync" }, refreshOnline);
    ch.on("presence", { event: "join" }, refreshOnline);
    ch.on("presence", { event: "leave" }, refreshOnline);

    ch.on("broadcast", { event: "*" }, async ({ event, payload }) => {
      if (payload.to !== user.id) return;
      const from: Peer = { id: payload.from, name: payload.fromName };
      const isPeer = peerRef.current?.id === from.id;
      try {
        if (event === "ring") {
          if (statusRef.current !== "idle") return send("busy", from.id);
          setPeer(from); setStatus("ringing");
        } else if (event === "accept" && isPeer && statusRef.current === "calling") {
          setStatus("connecting");
          const pc = await makePc(from.id);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send("offer", from.id, { sdp: offer });
        } else if (event === "offer" && isPeer && pcRef.current) {
          await pcRef.current.setRemoteDescription(payload.sdp);
          await flushIce();
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          send("answer", from.id, { sdp: answer });
        } else if (event === "answer" && isPeer && pcRef.current) {
          await pcRef.current.setRemoteDescription(payload.sdp);
          await flushIce();
        } else if (event === "ice" && isPeer) {
          const pc = pcRef.current;
          if (pc?.remoteDescription) await pc.addIceCandidate(payload.candidate).catch(() => {});
          else pendingIce.current.push(payload.candidate);
        } else if (event === "share-stop" && isPeer) {
          setRemoteScreen(null);
        } else if (event === "busy" && isPeer) {
          toast.info(`${from.name} está em outra ligação`); cleanup();
        } else if (event === "reject" && isPeer) {
          toast.info(`${from.name} recusou a ligação`); cleanup();
        } else if (event === "hangup" && isPeer) {
          toast.info("Ligação encerrada"); cleanup();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro na ligação"); cleanup();
      }
    });

    const announce = () => { void ch.track({ name: fullName ?? "Usuário" }); };
    ch.subscribe((s) => {
      if (s === "SUBSCRIBED") announce();
      if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") setTimeout(() => { if (chRef.current === ch) ch.subscribe(); }, 3000);
    });
    const onWake = () => { if (document.visibilityState === "visible") { announce(); refreshOnline(); } };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    const heartbeat = setInterval(announce, 30000);
    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      void supabase.removeChannel(ch); chRef.current = null;
    };
  }, [user?.id, fullName]); // eslint-disable-line react-hooks/exhaustive-deps

  const call = (p: Peer) => {
    if (status !== "idle") return;
    setPeer(p); setStatus("calling");
    send("ring", p.id);
  };

  const accept = async () => {
    const p = peerRef.current; if (!p) return;
    try {
      setStatus("connecting");
      await makePc(p.id);
      send("accept", p.id);
    } catch {
      toast.error("Permita o uso do microfone para atender");
      send("reject", p.id); cleanup();
    }
  };

  const hangup = () => {
    const p = peerRef.current;
    if (p) send(statusRef.current === "ringing" ? "reject" : "hangup", p.id);
    cleanup();
  };

  const toggleMute = () => {
    const next = !muted;
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  };

  const renegotiate = async () => {
    const pc = pcRef.current, p = peerRef.current; if (!pc || !p) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    send("offer", p.id, { sdp: offer });
  };

  const stopShare = async () => {
    const pc = pcRef.current;
    screenRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current = null;
    if (pc && screenSender.current) { pc.removeTrack(screenSender.current); screenSender.current = null; await renegotiate(); }
    if (peerRef.current) send("share-stop", peerRef.current.id);
    setSharing(false);
  };

  const toggleShare = async () => {
    if (sharing) return void stopShare();
    const pc = pcRef.current; if (!pc || statusRef.current !== "incall") return;
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = screen.getVideoTracks()[0];
      screenRef.current = screen;
      screenSender.current = pc.addTrack(track, screen);
      track.onended = () => void stopShare();
      setSharing(true);
      await renegotiate();
    } catch {
      toast.error("Não foi possível compartilhar a tela");
    }
  };

  return (
    <Ctx.Provider value={{ status, peer, online, muted, startedAt, call, accept, hangup, toggleMute, sharing, remoteScreen, toggleShare }}>
      {children}
      <audio ref={audioRef} autoPlay className="hidden" />
      {status === "ringing" && peer && (
        <div className="fixed bottom-6 right-6 z-50 w-72 rounded-xl border bg-card p-4 shadow-[var(--shadow-soft)] animate-in slide-in-from-bottom-4">
          <p className="text-xs font-bold uppercase text-primary">Ligação recebida</p>
          <p className="mt-1 text-lg font-display font-bold truncate">{peer.name}</p>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1 bg-success text-success-foreground hover:bg-success/85" onClick={accept}><Phone className="size-4" /> Atender</Button>
            <Button variant="destructive" className="flex-1" onClick={hangup}><PhoneOff className="size-4" /> Recusar</Button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function usePhone() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePhone must be inside PhoneProvider");
  return c;
}
