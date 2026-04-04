// src/pages/DocsPage.tsx
import { useState } from "react";
import { CodeBlock } from "../components/CodeBlock";
import { LiveDemo } from "../components/LiveDemo";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "installation", label: "Installation" },
  { id: "setup", label: "Setup" },
  { id: "usage", label: "Usage" },
  { id: "demo", label: "Live demo" },
  { id: "api", label: "API reference" },
  { id: "theming", label: "Theming" },
];

const INSTALL = `pnpm add @withgus/debug msw zustand vaul`;

const INIT_WORKER = `// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'

export const worker = setupWorker()`;

const MAIN_SETUP = `// src/main.tsx
import { worker } from './mocks/browser'

async function prepare() {
  if (import.meta.env.DEV) {
    await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>
  )
})`;

const APP_SETUP = `// src/App.tsx
import { DebugDrawer } from '@msw-debug/drawer'
import { worker } from './mocks/browser'
import '@withgus/debug/css' //or inside your global.css file

export default function App() {
  return (
    <>
      <Router><Routes /></Router>
      <DebugDrawer worker={worker} />
    </>
  )
}`;

const PAGE_MOCKS = `// src/mocks/pages/team.mocks.ts
import { http, HttpResponse, delay } from 'msw'
import type { EndpointConfig, ScenarioHandlerMap } from '@withgus/debug'

export const teamEndpoints: EndpointConfig[] = [
  {
    id: 'GET /users',
    method: 'GET',
    path: '/users',
    selectedScenario: 'success',
    options: [
      {
        id: 'success',
        label: 'Success',
        description: 'Returns array of users',
        statusCode: 200,
        scenario: 'success',
        payload: [{ id: 1, name: 'Gustavo', role: 'developer' }],
      },
      {
        id: 'error',
        label: 'Server error',
        description: 'Returns 500',
        statusCode: 500,
        scenario: 'error',
        payload: { message: 'Internal server error' },
      },
      {
        id: 'loading',
        label: 'Loading',
        description: 'Infinite pending state',
        statusCode: null,
        scenario: 'loading',
      },
    ],
  },
]

export const teamHandlers: Record<string, Record<string, ScenarioHandlerMap[string]>> = {
  'GET /users': {
    success: () =>
      http.get('/users', () =>
        HttpResponse.json([{ id: 1, name: 'Gustavo', role: 'developer' }])
      ),
    error: () =>
      http.get('/users', () =>
        HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
      ),
    loading: () =>
      http.get('/users', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
  },
}`;

const PAGE_USAGE = `// src/views/TeamView.tsx
import { useRegisterMockEndpoints } from '@withgus/debug'
import { teamEndpoints, teamHandlers } from '../mocks/pages/team.mocks'

export function TeamView() {
  useRegisterMockEndpoints({
    pageId: '/team',
    endpoints: teamEndpoints,
    handlers: teamHandlers,
  })
  // ... rest of your component
}`;

const THEMING = `/* Override CSS variables to match your design system */
:root {
  --mswd-accent:    #your-brand-color;
  --mswd-surface:   #ffffff;
  --mswd-bg:        #f9fafb;
  --mswd-border:    #e5e7eb;
  --mswd-tx:        #111827;
  --mswd-muted:     #6b7280;
  --mswd-font-mono: 'Fira Code', monospace;
}`;

export function DocsPage() {
  const [active, setActive] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function scrollTo(id: string) {
    setActive(id);
    setMobileNavOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="docs" className="min-h-screen bg-canvas font-sans w-full">
      <div className="max-w-6xl mx-auto flex relative">
        {/* ── Desktop sidebar ── */}
        <aside className="w-52 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-10 pl-6 pr-4 hidden md:block">
          <p className="font-mono text-[9px] text-canvas-muted tracking-widest uppercase mb-3">
            docs
          </p>
          <nav className="flex flex-col gap-0.5">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  active === n.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-canvas-muted hover:text-canvas-tx hover:bg-canvas-surface"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 py-8 sm:py-10 px-4 sm:px-6 lg:px-10">
          {/* Overview */}
          <section
            id="overview"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] text-canvas-muted tracking-widest uppercase">
                components
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-canvas-tx tracking-tight mb-4">
              Debug Drawer
            </h1>
            <p className="text-canvas-muted leading-relaxed mb-6 text-sm sm:text-base">
              A floating debug panel that integrates with{" "}
              <a
                href="https://mswjs.io"
                className="text-accent underline underline-offset-2 hover:no-underline"
              >
                MSW
              </a>{" "}
              to switch mock API scenarios per page at runtime — without
              restarting the dev server or touching handler files.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: "⚡",
                  label: "Per-page registration",
                  desc: "Each page declares its own endpoints",
                },
                {
                  icon: "🔄",
                  label: "Persistent selections",
                  desc: "Scenario choices survive navigation",
                },
                {
                  icon: "🎨",
                  label: "Themeable",
                  desc: "CSS variables for full customization",
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="p-4 rounded-xl border border-canvas-border bg-canvas-bg"
                >
                  <span className="text-xl mb-2 block">{f.icon}</span>
                  <p className="text-xs font-semibold text-canvas-tx mb-1">
                    {f.label}
                  </p>
                  <p className="text-xs text-canvas-muted leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Installation */}
          <section
            id="installation"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <SectionHeader step="1" title="Installation" />
            <p className="text-canvas-muted text-sm mb-4">
              Install the package and its peer dependencies.{" "}
              <a
                href="https://vaul.emilkowal.ski"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline underline-offset-2 hover:no-underline"
              >
                Vaul
              </a>{" "}
              powers the drawer animation and gesture handling.
            </p>
            <CodeBlock code={INSTALL} />
            <p className="text-canvas-muted text-sm mt-4">
              Then generate the MSW service worker in your{" "}
              <code className="font-mono text-[11px] bg-canvas-code px-1.5 py-0.5 rounded text-canvas-tx">
                public/
              </code>{" "}
              folder:
            </p>
            <CodeBlock code="npx msw init public/ --save" />
          </section>

          <Divider />

          {/* Setup */}
          <section
            id="setup"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <SectionHeader step="2" title="Setup" />
            <p className="text-canvas-muted text-sm mb-6">
              Configure the worker and add the drawer to your app root.
            </p>

            <h3 className="text-sm font-semibold text-canvas-tx mb-3">
              Create the worker
            </h3>
            <CodeBlock code={INIT_WORKER} filename="src/mocks/browser.ts" />

            <h3 className="text-sm font-semibold text-canvas-tx mb-3 mt-6">
              Start the worker before render
            </h3>
            <CodeBlock code={MAIN_SETUP} filename="src/main.tsx" />

            <h3 className="text-sm font-semibold text-canvas-tx mb-3 mt-6">
              Add the drawer to your app
            </h3>
            <CodeBlock code={APP_SETUP} filename="src/App.tsx" />
          </section>

          <Divider />

          {/* Usage */}
          <section
            id="usage"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <SectionHeader step="3" title="Usage" />
            <p className="text-canvas-muted text-sm mb-6">
              Create a mock config file for each page, then register it with{" "}
              <code className="font-mono text-[11px] bg-canvas-code px-1.5 py-0.5 rounded text-canvas-tx">
                useRegisterMockEndpoints
              </code>
              .
            </p>

            <h3 className="text-sm font-semibold text-canvas-tx mb-3">
              Define endpoints and handlers
            </h3>
            <CodeBlock
              code={PAGE_MOCKS}
              filename="src/mocks/pages/team.mocks.ts"
            />

            <h3 className="text-sm font-semibold text-canvas-tx mb-3 mt-6">
              Register in your view
            </h3>
            <CodeBlock code={PAGE_USAGE} filename="src/views/TeamView.tsx" />

            <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/15">
              <p className="text-sm text-canvas-tx leading-relaxed">
                <span className="font-semibold">How it works:</span> When the
                component mounts,{" "}
                <code className="font-mono text-[11px] bg-canvas-code px-1.5 py-0.5 rounded">
                  useRegisterMockEndpoints
                </code>{" "}
                registers the endpoint definitions in the Zustand store and sets
                this page as current. The drawer automatically flushes the
                selected scenarios into the MSW worker via{" "}
                <code className="font-mono text-[11px] bg-canvas-code px-1.5 py-0.5 rounded">
                  worker.use()
                </code>
                .
              </p>
            </div>
          </section>

          <Divider />

          {/* Live demo */}
          <section
            id="demo"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <SectionHeader step="4" title="Live demo" />
            <p className="text-canvas-muted text-sm mb-6">
              Select a scenario in the drawer panel and watch the app output
              react instantly.
            </p>
            <LiveDemo />
          </section>

          <Divider />

          {/* API */}
          <section
            id="api"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <h2 className="text-xl font-bold text-canvas-tx mb-6">
              API reference
            </h2>

            <ApiSection
              title="<DebugDrawer />"
              desc="The main component. Renders a FAB and a Vaul bottom drawer."
            >
              <PropRow
                name="worker"
                type="SetupWorker"
                required
                desc="The MSW browser worker instance from setupWorker()."
              />
              <PropRow
                name="enabled"
                type="boolean"
                def="true"
                desc="Set to false to completely hide the drawer."
              />
              <PropRow
                name="snapPoints"
                type="(string|number)[]"
                def="['500px', 1]"
                desc="Vaul snap points. Pass [1] to always open full-height."
              />
            </ApiSection>

            <ApiSection
              title="useRegisterMockEndpoints(config)"
              desc="Hook that registers a page's endpoints in the drawer."
            >
              <PropRow
                name="config.pageId"
                type="string"
                required
                desc='Unique page identifier, e.g. "/team".'
              />
              <PropRow
                name="config.endpoints"
                type="EndpointConfig[]"
                required
                desc="Endpoint definitions shown in the drawer UI."
              />
              <PropRow
                name="config.handlers"
                type="Record<…>"
                required
                desc="Handler factories keyed by endpointId → scenarioId."
              />
            </ApiSection>

            <ApiSection
              title="useDebugDrawerStore"
              desc="Raw Zustand store for advanced customization."
            >
              <PropRow
                name="selectCurrentEndpoints"
                type="EndpointConfig[]"
                desc="Selector for current page's endpoints."
              />
              <PropRow
                name="selectFabStatus"
                type="'ok'|'warn'|'error'|'off'"
                desc="Selector for the FAB badge status."
              />
            </ApiSection>
          </section>

          <Divider />

          {/* Theming */}
          <section
            id="theming"
            className="mb-12 sm:mb-16 scroll-mt-24 md:scroll-mt-8"
          >
            <h2 className="text-xl font-bold text-canvas-tx mb-2">Theming</h2>
            <p className="text-canvas-muted text-sm mb-6">
              Override CSS custom properties in your global stylesheet to match
              your design system.
            </p>
            <CodeBlock code={THEMING} filename="src/index.css" />
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function Divider() {
  return <hr className="border-canvas-border my-2" />;
}

function SectionHeader({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {step}
      </span>
      <h2 className="text-lg sm:text-xl font-bold text-canvas-tx">{title}</h2>
    </div>
  );
}

function ApiSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="font-mono text-sm font-semibold text-canvas-tx mb-1 break-all">
        {title}
      </h3>
      <p className="text-sm text-canvas-muted mb-3">{desc}</p>
      <div className="border border-canvas-border rounded-xl overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid sm:grid-cols-[140px_140px_1fr] text-[10px] font-mono font-semibold text-canvas-muted uppercase tracking-widest bg-canvas-surface px-4 py-2.5 border-b border-canvas-border">
          <span>Prop</span>
          <span>Type</span>
          <span>Description</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function PropRow({
  name,
  type,
  required,
  def,
  desc,
}: {
  name: string;
  type: string;
  required?: boolean;
  def?: string;
  desc: string;
}) {
  return (
    <div className="border-b border-canvas-border last:border-b-0 hover:bg-canvas-bg transition-colors">
      {/* Desktop: 3-column grid */}
      <div className="hidden sm:grid sm:grid-cols-[140px_140px_1fr] px-4 py-3">
        <span className="font-mono text-[11px] text-canvas-tx flex items-center gap-1.5 self-center">
          {name}
          {required && (
            <span className="text-[9px] text-accent font-bold">*</span>
          )}
        </span>
        <span className="font-mono text-[11px] text-blue-600 self-center">
          {type}
        </span>
        <span className="text-xs text-canvas-muted self-center leading-relaxed">
          {desc}
          {def && (
            <span className="ml-1 font-mono text-[10px] bg-canvas-code px-1 py-0.5 rounded text-canvas-tx">
              default: {def}
            </span>
          )}
        </span>
      </div>
      {/* Mobile: stacked layout */}
      <div className="sm:hidden px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[11px] font-semibold text-canvas-tx">
            {name}
          </span>
          {required && (
            <span className="text-[9px] text-accent font-bold">required</span>
          )}
          <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {type}
          </span>
        </div>
        <p className="text-xs text-canvas-muted leading-relaxed">
          {desc}
          {def && (
            <span className="ml-1 font-mono text-[10px] bg-canvas-code px-1 py-0.5 rounded text-canvas-tx">
              default: {def}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
