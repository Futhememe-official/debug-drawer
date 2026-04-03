// src/hooks/useRegisterMockEndpoints.ts
import { useEffect } from 'react'
import { PageMockConfig } from '../mocks/types'
import { useDebugDrawerStore } from '../store/debugDrawerStore'

export function useRegisterMockEndpoints(config: PageMockConfig) {
  const register   = useDebugDrawerStore(s => s.registerPage)
  const setCurrent = useDebugDrawerStore(s => s.setCurrentPage)

  useEffect(() => {
    register(config)
    setCurrent(config.pageId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pageId])
}
