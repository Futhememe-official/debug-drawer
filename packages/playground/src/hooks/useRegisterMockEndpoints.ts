// src/hooks/useRegisterMockEndpoints.ts
//
// Drop this hook into any page/view to register its mock endpoints in the drawer.
// Endpoints are automatically unregistered when the component unmounts.
//
// Usage:
//   useRegisterMockEndpoints({
//     pageId: '/team',
//     endpoints: teamEndpointsConfig,
//     handlers: teamScenarioHandlers,
//   })
//
import { useEffect } from "react";
import { PageMockConfig } from "../mocks/types";
import { useDebugDrawerStore } from "../store/debugDrawerStore";

export function useRegisterMockEndpoints(config: PageMockConfig) {
  const register = useDebugDrawerStore((s) => s.registerPage);
  const unregister = useDebugDrawerStore((s) => s.unregisterPage);
  const setCurrent = useDebugDrawerStore((s) => s.setCurrentPage);

  useEffect(() => {
    register(config);
    setCurrent(config.pageId);

    return () => {
      // Keep the page entry (preserves scenario selections for next visit)
      // but clear it as the "current" page — the next page will set itself
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pageId]);
}
