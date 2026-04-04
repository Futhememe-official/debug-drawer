import { useEffect, useRef } from "react";
import { PageMockConfig } from "../mocks/types";
import { useDebugDrawerStore } from "../store/debugDrawerStore";

export function useRegisterMockEndpoints(config: PageMockConfig) {
  const registerPage = useDebugDrawerStore((s) => s.registerPage);
  const unregisterPage = useDebugDrawerStore((s) => s.unregisterPage);
  const setCurrentPage = useDebugDrawerStore((s) => s.setCurrentPage);

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const { pageId } = configRef.current;
    registerPage(configRef.current);
    setCurrentPage(pageId);

    return () => {
      unregisterPage(pageId);
    };
  }, [registerPage, unregisterPage, setCurrentPage, config.pageId]);
}
