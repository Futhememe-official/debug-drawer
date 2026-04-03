// src/store/debugDrawerStore.ts
import { create } from "zustand";
import type { SetupWorker } from "msw/browser";
import {
  EndpointConfig,
  MockScenario,
  PageMockConfig,
  ScenarioHandlerMap,
} from "../mocks/types";

export type GlobalPreset = "success" | "error" | "loading" | null;

interface PageEntry {
  endpoints: EndpointConfig[];
  handlers: Record<string, ScenarioHandlerMap>;
}

interface DebugDrawerState {
  pages: Record<string, PageEntry>;
  currentPageId: string | null;
  expandedIds: Set<string>;
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
  expandedIds: new Set(),
  globalPreset: null,
  pendingChanges: false,
  mockEnabled: true,
  _worker: null,

  _setWorker: (worker) => set({ _worker: worker }),

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
    set({
      currentPageId: pageId,
      expandedIds: new Set(entry?.endpoints[0] ? [entry.endpoints[0].id] : []),
      globalPreset: null,
      pendingChanges: false,
    });
    if (mockEnabled && entry && _worker) flushPage(_worker, entry);
  },

  toggleEndpoint: (id) => {
    set((state) => {
      const next = new Set(state.expandedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { expandedIds: next };
    });
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
  s.currentPageId ? (s.pages[s.currentPageId]?.endpoints ?? []) : [];

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
