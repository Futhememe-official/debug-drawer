---
"@withgus/debug": minor
---

Feat: micro-frontend and iOS WebView support for the MSW worker

- New `workerConfig` prop on `<DebugDrawer />`: `serviceWorkerUrl`, `startOptions`,
  `externallyStarted` (host shell owns the worker — drawer only flushes handlers) and
  `startTimeoutMs`.
- `worker.start()` is now wrapped in a capability check + try/catch + timeout. When the
  runtime blocks Service Workers (iOS `WKWebView` / React Native WebView, insecure origin)
  the drawer disables mocking, shows "Mock indisponível" and leaves the host app running
  against the real API instead of throwing.
- Lenient default `findWorker` so a worker script served from a sub-path is still detected.
- Store exposes `swUnsupported` / `swError`. Handler flush and teardown calls are now
  guarded so a broken worker cannot crash navigation.
