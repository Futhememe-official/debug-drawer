// src/components/LiveDemo.tsx
import { useState } from "react";

type Scenario = "success" | "error" | "loading" | "not_found";
type Tab = "preview" | "code";

const scenarios: {
  id: Scenario;
  label: string;
  desc: string;
  code: number | null;
}[] = [
  {
    id: "success",
    label: "Success",
    desc: "Returns array of users",
    code: 200,
  },
  {
    id: "error",
    label: "Server error",
    desc: "Internal server error",
    code: 500,
  },
  {
    id: "loading",
    label: "Loading",
    desc: "Infinite pending state",
    code: null,
  },
  {
    id: "not_found",
    label: "Not found",
    desc: "Empty state / no users",
    code: 404,
  },
];

const users = [
  { id: 1, name: "Gustavo Silva", role: "developer" },
  { id: 2, name: "Ana Martins", role: "designer" },
];

const CODE = `// 1. Define endpoints and handlers
export const teamEndpoints: EndpointConfig[] = [
  {
    id: 'GET /users',
    method: 'GET',
    path: '/users',
    selectedScenario: 'success',
    options: [
      { id: 'success', label: 'Success',      scenario: 'success', statusCode: 200 },
      { id: 'error',   label: 'Server error', scenario: 'error',   statusCode: 500 },
      { id: 'loading', label: 'Loading',      scenario: 'loading', statusCode: null },
    ],
  },
]

// 2. Register in your view
export function TeamView() {
  useRegisterMockEndpoints({
    pageId: '/team',
    endpoints: teamEndpoints,
    handlers: teamHandlers,
  })
  // ...
}`;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const roleStyle: Record<string, string> = {
  developer: "bg-blue-50 text-blue-600",
  designer: "bg-violet-50 text-violet-600",
};

function AppPreview({ scenario }: { scenario: Scenario }) {
  if (scenario === "loading") {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white border border-canvas-border rounded-xl px-4 py-3 animate-pulse"
          >
            <div className="w-9 h-9 rounded-full bg-canvas-surface" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 bg-canvas-surface rounded" />
              <div className="h-2 w-16 bg-canvas-surface rounded" />
            </div>
            <div className="h-5 w-14 bg-canvas-surface rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (scenario === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg">
          ⚠
        </div>
        <p className="text-sm font-medium text-red-600">Request failed</p>
        <p className="font-mono text-xs text-canvas-muted">
          Error 500: Internal server error
        </p>
        <button className="px-3 py-1.5 text-xs font-medium bg-white border border-canvas-border rounded-lg text-canvas-tx hover:bg-canvas-surface transition-colors">
          Try again
        </button>
      </div>
    );
  }

  if (scenario === "not_found") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-canvas-surface border border-canvas-border flex items-center justify-center text-lg">
          👤
        </div>
        <p className="text-sm text-canvas-muted">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 bg-white border border-canvas-border rounded-xl px-4 py-3 hover:border-canvas-border2 transition-colors"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleStyle[user.role] ?? "bg-canvas-surface text-canvas-muted"}`}
          >
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-canvas-tx">{user.name}</p>
            <p className="text-xs text-canvas-muted capitalize">{user.role}</p>
          </div>
          <span
            className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleStyle[user.role] ?? ""}`}
          >
            {user.role}
          </span>
        </div>
      ))}
    </div>
  );
}

function DrawerPanel({
  scenario,
  onSelect,
}: {
  scenario: Scenario;
  onSelect: (s: Scenario) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [mockOn, setMockOn] = useState(true);

  const current = scenarios.find((s) => s.id === scenario)!;
  const statusCls =
    scenario === "success"
      ? "text-emerald-700 bg-emerald-50"
      : scenario === "loading"
        ? "text-amber-700 bg-amber-50"
        : "text-red-700 bg-red-50";

  return (
    <div
      className="border border-canvas-border rounded-xl overflow-hidden bg-white shadow-lg text-left"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* handle */}
      <div className="w-8 h-1 bg-canvas-border rounded-full mx-auto mt-3 mb-1" />

      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-canvas-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-xs">
            ⚡
          </div>
          <div>
            <p className="text-xs font-semibold text-canvas-tx">MSW Debug</p>
            <p className="font-mono text-[9px] text-[#FF5623] font-semibold">
              /team
            </p>
          </div>
        </div>
        <div className="w-6 h-6 rounded-lg bg-canvas-surface border border-canvas-border flex items-center justify-center text-[10px] font-semibold text-canvas-muted cursor-pointer">
          ✕
        </div>
      </div>

      {/* toggle */}
      <button
        onClick={() => setMockOn((m) => !m)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 border-b border-canvas-border hover:bg-canvas-bg transition-colors"
      >
        <div
          className={`relative w-8 h-4 rounded-full flex-shrink-0 transition-colors ${mockOn ? "bg-[#FF5623]" : "bg-canvas-surface border border-canvas-border2"}`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${mockOn ? "left-[18px]" : "left-0.5"}`}
          />
        </div>
        <div>
          <p
            className={`text-[10px] font-semibold ${mockOn ? "text-[#FF5623]" : "text-canvas-muted"}`}
          >
            {mockOn ? "Mock ativo" : "Mock inativo"}
          </p>
          <p className="font-mono text-[9px] text-canvas-muted">
            {mockOn ? "interceptando requisições" : "API real"}
          </p>
        </div>
      </button>

      {/* global presets */}
      <div className="flex gap-1.5 px-4 py-2 border-b border-canvas-border">
        {["all success", "all loading", "all error"].map((b) => (
          <button
            key={b}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border border-canvas-border bg-canvas-surface font-mono text-[8px] font-semibold text-canvas-muted hover:border-canvas-border2 hover:text-canvas-tx transition-colors"
          >
            <span
              className={`w-1 h-1 rounded-full ${b.includes("success") ? "bg-emerald-500" : b.includes("loading") ? "bg-amber-500" : "bg-red-500"}`}
            />
            {b}
          </button>
        ))}
      </div>

      {/* section label */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1.5">
        <span className="font-mono text-[8px] text-canvas-muted tracking-widest uppercase">
          endpoints · 1
        </span>
      </div>

      {/* endpoint block */}
      <div className="px-4 pb-4">
        <div className="border border-canvas-border rounded-lg overflow-hidden">
          {/* ep header */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-canvas-bg transition-colors"
          >
            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
              GET
            </span>
            <span className="flex-1 font-mono text-[10px] text-canvas-tx text-left">
              /users
            </span>
            <span
              className={`font-mono text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${statusCls}`}
            >
              {current.code ?? "…"}
            </span>
            <span
              className={`text-canvas-muted text-sm transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`}
            >
              ›
            </span>
          </button>

          {expanded && (
            <div className="border-t border-canvas-border">
              {scenarios.map((s, i) => {
                const sel = scenario === s.id;
                const dotCls =
                  s.id === "loading"
                    ? "border-amber-500 bg-amber-50"
                    : s.code && s.code < 300
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-500 bg-red-50";
                const innerDot =
                  s.id === "loading"
                    ? "bg-amber-500"
                    : s.code && s.code < 300
                      ? "bg-emerald-500"
                      : "bg-red-500";
                return (
                  <div key={s.id}>
                    {i > 0 && <div className="h-px bg-canvas-border" />}
                    <button
                      onClick={() => onSelect(s.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-canvas-bg ${sel ? "bg-canvas-bg" : ""}`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${sel ? dotCls : "border-canvas-border2"}`}
                      >
                        {sel && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${innerDot}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-canvas-tx">
                          {s.label}
                        </p>
                        <p className="font-mono text-[9px] text-canvas-muted truncate">
                          {s.desc}
                        </p>
                      </div>
                      {s.id === "loading" ? (
                        <span className="w-3 h-3 rounded-full border-2 border-canvas-border border-t-amber-500 animate-spin flex-shrink-0" />
                      ) : (
                        <span
                          className={`font-mono text-[9px] font-semibold px-1 py-0.5 rounded border flex-shrink-0 ${s.code && s.code < 300 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}
                        >
                          {s.code}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
              <div className="bg-canvas-surface border-t border-canvas-border px-3 py-2">
                <p className="font-mono text-[8px] text-canvas-muted tracking-widest uppercase mb-1">
                  Response preview
                </p>
                <pre className="font-mono text-[9px] text-blue-600 leading-relaxed overflow-x-auto">
                  {scenario === "success"
                    ? '[{ id: 1, name: "Gustavo" }, ...]'
                    : scenario === "error"
                      ? '{ message: "Internal server error" }'
                      : scenario === "loading"
                        ? "// pending..."
                        : '{ message: "Not found", code: 404 }'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div className="flex gap-2 px-4 py-3 border-t border-canvas-border">
        <button className="flex-1 py-2 rounded-lg border border-canvas-border2 bg-canvas-surface text-xs font-medium text-canvas-muted hover:text-canvas-tx transition-colors">
          Reset
        </button>
        <button
          onClick={() => {}}
          className="flex-[2] py-2 rounded-lg text-xs font-semibold text-white transition-all"
          style={{ background: "#FF5623" }}
        >
          Apply & reload
        </button>
      </div>
    </div>
  );
}

export function LiveDemo() {
  const [scenario, setScenario] = useState<Scenario>("success");
  const [tab, setTab] = useState<Tab>("preview");

  return (
    <div className="rounded-xl border border-canvas-border overflow-hidden bg-canvas-bg">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-canvas-border px-4 pt-3">
        {(["preview", "code"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              tab === t
                ? "border-canvas-tx text-canvas-tx"
                : "border-transparent text-canvas-muted hover:text-canvas-tx"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "preview" ? (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Simulated app */}
            <div>
              <p className="font-mono text-[9px] text-canvas-muted tracking-widest uppercase mb-3">
                app output
              </p>
              <div className="bg-canvas-bg border border-canvas-border rounded-xl p-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="font-mono text-[9px] text-canvas-muted uppercase tracking-widest">
                      members
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-canvas-tx">Team</h2>
                </div>
                <AppPreview scenario={scenario} />
              </div>
            </div>

            {/* Simulated drawer */}
            <div>
              <p className="font-mono text-[9px] text-canvas-muted tracking-widest uppercase mb-3">
                debug drawer
              </p>
              <DrawerPanel scenario={scenario} onSelect={setScenario} />
            </div>
          </div>

          <p className="text-center font-mono text-[10px] text-canvas-muted mt-4">
            ↑ click a scenario in the drawer to see the app react
          </p>
        </div>
      ) : (
        <div className="p-4">
          <pre className="font-mono text-[12px] leading-relaxed text-canvas-tx overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(CODE) }} />
          </pre>
        </div>
      )}
    </div>
  );
}

function syntaxHighlight(code: string) {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
      '<span style="color:#16a34a">$1</span>',
    )
    .replace(
      /(\/\/[^\n]*)/g,
      '<span style="color:#9ca3af;font-style:italic">$1</span>',
    )
    .replace(
      /\b(import|export|from|const|let|function|async|await|return|type|interface)\b/g,
      '<span style="color:#7c3aed">$1</span>',
    )
    .replace(
      /\b([A-Z][a-zA-Z0-9]*)\b/g,
      '<span style="color:#0369a1">$1</span>',
    )
    .replace(
      /\b([a-z][a-zA-Z0-9]*)(?=\s*\()/g,
      '<span style="color:#d97706">$1</span>',
    );
}
