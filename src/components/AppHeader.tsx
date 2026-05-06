import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Phone, LogOut, FileBarChart2, Users, StickyNote, Sun, Moon } from "lucide-react";

export function AppHeader() {
  const { fullName, role, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  return (
    <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="size-8 rounded-md grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>
            <Phone className="size-4" />
          </div>
          <span>CallTrack</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" activeOptions={{ exact: true }} className="px-3 py-1.5 rounded-md text-sm hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><Phone className="size-4" /> Ligações</span>
          </Link>
          <Link to="/relatorio" className="px-3 py-1.5 rounded-md text-sm hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><FileBarChart2 className="size-4" /> Relatório</span>
          </Link>
          {role === "admin" && (
            <Link to="/admin" className="px-3 py-1.5 rounded-md text-sm hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> Funcionários</span>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-tight">{fullName ?? "Usuário"}</div>
            <div className="text-xs text-muted-foreground capitalize">{role === "admin" ? "Administrador" : "Funcionário"}</div>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); nav({ to: "/auth" }); }}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
