// src/components/DebugDrawer/DebugDrawer.tsx
import { useState, useCallback } from "react";
import {
  useDebugDrawerViewModel,
  GlobalPreset,
} from "../../hooks/useDebugDrawerViewModel";
import { EndpointBlock } from "./EndpointBlock";
import { MockScenario } from "../../mocks/types";

const IS_DEV = import.meta.env.DEV;

// ─── FAB ─────────────────────────────────────────────────────────────────

function DebugFab({
  status,
  onClick,
}: {
  status: "ok" | "warn" | "error" | "off";
  onClick: () => void;
}) {
  const badgeCls =
    status === "error"
      ? "bg-red-500 text-white"
      : status === "warn"
        ? "bg-amber-500 text-white"
        : status === "ok"
          ? "bg-emerald-500 text-white"
          : "bg-surface3 border border-border2 text-muted";
  const badgeChar =
    status === "error"
      ? "!"
      : status === "warn"
        ? "…"
        : status === "ok"
          ? "✓"
          : "—";

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-surface border border-border shadow-lg flex items-center justify-center hover:shadow-xl hover:border-accent/40 transition-all group"
      title="Open MSW Debug Drawer"
    >
      <svg
        style={{ width: "18px", height: "18px" }}
        className="text-muted group-hover:text-accent transition-colors"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
      <span
        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${badgeCls} border-2 border-bg flex items-center justify-center text-[8px] font-bold`}
      >
        {badgeChar}
      </span>
    </button>
  );
}

// ─── Mock toggle ──────────────────────────────────────────────────────────

function MockToggleRow({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-5 py-3 border-b border-border hover:bg-surface2 transition-colors text-left"
    >
      <div
        className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${enabled ? "bg-accent" : "bg-surface3 border border-border2"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? "left-[18px]" : "left-0.5"}`}
        />
      </div>
      <div className="flex-1">
        <p
          className={`text-xs font-semibold transition-colors ${enabled ? "text-accent" : "text-muted"}`}
        >
          {enabled ? "Mock ativo" : "Mock inativo"}
        </p>
        <p className="font-mono text-[10px] text-muted mt-0.5">
          {enabled
            ? "interceptando requisições"
            : "requisições indo para a API real"}
        </p>
      </div>
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${enabled ? "bg-accent" : "bg-border2"}`}
      />
    </button>
  );
}

// ─── Global preset strip ─────────────────────────────────────────────────

function GlobalStrip({
  active,
  disabled,
  onSelect,
}: {
  active: GlobalPreset;
  disabled: boolean;
  onSelect: (p: "success" | "error" | "loading") => void;
}) {
  const btns = [
    {
      id: "success" as const,
      label: "all success",
      dot: "bg-emerald-500",
      activeCls: "bg-emerald-50 border-emerald-400 text-emerald-700",
    },
    {
      id: "loading" as const,
      label: "all loading",
      dot: "bg-amber-500",
      activeCls: "bg-amber-50 border-amber-400 text-amber-700",
    },
    {
      id: "error" as const,
      label: "all error",
      dot: "bg-red-500",
      activeCls: "bg-red-50 border-red-400 text-red-600",
    },
  ];
  return (
    <div
      className={`flex gap-1.5 px-5 py-2.5 border-b border-border transition-opacity duration-200 ${disabled ? "opacity-40 pointer-events-none select-none" : ""}`}
    >
      {btns.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onSelect(btn.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border font-mono text-[9px] font-semibold tracking-wide transition-all
            ${active === btn.id ? btn.activeCls : "border-border bg-surface2 text-muted hover:border-border2 hover:text-tx"}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${btn.dot}`} />
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// ─── DebugDrawer ──────────────────────────────────────────────────────────

export function DebugDrawer() {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const vm = useDebugDrawerViewModel();

  const handleApply = useCallback(() => {
    vm.applyChanges();
    setApplied(true);
    setTimeout(() => setApplied(false), 1200);
  }, [vm]);

  if (!IS_DEV) return null;

  const hasEndpoints = vm.endpoints.length > 0;

  return (
    <>
      <DebugFab status={vm.fabStatus} onClick={() => setOpen(true)} />

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[82vh] bg-surface rounded-t-2xl border-t border-border flex flex-col animate-slide-up shadow-2xl">
            <div className="w-9 h-1 bg-border2 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center text-sm">
                  ⚡
                </div>
                <div>
                  <p className="text-sm font-semibold text-tx">MSW Debug</p>
                  {/* Current route badge */}
                  {vm.currentPageId ? (
                    <p className="font-mono text-[10px] text-accent font-semibold">
                      {vm.currentPageId}
                    </p>
                  ) : (
                    <p className="font-mono text-[10px] text-muted">
                      nenhuma página registrada
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-tx hover:border-border2 transition-colors text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Mock toggle */}
            <MockToggleRow
              enabled={vm.mockEnabled}
              onToggle={vm.toggleMockEnabled}
            />

            {/* No page registered yet */}
            {!hasEndpoints ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center px-8">
                <div className="w-10 h-10 rounded-xl bg-surface2 border border-border flex items-center justify-center text-lg">
                  📭
                </div>
                <p className="text-sm font-medium text-tx">
                  Nenhum endpoint registrado
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  Navegue para uma página que usa{" "}
                  <code className="font-mono bg-surface2 px-1 py-0.5 rounded text-[10px]">
                    useRegisterMockEndpoints
                  </code>{" "}
                  para ver os endpoints aqui.
                </p>
              </div>
            ) : (
              <>
                {/* Global strip */}
                <GlobalStrip
                  active={vm.globalPreset}
                  disabled={!vm.mockEnabled}
                  onSelect={vm.applyGlobalPreset}
                />

                {/* Section label */}
                <div
                  className={`flex items-center justify-between px-5 pt-3 pb-1.5 flex-shrink-0 transition-opacity duration-200 ${!vm.mockEnabled ? "opacity-40" : ""}`}
                >
                  <span className="font-mono text-[9px] text-muted tracking-widest uppercase">
                    endpoints · {vm.endpoints.length}
                  </span>
                  {vm.pendingChanges && vm.mockEnabled && (
                    <span className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                      unsaved
                    </span>
                  )}
                </div>

                {/* Endpoint list */}
                <div
                  className={`flex-1 overflow-y-auto px-5 pb-3 space-y-2.5 transition-opacity duration-200 ${!vm.mockEnabled ? "opacity-40 pointer-events-none" : ""}`}
                >
                  {vm.endpoints.map((ep) => (
                    <EndpointBlock
                      key={ep.id}
                      endpoint={ep}
                      expanded={vm.expandedIds.has(ep.id)}
                      onToggle={() => vm.toggleEndpoint(ep.id)}
                      onSelectScenario={(scenario: MockScenario) =>
                        vm.selectScenario(ep.id, scenario)
                      }
                    />
                  ))}
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 py-4 border-t border-border flex-shrink-0">
                  <button
                    onClick={vm.resetAll}
                    className="flex-1 py-2.5 rounded-xl border border-border2 bg-surface2 text-sm font-medium text-muted hover:text-tx hover:border-border transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!vm.pendingChanges || !vm.mockEnabled}
                    className={`flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${
                        applied
                          ? "bg-emerald-500 text-white"
                          : vm.pendingChanges && vm.mockEnabled
                            ? "bg-accent hover:opacity-90 text-white"
                            : "bg-surface3 border border-border text-muted cursor-not-allowed"
                      }`}
                  >
                    {applied ? "Applied ✓" : "Apply & reload"}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
