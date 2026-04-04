// src/store/debugDrawerStore.ts
import { create } from "zustand";
import {
  EndpointConfig,
  MockScenario,
  PageMockConfig,
  ScenarioHandlerMap,
} from "../mocks/types";
import { worker } from "../mocks/browser";

export type GlobalPreset = "success" | "error" | "loading" | null;

interface PageEntry {
  endpoints: EndpointConfig[]; // current state (with selectedScenario)
  handlers: Record<string, ScenarioHandlerMap>; // handler factories
}

interface DebugDrawerState {
  // ── per-page data ─────────────────────────────────────────────────────
  pages: Record<string, PageEntry>; // pageId → entry
  currentPageId: string | null;

  // ── drawer UI state ───────────────────────────────────────────────────
  expandedIds: Set<string>;
  globalPreset: GlobalPreset;
  pendingChanges: boolean;
  mockEnabled: boolean;

  // ── actions ────────────────────────────────────────────────────────────
  registerPage: (config: PageMockConfig) => void;
  unregisterPage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;

  toggleEndpoint: (id: string) => void;
  selectScenario: (endpointId: string, scenario: MockScenario) => void;
  applyGlobalPreset: (preset: GlobalPreset) => void;
  applyChanges: () => void;
  resetCurrentPage: () => void;
  toggleMockEnabled: () => Promise<void>;
}

// ─── flush helpers ────────────────────────────────────────────────────────

function flushPage(entry: PageEntry) {
  worker.resetHandlers();
  entry.endpoints.forEach((ep) => {
    const scenarioMap = entry.handlers[ep.id];
    if (!scenarioMap) return;
    const fn = scenarioMap[ep.selectedScenario];
    if (fn) worker.use(fn());
  });
}

// ─── store ────────────────────────────────────────────────────────────────

export const useDebugDrawerStore = create<DebugDrawerState>((set, get) => ({
  pages: {},
  currentPageId: null,
  expandedIds: new Set(),
  globalPreset: null,
  pendingChanges: false,
  mockEnabled: true,

  // ── page registration ─────────────────────────────────────────────────
  registerPage: (config) => {
    set((state) => {
      const existing = state.pages[config.pageId];
      if (existing) {
        // Preserve selected scenarios from previous visit
        const merged = config.endpoints.map((ep) => {
          const prev = existing.endpoints.find((e) => e.id === ep.id);
          return prev ? { ...ep, selectedScenario: prev.selectedScenario } : ep;
        });
        return {
          pages: {
            ...state.pages,
            [config.pageId]: { endpoints: merged, handlers: config.handlers },
          },
        };
      }
      return {
        pages: {
          ...state.pages,
          [config.pageId]: {
            endpoints: config.endpoints,
            handlers: config.handlers,
          },
        },
      };
    });
  },

  unregisterPage: (pageId) => {
    set((state) => {
      const { [pageId]: _removed, ...rest } = state.pages;
      return { pages: rest };
    });
  },

  setCurrentPage: (pageId) => {
    const { pages, mockEnabled } = get();
    const entry = pages[pageId];
    set({
      currentPageId: pageId,
      expandedIds: new Set(entry?.endpoints[0] ? [entry.endpoints[0].id] : []),
      globalPreset: null,
      pendingChanges: false,
    });
    // Auto-apply handlers when switching pages (if mock is on)
    if (mockEnabled && entry) flushPage(entry);
  },

  // ── endpoint controls ─────────────────────────────────────────────────
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
    const { currentPageId, pages, mockEnabled } = get();
    if (!currentPageId || !mockEnabled) return;
    const entry = pages[currentPageId];
    if (entry) flushPage(entry);
    set({ pendingChanges: false });
  },

  resetCurrentPage: () => {
    const { currentPageId, pages } = get();
    if (!currentPageId) return;
    const entry = pages[currentPageId];
    if (!entry) return;
    // Reset all scenarios to first option
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
    worker.resetHandlers();
  },

  // ── toggle mock on/off ────────────────────────────────────────────────
  toggleMockEnabled: async () => {
    const { mockEnabled, currentPageId, pages } = get();
    if (mockEnabled) {
      worker.stop();
      set({ mockEnabled: false, pendingChanges: false });
    } else {
      await worker.start({
        onUnhandledRequest: "warn",
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
      const entry = currentPageId ? pages[currentPageId] : null;
      if (entry) flushPage(entry);
      set({ mockEnabled: true });
    }
  },
}));

// ─── selectors ────────────────────────────────────────────────────────────

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
