import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-Mhi8TlRK.js";
import { u as useNavigate, L as Link, s as supabase, t as toast } from "./router-9ONJ0FYl.js";
import { C as Card, L as Label, I as Input, B as Button } from "./card-DeTUBTlv.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function SetupPage() {
  const nav = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name
        }
      }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Faça login.");
    nav({
      to: "/auth"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-4 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-sm p-8 shadow-[var(--shadow-elev)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold mb-1", children: "Primeiro acesso" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Crie a primeira conta (admin). As próximas contas devem ser criadas pelo admin." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Nome completo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", required: true, value: name, onChange: (e) => setName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Criando..." : "Criar conta" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-xs text-center text-muted-foreground", children: [
      "Já tem conta? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "text-primary hover:underline", children: "Entrar" })
    ] })
  ] }) });
}
export {
  SetupPage as component
};
