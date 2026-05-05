import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-Mhi8TlRK.js";
import { a as useAuth, u as useNavigate, s as supabase, t as toast } from "./router-9ONJ0FYl.js";
import { A as AppHeader } from "./AppHeader-UXAyoR2W.js";
import { L as Label, I as Input, C as Card, B as Button } from "./card-DeTUBTlv.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, C as Check } from "./select-D1UnscYj.js";
import { P as Phone } from "./phone-CdkVT9dR.js";
import { P as Plus, X, a as Pencil, T as Trash2 } from "./x-BWET7DtC.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function IndexPage() {
  const {
    user,
    loading
  } = useAuth();
  const nav = useNavigate();
  const [date, setDate] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [calls, setCalls] = reactExports.useState([]);
  const [ticket, setTicket] = reactExports.useState("");
  const [numero, setNumero] = reactExports.useState("");
  const [atendimento, setAtendimento] = reactExports.useState("");
  const [canal, setCanal] = reactExports.useState("Fone");
  const [busy, setBusy] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const [editTicket, setEditTicket] = reactExports.useState("");
  const [editNumero, setEditNumero] = reactExports.useState("");
  const [editAtendimento, setEditAtendimento] = reactExports.useState("");
  const [editCanal, setEditCanal] = reactExports.useState("Fone");
  reactExports.useEffect(() => {
    if (!loading && !user) nav({
      to: "/auth"
    });
  }, [loading, user, nav]);
  reactExports.useEffect(() => {
    if (!user) return;
    void load();
  }, [user, date]);
  async function load() {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("calls").select("id,ticket,numero,atendimento,canal,call_date,created_at").eq("user_id", user.id).eq("call_date", date).order("created_at", {
      ascending: true
    });
    if (error) toast.error(error.message);
    else setCalls(data ?? []);
  }
  async function add(e) {
    e.preventDefault();
    if (!user || !numero.trim()) return;
    setBusy(true);
    const {
      error
    } = await supabase.from("calls").insert({
      user_id: user.id,
      call_date: date,
      ticket: ticket.trim() || null,
      numero: numero.trim(),
      atendimento: atendimento.trim() || null,
      canal
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setTicket("");
    setNumero("");
    setAtendimento("");
    setCanal("Fone");
    void load();
  }
  async function remove(id) {
    const {
      error
    } = await supabase.from("calls").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  }
  function startEdit(c) {
    setEditId(c.id);
    setEditTicket(c.ticket ?? "");
    setEditNumero(c.numero);
    setEditAtendimento(c.atendimento ?? "");
    setEditCanal(c.canal ?? "Fone");
  }
  function cancelEdit() {
    setEditId(null);
  }
  async function saveEdit(id) {
    if (!editNumero.trim()) return toast.error("Número é obrigatório");
    const {
      error
    } = await supabase.from("calls").update({
      ticket: editTicket.trim() || null,
      numero: editNumero.trim(),
      atendimento: editAtendimento.trim() || null,
      canal: editCanal
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
    setEditId(null);
    void load();
  }
  if (loading || !user) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-6xl mx-auto px-4 py-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Minhas ligações" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Registre as ligações atendidas no dia." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "date", className: "text-xs", children: "Data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "date", type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-44" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "px-4 py-2 flex items-center gap-3 shadow-[var(--shadow-soft)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-md grid place-items-center text-primary-foreground", style: {
              background: "var(--gradient-brand)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total no dia" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold leading-none", children: calls.length })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: add, className: "grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_130px_auto] gap-3 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ticket", className: "text-xs", children: "Ticket" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "ticket", className: "h-10", value: ticket, onChange: (e) => setTicket(e.target.value), placeholder: "opcional" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "numero", className: "text-xs", children: "Número *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "numero", className: "h-10", required: true, value: numero, onChange: (e) => setNumero(e.target.value), placeholder: "ex: 30534-83996952205" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "atendimento", className: "text-xs", children: "Atendimento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "atendimento", className: "h-10", value: atendimento, onChange: (e) => setAtendimento(e.target.value), placeholder: "ex: encaminhado para s2" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "canal", className: "text-xs", children: "Canal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: canal, onValueChange: setCanal, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "canal", className: "h-10 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Fone", children: "Fone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Chat", children: "Chat" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy, className: "h-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
          " Adicionar"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[60px_120px_1fr_1fr_90px_96px] bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground px-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Ticket" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Número" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Atendimento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Canal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
        ] }),
        calls.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "Nenhuma ligação registrada nesta data." }) : calls.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[60px_120px_1fr_1fr_90px_96px] items-center px-4 py-2.5 border-t text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: i + 1 }),
          editId === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editTicket, onChange: (e) => setEditTicket(e.target.value), placeholder: "opcional", className: "h-7 text-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editNumero, onChange: (e) => setEditNumero(e.target.value), required: true, className: "h-7 text-sm font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editAtendimento, onChange: (e) => setEditAtendimento(e.target.value), className: "h-7 text-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editCanal, onValueChange: setEditCanal, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Fone", children: "Fone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Chat", children: "Chat" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => saveEdit(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 text-green-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: cancelEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4 text-muted-foreground" }) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: c.ticket || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", children: c.numero }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: c.atendimento || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: c.canal || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => startEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 text-destructive" }) })
            ] })
          ] })
        ] }, c.id))
      ] })
    ] })
  ] });
}
export {
  IndexPage as component
};
