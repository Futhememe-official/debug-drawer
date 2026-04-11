# @withgus/debug — MSW Debug Drawer

[Offical documentation](https://debug.withgu.com/)

A floating debug panel that integrates with MSW to switch mock API scenarios per page at runtime — without restarting the dev server or touching handler files.

| Feature                      | Description                          |
| ---------------------------- | ------------------------------------ |
| ⚡ **Per-page registration** | Each page declares its own endpoints |
| 🔄 **Persistent selections** | Scenario choices survive navigation  |
| 🎨 **Themeable**             | CSS variables for full customization |

---

## 1. Installation

Install the package and its peer dependencies. [Vaul](https://github.com/emilkowalski/vaul) powers the drawer animation and gesture handling.

```bash
pnpm add @withgus/debug msw zustand vaul
```

Then generate the MSW service worker in your `public/` folder:

```bash
npx msw init public/ --save
```

---

## 2. Setup

Configure the worker and add the drawer to your app root.

### Create the worker

```ts
// src/mocks/browser.ts
import { setupWorker } from "msw/browser";

export const worker = setupWorker();
```

### Start the worker before render

```tsx
// src/main.tsx
import { worker } from "./mocks/browser";

async function prepare() {
  if (import.meta.env.DEV) {
    await worker.start({
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }
}

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
```

### Add the drawer to your app

```tsx
// src/App.tsx
import { DebugDrawer } from "@msw-debug/drawer";
import { worker } from "./mocks/browser";
import "@withgus/debug/css"; // or inside your global.css file

export default function App() {
  return (
    <>
      <Router>
        <Routes />
      </Router>
      <DebugDrawer worker={worker} />
    </>
  );
}
```

---

## 3. Usage

Create a mock config file for each page, then register it with `useRegisterMockEndpoints`.

### Define endpoints and handlers

```ts
// src/mocks/pages/team.mocks.ts
import { http, HttpResponse, delay } from "msw";
import type { EndpointConfig, ScenarioHandlerMap } from "@withgus/debug";

export const teamEndpoints: EndpointConfig[] = [
  {
    id: "GET /users",
    method: "GET",
    path: "/users",
    selectedScenario: "success",
    options: [
      {
        id: "success",
        label: "Success",
        description: "Returns array of users",
        statusCode: 200,
        scenario: "success",
        payload: [{ id: 1, name: "Gustavo", role: "developer" }],
      },
      {
        id: "error",
        label: "Server error",
        description: "Returns 500",
        statusCode: 500,
        scenario: "error",
        payload: { message: "Internal server error" },
      },
      {
        id: "loading",
        label: "Loading",
        description: "Infinite pending state",
        statusCode: null,
        scenario: "loading",
      },
    ],
  },
];

export const teamHandlers: Record<
  string,
  Record<string, ScenarioHandlerMap[string]>
> = {
  "GET /users": {
    success: () =>
      http.get("/users", () =>
        HttpResponse.json([{ id: 1, name: "Gustavo", role: "developer" }]),
      ),
    error: () =>
      http.get("/users", () =>
        HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 },
        ),
      ),
    loading: () =>
      http.get("/users", async () => {
        await delay("infinite");
        return HttpResponse.json([]);
      }),
  },
};
```

### Register in your view

```tsx
// src/views/TeamView.tsx
import { useRegisterMockEndpoints } from "@withgus/debug";
import { teamEndpoints, teamHandlers } from "../mocks/pages/team.mocks";

export function TeamView() {
  useRegisterMockEndpoints({
    pageId: "/team",
    endpoints: teamEndpoints,
    handlers: teamHandlers,
  });
  // ... rest of your component
}
```

> **How it works:** When the component mounts, `useRegisterMockEndpoints` registers the endpoint definitions in the Zustand store and sets this page as current. The drawer automatically flushes the selected scenarios into the MSW worker via `worker.use()`.

---

## 4. API Reference

### `<DebugDrawer />`

The main component. Renders a FAB and a Vaul bottom drawer.

| Prop      | Type          | Required | Description                                                    |
| --------- | ------------- | -------- | -------------------------------------------------------------- |
| `worker`  | `SetupWorker` | ✅       | The MSW browser worker instance from `setupWorker()`.          |
| `enabled` | `boolean`     | —        | Set to `false` to completely hide the drawer. Default: `true`. |

---

### `useRegisterMockEndpoints(config)`

Hook that registers a page's endpoints in the drawer.

| Prop               | Type               | Required | Description                                           |
| ------------------ | ------------------ | -------- | ----------------------------------------------------- |
| `config.pageId`    | `string`           | ✅       | Unique page identifier, e.g. `"/team"`.               |
| `config.endpoints` | `EndpointConfig[]` | ✅       | Endpoint definitions shown in the drawer UI.          |
| `config.handlers`  | `Record<…>`        | ✅       | Handler factories keyed by `endpointId → scenarioId`. |

---

### `useDebugDrawerStore`

Raw Zustand store for advanced customization.

| Selector                 | Type                                 | Description                            |
| ------------------------ | ------------------------------------ | -------------------------------------- |
| `selectCurrentEndpoints` | `EndpointConfig[]`                   | Selector for current page's endpoints. |
| `selectFabStatus`        | `'ok' \| 'warn' \| 'error' \| 'off'` | Selector for the FAB badge status.     |

---

## 5. Theming

Override CSS custom properties in your global stylesheet to match your design system.

```css
/* src/index.css */
/* Override CSS variables to match your design system */
:root {
  --mswd-accent: #your-brand-color;
  --mswd-surface: #ffffff;
  --mswd-bg: #f9fafb;
  --mswd-border: #e5e7eb;
  --mswd-tx: #111827;
  --mswd-muted: #6b7280;
  --mswd-font-mono: "Fira Code", monospace;
}
```
