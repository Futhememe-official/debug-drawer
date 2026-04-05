import { useState } from "react";
import type { HttpErrorCode } from "../types/api";

interface ErrorSimulatorProps {
  onSimulate: (status: HttpErrorCode) => void;
}

const ERROR_CODES: { code: HttpErrorCode; label: string; color: string }[] = [
  { code: 400, label: "400", color: "text-amber-400 border-amber-500/30 hover:bg-amber-500/10" },
  { code: 401, label: "401", color: "text-rose-400 border-rose-500/30 hover:bg-rose-500/10" },
  { code: 403, label: "403", color: "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" },
  { code: 404, label: "404", color: "text-violet-400 border-violet-500/30 hover:bg-violet-500/10" },
  { code: 429, label: "429", color: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10" },
  { code: 500, label: "500", color: "text-red-400 border-red-500/30 hover:bg-red-500/10" },
  { code: 503, label: "503", color: "text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10" },
];

export function ErrorSimulator({ onSimulate }: ErrorSimulatorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        MSW Errors
        <span className="text-accent/50">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-cosmos-800 border border-white/10 rounded-xl p-3 shadow-2xl min-w-[200px]">
          <p className="text-xs text-slate-500 mb-3 px-1">
            Simule erros via MSW
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {ERROR_CODES.map(({ code, label, color }) => (
              <button
                key={code}
                onClick={() => {
                  onSimulate(code);
                  setOpen(false);
                }}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3 px-1 leading-relaxed">
            Configure o MSW handler para interceptar a próxima requisição e retornar o código selecionado.
          </p>
        </div>
      )}
    </div>
  );
}
