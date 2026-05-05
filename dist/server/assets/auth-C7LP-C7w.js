import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-Mhi8TlRK.js";
import { a as useAuth, u as useNavigate, L as Link, t as toast } from "./router-9ONJ0FYl.js";
import { C as Card, L as Label, I as Input, B as Button } from "./card-DeTUBTlv.js";
import { P as Phone } from "./phone-CdkVT9dR.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function AuthPage() {
  const {
    signIn,
    user
  } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  if (user) {
    nav({
      to: "/"
    });
  }
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else {
      toast.success("Bem-vindo!");
      nav({
        to: "/"
      });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-4", style: {
    background: "linear-gradient(135deg, oklch(0.97 0.02 250), oklch(0.94 0.05 260))"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-sm p-8 shadow-[var(--shadow-elev)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-xl grid place-items-center text-primary-foreground mb-3", style: {
        background: "var(--gradient-brand)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "CallTrack" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Entre para registrar suas ligações" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Entrando..." : "Entrar" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-xs text-center text-muted-foreground", children: [
      "Sem conta? Peça ao administrador.",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/setup", className: "text-primary hover:underline", children: "Primeiro acesso" })
    ] })
  ] }) });
}
export {
  AuthPage as component
};
