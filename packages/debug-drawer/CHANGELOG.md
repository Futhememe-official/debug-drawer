# @withgus/debug

## 1.5.0

### Minor Changes

- 6a7d55c: Feat: micro-frontend and iOS WebView support for the MSW worker

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

## 1.4.0

### Minor Changes

- Feat: new fn to toggle only the selected endpoint

## 1.3.0

### Minor Changes

- Feat: create a function callback when the user apply changes

## 1.2.5

### Patch Changes

- update documentation to npm registry

## 1.2.4

### Patch Changes

- Fix: Adjust css to be responsive on all devices

## 1.2.3

### Patch Changes

- Fix: adjust css imports and button spacing

## 1.2.2

### Patch Changes

- Fix to start drawer disabled for mock server

## 1.2.1

### Patch Changes

- Adjust button styles to start unset on styles css

## 1.2.0

### Minor Changes

- ##adjust re-render problem
  - Adjust drawer endpoint block to adapt based on layout
  - Adjust re-render problem on zustand and up performance
  - Add new playground for tests

## 1.1.0

### Minor Changes

- Adjust use hooks loop

## 1.0.0

### Major Changes

- Adjust FAB button to launch the library
