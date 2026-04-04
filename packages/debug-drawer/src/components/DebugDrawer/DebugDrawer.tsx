// src/components/DebugDrawer/DebugDrawer.tsx
import { useState, useCallback, useEffect } from "react";
import { Drawer } from "vaul";
import type { SetupWorker } from "msw/browser";
import {
  useDebugDrawerStore,
  selectCurrentEndpoints,
  selectFabStatus,
  type GlobalPreset,
} from "../../store/debugDrawerStore";
import { EndpointBlock } from "./EndpointBlock";
import type { MockScenario } from "../../mocks/types";
import "./drawer.css";
import { useShallow } from "zustand/shallow";

interface DebugDrawerProps {
  /** The MSW browser worker instance — pass the result of setupWorker() */
  worker: SetupWorker;
  /**
   * Show the drawer only when true.
   * Defaults to true — pass `import.meta.env.DEV` or `process.env.NODE_ENV !== 'production'`
   * to limit visibility to development.
   */
  enabled?: boolean;
}

// ─── FAB ─────────────────────────────────────────────────────────────────
function DebugFab({
  status,
  onClick,
}: {
  status: "ok" | "warn" | "error" | "off";
  onClick: () => void;
}) {
  const cls =
    status === "error"
      ? "mswd-badge mswd-badge--error"
      : status === "warn"
        ? "mswd-badge mswd-badge--warn"
        : status === "ok"
          ? "mswd-badge mswd-badge--ok"
          : "mswd-badge mswd-badge--off";
  const char =
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
      className="mswd-fab"
      title="Open MSW Debug Drawer"
      aria-label="Open MSW Debug Drawer"
    >
      <svg
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
      <span className={cls} aria-hidden="true">
        {char}
      </span>
    </button>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────

function MockToggleRow({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="mswd-toggle-row" type="button">
      <div className={`mswd-track ${enabled ? "mswd-track--on" : ""}`}>
        <div className={`mswd-thumb ${enabled ? "mswd-thumb--on" : ""}`} />
      </div>
      <div className="mswd-toggle-labels">
        <p
          className={`mswd-toggle-title ${enabled ? "mswd-toggle-title--on" : ""}`}
        >
          {enabled ? "Mock ativo" : "Mock inativo"}
        </p>
        <p className="mswd-toggle-sub">
          {enabled
            ? "interceptando requisições"
            : "requisições indo para a API real"}
        </p>
      </div>
      <span className={`mswd-dot ${enabled ? "mswd-dot--on" : ""}`} />
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
      cls: "mswd-preset-btn--success",
    },
    {
      id: "loading" as const,
      label: "all loading",
      cls: "mswd-preset-btn--loading",
    },
    { id: "error" as const, label: "all error", cls: "mswd-preset-btn--error" },
  ];
  return (
    <div
      className={`mswd-global-strip ${disabled ? "mswd-global-strip--disabled" : ""}`}
    >
      {btns.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onSelect(b.id)}
          className={`mswd-preset-btn ${active === b.id ? b.cls : ""}`}
        >
          <span className={`mswd-preset-dot mswd-preset-dot--${b.id}`} />
          {b.label}
        </button>
      ))}
    </div>
  );
}

// ─── DebugDrawer ──────────────────────────────────────────────────────────

export function DebugDrawer({ worker, enabled = true }: DebugDrawerProps) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const setWorker = useDebugDrawerStore((s) => s._setWorker);

  useEffect(() => {
    setWorker(worker);
  }, [worker]);

  const {
    endpoints,
    expandedIds,
    globalPreset,
    pendingChanges,
    mockEnabled,
    currentPageId,
    fabStatus,
  } = useDebugDrawerStore(
    useShallow((s) => ({
      endpoints: selectCurrentEndpoints(s),
      expandedIds: s.expandedIds,
      globalPreset: s.globalPreset,
      pendingChanges: s.pendingChanges,
      mockEnabled: s.mockEnabled,
      currentPageId: s.currentPageId,
      fabStatus: selectFabStatus(s),
    })),
  );

  const toggleMockEnabled = useDebugDrawerStore((s) => s.toggleMockEnabled);
  const toggleEndpoint = useDebugDrawerStore((s) => s.toggleEndpoint);
  const selectScenario = useDebugDrawerStore((s) => s.selectScenario);
  const applyGlobalPreset = useDebugDrawerStore((s) => s.applyGlobalPreset);
  const applyChanges = useDebugDrawerStore((s) => s.applyChanges);
  const resetCurrentPage = useDebugDrawerStore((s) => s.resetCurrentPage);

  const handleApply = useCallback(() => {
    applyChanges();
    setApplied(true);
    setTimeout(() => setApplied(false), 1200);
  }, [applyChanges]);

  if (!enabled) return null;

  return (
    <>
      {/* Vaul drawer */}
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        shouldScaleBackground={false}
        modal
      >
        <Drawer.Trigger asChild>
          <DebugFab status={fabStatus} onClick={() => setOpen(true)} />
        </Drawer.Trigger>
        <Drawer.Portal>
          {/* Vaul overlay — handles backdrop click to close */}
          <Drawer.Overlay className="mswd-vaul-overlay" />

          {/* Drawer content */}
          <Drawer.Content
            className="mswd-vaul-content"
            aria-modal
            aria-describedby={undefined}
          >
            {/* Vaul's built-in accessible drag handle */}
            <Drawer.Handle className="mswd-vaul-handle" />

            {/* Visually hidden title for screen readers */}
            <Drawer.Title className="mswd-sr-only">Debug Drawer</Drawer.Title>

            {/* ── Header ── */}
            <div className="mswd-header">
              <div className="mswd-header-left">
                <div className="mswd-header-icon" aria-hidden="true">
                  ⚡
                </div>
                <div>
                  <p className="mswd-header-title">Debug</p>
                  {currentPageId ? (
                    <p className="mswd-header-sub mswd-header-sub--page">
                      {currentPageId}
                    </p>
                  ) : (
                    <p className="mswd-header-sub">mock service worker</p>
                  )}
                </div>
              </div>
              <Drawer.Close
                className="mswd-close-btn"
                aria-label="Close drawer"
              >
                ✕
              </Drawer.Close>
            </div>

            <MockToggleRow enabled={mockEnabled} onToggle={toggleMockEnabled} />

            {/* ── Empty state ── */}
            {endpoints.length === 0 ? (
              <div className="mswd-empty">
                <div className="mswd-empty-icon" aria-hidden="true">
                  📭
                </div>
                <p className="mswd-empty-title">Nenhum endpoint registrado</p>
                <p className="mswd-empty-desc">
                  Use{" "}
                  <code className="mswd-code">useRegisterMockEndpoints</code> em
                  uma página para ver os endpoints aqui.
                </p>
              </div>
            ) : (
              <>
                <GlobalStrip
                  active={globalPreset}
                  disabled={!mockEnabled}
                  onSelect={applyGlobalPreset}
                />

                <div
                  className={`mswd-section-label ${!mockEnabled ? "mswd-section-label--disabled" : ""}`}
                >
                  <span className="mswd-section-text">
                    endpoints · {endpoints.length}
                  </span>
                  {pendingChanges && mockEnabled && (
                    <span className="mswd-unsaved">unsaved</span>
                  )}
                </div>

                {/*
                  data-vaul-no-drag prevents the list scroll from triggering
                  Vaul's drag-to-dismiss gesture — critical for scrollable content.
                */}
                <div
                  className={`mswd-list ${!mockEnabled ? "mswd-list--disabled" : ""}`}
                  data-vaul-no-drag
                >
                  {endpoints.map((ep: any) => (
                    <EndpointBlock
                      key={ep.id}
                      endpoint={ep}
                      expanded={!!expandedIds[ep.id]}
                      onToggle={() => toggleEndpoint(ep.id)}
                      onSelectScenario={(s: MockScenario) =>
                        selectScenario(ep.id, s)
                      }
                    />
                  ))}
                </div>

                <div className="mswd-footer">
                  <button
                    type="button"
                    onClick={resetCurrentPage}
                    className="mswd-btn-reset"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!pendingChanges || !mockEnabled}
                    className={`mswd-btn-apply ${
                      applied
                        ? "mswd-btn-apply--applied"
                        : pendingChanges && mockEnabled
                          ? "mswd-btn-apply--active"
                          : "mswd-btn-apply--disabled"
                    }`}
                  >
                    {applied ? "Applied ✓" : "Apply & reload"}
                  </button>
                </div>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
