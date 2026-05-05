import { U as jsxRuntimeExports } from "./worker-entry-Mhi8TlRK.js";
import { a as useAuth, u as useNavigate, L as Link } from "./router-9ONJ0FYl.js";
import { B as Button } from "./card-DeTUBTlv.js";
import { c as createLucideIcon, P as Phone } from "./phone-CdkVT9dR.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M8 18v-1", key: "zg0ygc" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "M16 18v-3", key: "j5jt4h" }]
];
const FileChartColumn = createLucideIcon("file-chart-column", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
function AppHeader() {
  const { fullName, role, signOut } = useAuth();
  const nav = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b bg-card/80 backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-md grid place-items-center text-primary-foreground", style: { background: "var(--gradient-brand)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "CallTrack" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", activeOptions: { exact: true }, className: "px-3 py-1.5 rounded-md text-sm hover:bg-accent", activeProps: { className: "bg-accent text-accent-foreground" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4" }),
        " Ligações"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/relatorio", className: "px-3 py-1.5 rounded-md text-sm hover:bg-accent", activeProps: { className: "bg-accent text-accent-foreground" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileChartColumn, { className: "size-4" }),
        " Relatório"
      ] }) }),
      role === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", className: "px-3 py-1.5 rounded-md text-sm hover:bg-accent", activeProps: { className: "bg-accent text-accent-foreground" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4" }),
        " Funcionários"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right hidden sm:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium leading-tight", children: fullName ?? "Usuário" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground capitalize", children: role === "admin" ? "Administrador" : "Funcionário" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: async () => {
        await signOut();
        nav({ to: "/auth" });
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }) })
    ] })
  ] }) });
}
export {
  AppHeader as A,
  FileChartColumn as F
};
