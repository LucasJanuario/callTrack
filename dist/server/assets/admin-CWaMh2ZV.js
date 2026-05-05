import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry-Mhi8TlRK.js";
import { a as useAuth, u as useNavigate, s as supabase, t as toast } from "./router-9ONJ0FYl.js";
import { A as AppHeader } from "./AppHeader-UXAyoR2W.js";
import { c as cn, a as cva, C as Card, L as Label, I as Input, B as Button } from "./card-DeTUBTlv.js";
import { c as createLucideIcon } from "./phone-CdkVT9dR.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
function AdminPage() {
  const {
    user,
    role,
    loading
  } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = reactExports.useState([]);
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) nav({
      to: "/auth"
    });
    else if (role && role !== "admin") nav({
      to: "/"
    });
  }, [user, role, loading, nav]);
  reactExports.useEffect(() => {
    if (role === "admin") void load();
  }, [role]);
  async function load() {
    const [{
      data: profiles
    }, {
      data: roles
    }] = await Promise.all([supabase.from("profiles").select("id,full_name").order("full_name"), supabase.from("user_roles").select("user_id,role")]);
    const roleMap = /* @__PURE__ */ new Map();
    roles?.forEach((r) => {
      if (r.role === "admin") roleMap.set(r.user_id, "admin");
      else if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, "employee");
    });
    setRows((profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: roleMap.get(p.id) ?? "employee"
    })));
  }
  async function add(e) {
    e.preventDefault();
    setBusy(true);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Funcionário cadastrado!");
    setName("");
    setEmail("");
    setPassword("");
    setTimeout(load, 500);
  }
  if (loading || role !== "admin") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-5xl mx-auto px-4 py-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Funcionários" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre e gerencie quem pode acessar o sistema." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-4" }),
          " Cadastrar funcionário"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: add, className: "grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_auto] gap-3 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Nome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: name, onChange: (e) => setName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "E-mail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Senha provisória" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", minLength: 6, required: true, value: password, onChange: (e) => setPassword(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy, children: busy ? "Criando..." : "Cadastrar" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_120px] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Função" })
        ] }),
        rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_120px] px-4 py-3 border-t items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: r.full_name || "(sem nome)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.role === "admin" ? "default" : "secondary", children: r.role === "admin" ? "Admin" : "Funcionário" })
        ] }, r.id))
      ] })
    ] })
  ] });
}
export {
  AdminPage as component
};
