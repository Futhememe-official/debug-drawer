// src/store/debugDrawerStore.ts
import { create } from "zustand";
import type { SetupWorker } from "msw/browser";
import {
  EndpointConfig,
  MockScenario,
  PageMockConfig,
  ScenarioHandlerMap,
} from "../mocks/types";

const EMPTY_ARRAY: any[] = [];

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
  _worker: SetupWorker | null;

  // internal
  _setWorker: (worker: SetupWorker) => void;

  // page registration
  registerPage: (config: PageMockConfig) => void;
  unregisterPage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;

  // endpoint controls
  toggleEndpoint: (id: string) => void;
  selectScenario: (endpointId: string, scenario: MockScenario) => void;
  applyGlobalPreset: (preset: GlobalPreset) => void;
  applyChanges: () => void;
  resetCurrentPage: () => void;
  toggleMockEnabled: () => Promise<void>;
  onApplyChangesCallback?: (endpoints?: EndpointConfig[]) => void;
  registerOnApplyChangesCallback?: (cb: () => void) => void;
}

function flushPage(worker: SetupWorker, entry: PageEntry) {
  worker.resetHandlers();
  entry.endpoints.forEach((ep) => {
    const fn = entry.handlers[ep.id]?.[ep.selectedScenario];
    if (fn) worker.use(fn());
  });
}

export const useDebugDrawerStore = create<DebugDrawerState>((set, get) => ({
  pages: {},
  currentPageId: null,
  expandedIds: {},
  globalPreset: null,
  pendingChanges: false,
  mockEnabled: false,
  _worker: null,
  onApplyChangesCallback: undefined,

  _setWorker: (worker) => {
    if (get()._worker === worker) return; // evita re-render desnecessário
    set({ _worker: worker });
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
    _worker?.resetHandlers();
  },

  toggleMockEnabled: async () => {
    const { mockEnabled, currentPageId, pages, _worker } = get();
    if (!_worker) return;
    if (mockEnabled) {
      _worker.stop();
      set({ mockEnabled: false, pendingChanges: false });
    } else {
      await _worker.start({
        onUnhandledRequest: "warn",
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
      const entry = currentPageId ? pages[currentPageId] : null;
      if (entry) flushPage(_worker, entry);
      set({ mockEnabled: true });
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
