// src/mocks/types.ts
import type { HttpHandler } from "msw";

export type MockScenario =
  | "success"
  | "error"
  | "loading"
  | "not_found"
  | "forbidden"
  | "network_error"
  | string;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface MockOption {
  id: string;
  label: string;
  description: string;
  statusCode: number | null;
  scenario: MockScenario;
  payload?: Record<string, unknown> | unknown[];
}

export interface EndpointConfig {
  id: string;
  method: HttpMethod;
  path: string;
  selectedScenario: MockScenario;
  options: MockOption[];
  mockEnabled?: boolean;
}

export type ScenarioHandlerMap = Record<string, () => HttpHandler>;

export interface PageMockConfig {
  /** Unique page identifier — typically the route path, e.g. '/team' */
  pageId: string;
  endpoints: EndpointConfig[];
  handlers: Record<string, ScenarioHandlerMap>;
  /**
   * Callback function invoked when the drawer applies changes (i.e., when the "Apply & reload" button is clicked).
   * @returns void
   */
  onApplyChanges?: (endpoints?: EndpointConfig[]) => void;
}
