# msw-debug-drawer monorepo

Monorepo with the `@withgus/debug` library and its documentation site.

## Packages

| Package                                            | Description                                          |
| -------------------------------------------------- | ---------------------------------------------------- |
| [`packages/debug-drawer`](./packages/debug-drawer) | The publishable library                              |
| [`packages/docs`](./packages/docs)                 | Documentation site (Vite + React + Tailwind)         |
| [`packages/playground`](./packages/playground)     | Playground site (Vite + React + Tailwind + NASA API) |

## Getting started

```bash
# Install all dependencies
pnpm install

# Run docs dev server
pnpm dev

# Build the library
pnpm build:lib

# Build the docs site
pnpm build:docs
```

## Library usage

```bash
pnpm add @withgus/debug-drawer msw zustand vaul
```

```tsx
// 1. Add the drawer to your app root
import { DebugDrawer } from "@withgus/debug";
import { worker } from "./mocks/browser";

export default function App() {
  return (
    <>
      <YourApp />
      <DebugDrawer worker={worker} />
    </>
  );
}

// 2. Register endpoints in each page
import { useRegisterMockEndpoints } from "@withgus/debug";

export function TeamPage() {
  useRegisterMockEndpoints({
    pageId: "/team",
    endpoints: teamEndpoints,
    handlers: teamHandlers,
  });
  // ...
}
```

## Structure

```
packages/
├── debug-drawer/
│   ├── src/
│   │   ├── index.ts                          # public API
│   │   ├── components/DebugDrawer/
│   │   │   ├── DebugDrawer.tsx
│   │   │   ├── EndpointBlock.tsx
│   │   │   └── drawer.css                    # self-contained styles
│   │   ├── hooks/
│   │   │   └── useRegisterMockEndpoints.ts
│   │   ├── mocks/
│   │   │   └── types.ts
│   │   └── store/
│   │       └── debugDrawerStore.ts           # Zustand store
│   └── package.json
└── docs/
    └── src/
        ├── sections/Hero.tsx                 # mswjs.io-style hero
        ├── pages/DocsPage.tsx                # shadcn-style docs
        └── components/
            ├── LiveDemo.tsx                  # interactive demo
            ├── CodeBlock.tsx
            └── Navbar.tsx
```
