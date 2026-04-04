// src/hooks/useDebugDrawerViewModel.ts
// Thin adapter: reads from Zustand store and exposes a clean ViewModel interface.
// The DebugDrawer component stays decoupled from the store internals.
import {
  useDebugDrawerStore,
  selectCurrentEndpoints,
  selectFabStatus,
  GlobalPreset,
} from "../store/debugDrawerStore";
import { MockScenario } from "../mocks/types";

export type { GlobalPreset };

export interface DebugDrawerViewModel {
  endpoints: ReturnType<typeof selectCurrentEndpoints>;
  expandedIds: Set<string>;
  globalPreset: GlobalPreset;
  pendingChanges: boolean;
  mockEnabled: boolean;
  currentPageId: string | null;
  fabStatus: "ok" | "warn" | "error" | "off";

  toggleMockEnabled: () => Promise<void>;
  toggleEndpoint: (id: string) => void;
  selectScenario: (endpointId: string, scenario: MockScenario) => void;
  applyGlobalPreset: (preset: GlobalPreset) => void;
  applyChanges: () => void;
  resetAll: () => void;
}

export function useDebugDrawerViewModel(): DebugDrawerViewModel {
  const endpoints = useDebugDrawerStore(selectCurrentEndpoints);
  const expandedIds = useDebugDrawerStore((s) => s.expandedIds);
  const globalPreset = useDebugDrawerStore((s) => s.globalPreset);
  const pendingChanges = useDebugDrawerStore((s) => s.pendingChanges);
  const mockEnabled = useDebugDrawerStore((s) => s.mockEnabled);
  const currentPageId = useDebugDrawerStore((s) => s.currentPageId);
  const fabStatus = useDebugDrawerStore(selectFabStatus);

  const toggleMockEnabled = useDebugDrawerStore((s) => s.toggleMockEnabled);
  const toggleEndpoint = useDebugDrawerStore((s) => s.toggleEndpoint);
  const selectScenario = useDebugDrawerStore((s) => s.selectScenario);
  const applyGlobalPreset = useDebugDrawerStore((s) => s.applyGlobalPreset);
  const applyChanges = useDebugDrawerStore((s) => s.applyChanges);
  const resetAll = useDebugDrawerStore((s) => s.resetCurrentPage);

  return {
    endpoints,
    expandedIds,
    globalPreset,
    pendingChanges,
    mockEnabled,
    currentPageId,
    fabStatus,
    toggleMockEnabled,
    toggleEndpoint,
    selectScenario,
    applyGlobalPreset,
    applyChanges,
    resetAll,
  };
}
