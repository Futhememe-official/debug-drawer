import { useEffect, useCallback, useState } from "react";
import { DebugDrawer, useRegisterMockEndpoints } from "@withgus/debug";
import { useApod } from "./hooks/useApod";
import { ApodCard } from "./components/ApodCard";
import { ErrorState } from "./components/ErrorState";
import { LoadingSkeleton, LoadingOverlay } from "./components/LoadingState";
import { DatePicker } from "./components/DatePicker";
import { apodPageConfig } from "./mocks/apodPageConfig";
import type { SetupWorker } from "msw/browser";

// Worker é lazy-loaded só em DEV para não afetar o bundle de produção
async function getWorker(): Promise<SetupWorker | null> {
  if (!import.meta.env.DEV) return null;
  const { worker } = await import("./mocks/browser");
  return worker;
}

export default function App() {
  const { state, fetch, reset } = useApod();
  const [worker, setWorker] = useState<SetupWorker | null>(null);

  // Registra os endpoints da página no store do DebugDrawer
  useRegisterMockEndpoints(apodPageConfig);

  // Carrega o worker lazy em DEV
  useEffect(() => {
    getWorker().then(setWorker);
  }, []);

  // Carrega o APOD de hoje ao montar
  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDateSearch = useCallback((date: string) => fetch(date), [fetch]);
  const handleToday = useCallback(() => fetch(), [fetch]);
  const handleRetry = useCallback(() => {
    if (state.status === "error") fetch();
  }, [fetch, state]);

  return (
    <div className="min-h-screen bg-[#06060f] font-body">
      {/* Stars */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 65%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 32%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 28% 88%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(2px 2px at 60% 12%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 70%, rgba(255,255,255,0.3) 0%, transparent 100%)
          `,
        }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[#1C7CF9]/4 blur-[150px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">
                  NASA · APOD
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="font-mono text-xs text-[#1C7CF9]/70">
                  Astronomy Picture of the Day
                </span>
              </div>
              <h1 className="font-display text-4xl font-extrabold text-white leading-tight">
                Space{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5623] to-[#ff9a00]">
                  Explorer
                </span>
              </h1>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Explore imagens e vídeos astronômicos da NASA. Selecione uma data
            ou use o{" "}
            <span className="text-[#FF5623] font-mono text-xs">
              Debug Drawer
            </span>{" "}
            para simular cenários de erro via MSW.
          </p>

          <div className="pt-1">
            <DatePicker
              onSearch={handleDateSearch}
              onToday={handleToday}
              isLoading={state.status === "loading"}
            />
          </div>

          <StatusIndicator status={state.status} />
        </header>

        <div className="border-t border-white/5 mb-8" />

        <main>
          {state.status === "idle" && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
              <div className="text-5xl opacity-20 select-none">🔭</div>
              <p className="text-slate-600 text-sm font-mono">
                pronto para explorar
              </p>
            </div>
          )}

          {state.status === "loading" && (
            <div>
              <LoadingOverlay />
              <div className="mt-8">
                <LoadingSkeleton />
              </div>
            </div>
          )}

          {state.status === "success" && <ApodCard data={state.data} />}

          {state.status === "error" && (
            <ErrorState
              error={state.error}
              onRetry={handleRetry}
              onReset={reset}
            />
          )}
        </main>

        <footer className="mt-16 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-700 font-mono">NASA Open APIs</p>
          <a
            href="https://api.nasa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-700 hover:text-slate-400 font-mono transition-colors"
          >
            api.nasa.gov →
          </a>
        </footer>
      </div>

      {/* Debug Drawer — só renderiza em DEV e quando o worker estiver pronto */}
      {worker && (
        <DebugDrawer worker={worker} enabled={import.meta.env.DEV} />
      )}
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string }> = {
    idle: { dot: "bg-slate-600", label: "idle" },
    loading: { dot: "bg-yellow-500 animate-pulse", label: "fetching..." },
    success: { dot: "bg-emerald-500", label: "200 ok" },
    error: { dot: "bg-red-500", label: "error" },
  };
  const cfg = map[status] ?? map.idle;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className="font-mono text-xs text-slate-600">{cfg.label}</span>
    </div>
  );
}
