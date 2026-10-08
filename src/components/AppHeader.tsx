import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoAsset from "@/assets/calltrack-logo.png.asset.json";
import { Phone, LogOut, FileBarChart2, Users, StickyNote, Sun, Moon, BarChart3, PhoneCall } from "lucide-react";

interface AppHeaderProps {
  date?: string;
  onDateChange?: (date: string) => void;
}

export function AppHeader({ date, onDateChange }: AppHeaderProps) {
  const { fullName, role, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  return (
    <header className="border-b bg-card sticky top-0 z-40 shadow-[var(--shadow-soft)]">
      <div className="max-w-7xl mx-auto px-4 min-h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-2">
        <Link to="/" className="flex items-center shrink-0" aria-label="Calltrack — início">
          <img src={logoAsset.url} alt="Calltrack" className="h-11 w-auto max-w-32 object-contain" />
        </Link>
        <nav className="col-span-3 order-3 md:col-span-1 md:order-none flex items-center justify-start md:justify-center gap-1 overflow-x-auto whitespace-nowrap pb-1 md:pb-0 min-w-0">
          <Link to="/" activeOptions={{ exact: true }} className="px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><Phone className="size-4" /> Ligações</span>
          </Link>
          <Link to="/telefone" className="px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><PhoneCall className="size-4" /> Telefone</span>
          </Link>
          <Link to="/relatorio" className="px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><FileBarChart2 className="size-4" /> Relatório</span>
          </Link>
          {role === "admin" && (
            <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> Funcionários</span>
            </Link>
          )}
          <Link to="/anotacoes" className="px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><StickyNote className="size-4" /> Anotações</span>
          </Link>
          <Link to="/produtividade" className="px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><BarChart3 className="size-4" /> Produtividade</span>
          </Link>
        </nav>
        <div className="flex items-center gap-2 shrink-0 justify-self-end">
          {onDateChange && (
            <Input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="hidden lg:block h-9 w-auto text-sm px-2 bg-muted border-0"
            />
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-tight">{fullName ?? "Usuário"}</div>
            <div className="text-xs text-muted-foreground capitalize">{role === "admin" ? "Administrador" : "Funcionário"}</div>
          </div>
          <Button variant="outline" size="icon" aria-label="Sair" title="Sair" onClick={async () => { await signOut(); nav({ to: "/auth" }); }}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
