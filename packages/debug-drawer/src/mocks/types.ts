// src/mocks/types.ts
import type { HttpHandler } from "msw";
import type { SetupWorker } from "msw/browser";

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

/**
 * Options accepted by MSW's `worker.start()`.
 * Derived from the installed `msw` version so it stays version-agnostic.
 */
export type MswStartOptions = NonNullable<Parameters<SetupWorker["start"]>[0]>;

/**
 * Controls how the drawer registers / starts the MSW Service Worker.
 * Needed for micro-frontends (host shell owns the worker) and for runtimes
 * where Service Workers are blocked (iOS WKWebView / React Native WebView).
 */
export interface DebugDrawerWorkerConfig {
  /**
   * Override the Service Worker script URL.
   * In a micro-frontend the host document — not the MFE bundle — must serve
   * this file (same origin, ideally at the root so the scope covers `/`).
   * Default: `"/mockServiceWorker.js"`.
   */
  serviceWorkerUrl?: string;
  /**
   * Extra options forwarded to `worker.start()`. Merged over the drawer
   * defaults (`{ onUnhandledRequest: "warn", quiet: true }`) and a lenient
   * `findWorker` that tolerates a worker served from a sub-path.
   */
  startOptions?: MswStartOptions;
  /**
   * The MSW worker was already started elsewhere (typically the host shell in
   * a micro-frontend). When `true` the drawer never calls `worker.start()` /
   * `worker.stop()` — it only flushes handlers via `worker.use()`.
   * Default: `false`.
   */
  externallyStarted?: boolean;
  /**
   * Max time to wait for `worker.start()` before treating the environment as
   * unsupported. Guards against WKWebView hanging the MSW handshake forever.
   * Default: `4000`.
   */
  startTimeoutMs?: number;
}
