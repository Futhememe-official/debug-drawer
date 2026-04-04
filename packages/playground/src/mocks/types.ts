// src/mocks/types.ts
import type { HttpHandler } from 'msw'

export type MockScenario =
  | 'success'
  | 'error'
  | 'loading'
  | 'not_found'
  | 'forbidden'
  | 'network_error'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface MockOption {
  id: string
  label: string
  description: string
  statusCode: number | null
  scenario: MockScenario
  payload?: Record<string, unknown> | unknown[]
}

export interface EndpointConfig {
  id: string
  method: HttpMethod
  path: string
  selectedScenario: MockScenario
  options: MockOption[]
}

// Map of scenario id → factory function that returns an MSW handler
export type ScenarioHandlerMap = Record<string, () => HttpHandler>

// Full mock registration for a page
export interface PageMockConfig {
  /** Unique page identifier — typically the route path, e.g. '/team' */
  pageId: string
  /** Endpoint definitions shown in the drawer */
  endpoints: EndpointConfig[]
  /**
   * Handler factories keyed by endpointId then scenarioId.
   * Must cover every scenario in every endpoint's options.
   * e.g. { 'GET /users': { success: () => http.get(...), error: () => http.get(...) } }
   */
  handlers: Record<string, ScenarioHandlerMap>
}
