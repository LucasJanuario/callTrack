import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-Mhi8TlRK.js";
import { a as useAuth, u as useNavigate, s as supabase, t as toast } from "./router-9ONJ0FYl.js";
import { A as AppHeader, F as FileChartColumn } from "./AppHeader-UXAyoR2W.js";
import { B as Button, C as Card, L as Label, I as Input } from "./card-DeTUBTlv.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-D1UnscYj.js";
import { c as createLucideIcon } from "./phone-CdkVT9dR.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [
  [
    "path",
    {
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "143wyd"
    }
  ],
  ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }],
  ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]
];
const Printer = createLucideIcon("printer", __iconNode);
function RelatorioPage() {
  const {
    user,
    loading
  } = useAuth();
  const nav = useNavigate();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [from, setFrom] = reactExports.useState(today);
  const [to, setTo] = reactExports.useState(today);
  const [employee, setEmployee] = reactExports.useState("all");
  const [canalFilter, setCanalFilter] = reactExports.useState("all");
  const [profiles, setProfiles] = reactExports.useState([]);
  const [calls, setCalls] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!loading && !user) nav({
      to: "/auth"
    });
  }, [loading, user, nav]);
  reactExports.useEffect(() => {
    void loadProfiles();
  }, []);
  reactExports.useEffect(() => {
    void run();
  }, [from, to, employee, canalFilter]);
  async function loadProfiles() {
    const {
      data
    } = await supabase.from("profiles").select("id,full_name").order("full_name");
    setProfiles(data ?? []);
  }
  async function run() {
    let q = supabase.from("calls").select("id,user_id,call_date,ticket,numero,atendimento,canal").gte("call_date", from).lte("call_date", to).order("call_date").order("created_at");
    if (employee !== "all") q = q.eq("user_id", employee);
    if (canalFilter !== "all") q = q.eq("canal", canalFilter);
    const {
      data,
      error
    } = await q;
    if (error) toast.error(error.message);
    else setCalls(data ?? []);
  }
  const nameOf = reactExports.useMemo(() => {
    const m = new Map(profiles.map((p) => [p.id, p.full_name]));
    return (id) => m.get(id) ?? "—";
  }, [profiles]);
  const summary = reactExports.useMemo(() => {
    const byUser = /* @__PURE__ */ new Map();
    for (const c of calls) byUser.set(c.user_id, (byUser.get(c.user_id) ?? 0) + 1);
    return Array.from(byUser.entries()).map(([uid, count]) => ({
      uid,
      name: nameOf(uid),
      count
    })).sort((a, b) => b.count - a.count);
  }, [calls, nameOf]);
  if (loading || !user) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-6xl mx-auto px-4 py-6 space-y-6 print:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 print:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileChartColumn, { className: "size-6" }),
            " Relatório"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Filtre por funcionário, canal e período." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => window.print(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "size-4" }),
          " Imprimir"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 print:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Funcionário" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: employee, onValueChange: setEmployee, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todos" }),
              profiles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.full_name }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Canal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: canalFilter, onValueChange: setCanalFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Fone", children: "Fone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Chat", children: "Chat" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Data início" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Data fim" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden print:block text-center mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold", children: [
          "Relatório ",
          employee === "all" ? "— Todos" : `de ${nameOf(employee)}`,
          canalFilter !== "all" ? ` — ${canalFilter}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "Período: ",
          fmt(from),
          " a ",
          fmt(to)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 lg:col-span-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-3", children: "Resumo quantitativo" }),
          summary.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sem dados." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
            summary.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between border-b last:border-0 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: s.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums", children: s.count })
            ] }, s.uid)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between pt-2 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: calls.length })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[100px_1fr_1.2fr_1fr_80px] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Funcionário" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Número" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Atendimento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Canal" })
          ] }),
          calls.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "Sem registros para o filtro." }) : calls.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[100px_1fr_1.2fr_1fr_80px] px-4 py-2 border-t text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tabular-nums", children: fmt(c.call_date) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: nameOf(c.user_id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", children: c.numero }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: c.atendimento || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: c.canal || "—" })
          ] }, c.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 border-t bg-muted/40 text-sm font-semibold", children: [
            "Total de registros: ",
            calls.length
          ] })
        ] })
      ] })
    ] })
  ] });
}
function fmt(d) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
export {
  RelatorioPage as component
};
