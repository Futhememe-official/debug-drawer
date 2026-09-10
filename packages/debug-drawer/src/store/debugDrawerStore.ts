// src/store/debugDrawerStore.ts
import { create } from "zustand";
import type { SetupWorker } from "msw/browser";
import {
  DebugDrawerWorkerConfig,
  EndpointConfig,
  MockScenario,
  MswStartOptions,
  PageMockConfig,
  ScenarioHandlerMap,
} from "../mocks/types";

const EMPTY_ARRAY: any[] = [];

const DEFAULT_START_TIMEOUT_MS = 4000;

/**
 * Detects whether a Service Worker can actually be registered in this runtime.
 * iOS WKWebView (React Native WebView) and insecure LAN origins expose the API
 * but block or silently ignore registration. `isSecureContext` is `true` on
 * `localhost` and `https`, so dev flows are unaffected.
 */
function canUseServiceWorker(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  if (!("serviceWorker" in navigator)) return false;
  if (window.isSecureContext === false) return false;
  return true;
}

/** Rejects if `promise` has not settled within `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(`[debug-drawer] worker.start() timed out after ${ms}ms`),
      );
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Merges the consumer worker config over the drawer defaults. */
function resolveStartOptions(
  config: DebugDrawerWorkerConfig,
): MswStartOptions {
  const user = config.startOptions ?? {};
  const userSw = user.serviceWorker ?? {};
  const url = config.serviceWorkerUrl ?? userSw.url ?? "/mockServiceWorker.js";

  return {
    onUnhandledRequest: "warn",
    quiet: true,
    ...user,
    serviceWorker: {
      ...userSw,
      url,
    },
    // Tolerate a worker script served from a sub-path — common in micro-frontends
    // where the MFE cannot drop a file at the host document root.
    findWorker:
      user.findWorker ??
      ((scriptURL: string, mockServiceWorkerUrl: string) =>
        scriptURL.includes("mockServiceWorker") ||
        scriptURL === mockServiceWorkerUrl),
  };
}

export type GlobalPreset = "success" | "error" | "loading" | null;

interface PageEntry {
  endpoints: EndpointConfig[];
  handlers: Record<string, ScenarioHandlerMap>;
}

interface DebugDrawerState {
  pages: Record<string, PageEntry>;
  currentPageId: string | null;
  expandedIds: Record<string, boolean>;
  globalPreset: GlobalPreset;
  pendingChanges: boolean;
  mockEnabled: boolean;
  /** True when the runtime blocks Service Workers (iOS WKWebView, insecure origin). */
  swUnsupported: boolean;
  /** Last worker start error message, for debugging. */
  swError: string | null;
  _worker: SetupWorker | null;
  _startConfig: DebugDrawerWorkerConfig;

  // internal
  _setWorker: (worker: SetupWorker) => void;
  _setStartConfig: (config: DebugDrawerWorkerConfig) => void;

  // page registration
  registerPage: (config: PageMockConfig) => void;
  unregisterPage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;

  // endpoint controls
  toggleEndpoint: (id: string) => void;
  selectScenario: (endpointId: string, scenario: MockScenario) => void;
  toggleEndpointMock: (endpointId: string) => void;
  applyGlobalPreset: (preset: GlobalPreset) => void;
  applyChanges: () => void;
  resetCurrentPage: () => void;
  toggleMockEnabled: () => Promise<void>;
  onApplyChangesCallback?: (endpoints?: EndpointConfig[]) => void;
  registerOnApplyChangesCallback?: (cb: () => void) => void;
}

function flushPage(worker: SetupWorker, entry: PageEntry) {
  try {
    worker.resetHandlers();
    entry.endpoints.forEach((ep) => {
      if (ep.mockEnabled === false) return;
      const fn = entry.handlers[ep.id]?.[ep.selectedScenario];
      if (fn) worker.use(fn());
    });
  } catch (err) {
    console.warn("[debug-drawer] failed to flush handlers", err);
  }
}

export const useDebugDrawerStore = create<DebugDrawerState>((set, get) => ({
  pages: {},
  currentPageId: null,
  expandedIds: {},
  globalPreset: null,
  pendingChanges: false,
  mockEnabled: false,
  swUnsupported: false,
  swError: null,
  _worker: null,
  _startConfig: {},
  onApplyChangesCallback: undefined,

  _setWorker: (worker) => {
    if (get()._worker === worker) return; // evita re-render desnecessário
    set({ _worker: worker });
  },

  _setStartConfig: (config) => {
    set({ _startConfig: config ?? {} });
  },

  registerPage: (config) => {
    set((state) => {
      const existing = state.pages[config.pageId];
      const endpoints = existing
        ? config.endpoints.map((ep) => {
            const prev = existing.endpoints.find((e) => e.id === ep.id);
            return prev
              ? { ...ep, selectedScenario: prev.selectedScenario }
              : ep;
          })
        : config.endpoints;
      return {
        pages: {
          ...state.pages,
          [config.pageId]: { endpoints, handlers: config.handlers },
        },
      };
    });
  },

  unregisterPage: (pageId) => {
    set((state) => {
      const { [pageId]: _r, ...rest } = state.pages;
      return { pages: rest };
    });
  },

  setCurrentPage: (pageId) => {
    const { pages, mockEnabled, _worker } = get();
    const entry = pages[pageId];

    const firstId = entry?.endpoints[0]?.id;

    set({
      currentPageId: pageId,
      expandedIds: firstId ? { [firstId]: true } : {},
      globalPreset: null,
      pendingChanges: false,
    });

    if (mockEnabled && entry && _worker) {
      flushPage(_worker, entry);
    }
  },

  toggleEndpoint: (id) => {
    set((state) => ({
      expandedIds: {
        ...state.expandedIds,
        [id]: !state.expandedIds[id],
      },
    }));
  },

  selectScenario: (endpointId, scenario) => {
    const { currentPageId } = get();
    if (!currentPageId) return;
    set((state) => {
      const entry = state.pages[currentPageId];
      if (!entry) return {};
      return {
        pages: {
          ...state.pages,
          [currentPageId]: {
            ...entry,
            endpoints: entry.endpoints.map((ep) =>
              ep.id === endpointId ? { ...ep, selectedScenario: scenario } : ep,
            ),
          },
        },
        globalPreset: null,
        pendingChanges: true,
      };
    });
  },

  toggleEndpointMock: (endpointId) => {
    const { currentPageId } = get();
    if (!currentPageId) return;
    set((state) => {
      const entry = state.pages[currentPageId];
      if (!entry) return {};
      return {
        pages: {
          ...state.pages,
          [currentPageId]: {
            ...entry,
            endpoints: entry.endpoints.map((ep) =>
              ep.id === endpointId
                ? { ...ep, mockEnabled: ep.mockEnabled === false ? true : false }
                : ep,
            ),
          },
        },
        pendingChanges: true,
      };
    });
  },

  applyGlobalPreset: (preset) => {
    const { currentPageId } = get();
    if (!preset || !currentPageId) return;
    set((state) => {
      const entry = state.pages[currentPageId];
      if (!entry) return {};
      return {
        pages: {
          ...state.pages,
          [currentPageId]: {
            ...entry,
            endpoints: entry.endpoints.map((ep) => {
              const has = ep.options.some((o) => o.scenario === preset);
              return {
                ...ep,
                selectedScenario: has ? preset : ep.options[0].scenario,
              };
            }),
          },
        },
        globalPreset: preset,
        pendingChanges: true,
      };
    });
  },

  applyChanges: () => {
    const { currentPageId, pages, mockEnabled, _worker } = get();
    if (!currentPageId || !mockEnabled || !_worker) return;
    const entry = pages[currentPageId];
    if (entry) flushPage(_worker, entry);
    set({ pendingChanges: false });
    if (get().onApplyChangesCallback) {
      const selectedPage = pages?.[currentPageId]?.endpoints;
      get().onApplyChangesCallback?.(selectedPage);
    }
  },

  registerOnApplyChangesCallback: (cb) => {
    set({ onApplyChangesCallback: cb });
  },

  resetCurrentPage: () => {
    const { currentPageId, pages, _worker } = get();
    if (!currentPageId) return;
    const entry = pages[currentPageId];
    if (!entry) return;
    const reset = entry.endpoints.map((ep) => ({
      ...ep,
      selectedScenario: ep.options[0].scenario,
    }));
    set((state) => ({
      pages: {
        ...state.pages,
        [currentPageId]: { ...entry, endpoints: reset },
      },
      globalPreset: null,
      pendingChanges: false,
    }));
    try {
      _worker?.resetHandlers();
    } catch (err) {
      console.warn("[debug-drawer] failed to reset handlers", err);
    }
  },

  toggleMockEnabled: async () => {
    const { mockEnabled, currentPageId, pages, _worker, _startConfig } = get();
    if (!_worker) return;

    const flush = () => {
      const entry = currentPageId ? pages[currentPageId] : null;
      if (entry) flushPage(_worker, entry);
    };

    // ── Disable ──────────────────────────────────────────────────────────
    if (mockEnabled) {
      try {
        // In `externallyStarted` mode the host shell owns the worker lifecycle —
        // only drop our handlers, never stop its Service Worker.
        if (_startConfig.externallyStarted) {
          _worker.resetHandlers();
        } else {
          _worker.stop();
        }
      } catch (err) {
        console.warn("[debug-drawer] failed to stop worker", err);
      }
      set({ mockEnabled: false, pendingChanges: false });
      return;
    }

    // ── Enable ───────────────────────────────────────────────────────────

    // Host shell already started MSW (micro-frontend): just flush handlers.
    if (_startConfig.externallyStarted) {
      flush();
      set({ mockEnabled: true, swUnsupported: false, swError: null });
      return;
    }

    // Runtime can't run a Service Worker (iOS WKWebView / React Native WebView,
    // insecure origin): degrade gracefully. Requests hit the real API and the
    // host application keeps working instead of crashing on a rejected start().
    if (!canUseServiceWorker()) {
      console.warn(
        "[debug-drawer] Service Worker unavailable — mocking disabled, requests hit the real API",
      );
      set({
        mockEnabled: false,
        swUnsupported: true,
        swError: "service worker unavailable in this environment",
      });
      return;
    }

    try {
      await withTimeout(
        _worker.start(resolveStartOptions(_startConfig)),
        _startConfig.startTimeoutMs ?? DEFAULT_START_TIMEOUT_MS,
      );
      flush();
      set({ mockEnabled: true, swUnsupported: false, swError: null });
    } catch (err) {
      console.warn(
        "[debug-drawer] worker.start() failed — mocking disabled, app not blocked",
        err,
      );
      try {
        _worker.stop();
      } catch {
        /* noop */
      }
      set({
        mockEnabled: false,
        swUnsupported: true,
        swError: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));

export const selectCurrentEndpoints = (s: DebugDrawerState) =>
  s.currentPageId
    ? (s.pages[s.currentPageId]?.endpoints ?? EMPTY_ARRAY)
    : EMPTY_ARRAY;

export const selectFabStatus = (
  s: DebugDrawerState,
): "ok" | "warn" | "error" | "off" => {
  if (!s.mockEnabled) return "off";
  const eps = selectCurrentEndpoints(s);
  if (
    eps.some((ep) =>
      ["error", "not_found", "forbidden", "network_error"].includes(
        ep.selectedScenario,
      ),
    )
  )
    return "error";
  if (eps.some((ep) => ep.selectedScenario === "loading")) return "warn";
  return "ok";
};
