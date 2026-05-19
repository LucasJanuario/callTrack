import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "employee";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: Role | null;
  fullName: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayStr = () => new Date().toISOString().slice(0, 10);

    const checkDailyExpiry = async (s: Session | null) => {
      if (!s?.user) return false;
      const storedDay = localStorage.getItem("auth_login_day");
      if (storedDay && storedDay !== todayStr()) {
        await supabase.auth.signOut();
        localStorage.removeItem("auth_login_day");
        return true;
      }
      if (!storedDay) localStorage.setItem("auth_login_day", todayStr());
      return false;
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === "SIGNED_IN" && s?.user) {
        localStorage.setItem("auth_login_day", todayStr());
      }
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("auth_login_day");
      }
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
      else { setRole(null); setFullName(null); }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      const expired = await checkDailyExpiry(data.session);
      if (expired) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    // Verifica também quando a aba volta a ficar visível (usuário chega de manhã)
    const onVisibility = async () => {
      if (document.visibilityState === "visible") {
        const { data } = await supabase.auth.getSession();
        await checkDailyExpiry(data.session);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  async function loadProfile(uid: string) {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setFullName(prof?.full_name ?? null);
    const r = roles?.find((x) => x.role === "admin") ? "admin" : "employee";
    setRole(r);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <Ctx.Provider value={{ user, session, role, fullName, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
