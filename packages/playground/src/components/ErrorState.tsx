import type { ApiError } from "../types/api";

interface ErrorConfig {
  icon: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  hint: string;
}

const ERROR_CONFIGS: Record<number, ErrorConfig> = {
  400: {
    icon: "⚠",
    label: "400 — Bad Request",
    color: "text-amber-400",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.1)]",
    hint: "A requisição foi malformada. Verifique os parâmetros enviados.",
  },
  401: {
    icon: "🔐",
    label: "401 — Unauthorized",
    color: "text-rose-400",
    bg: "bg-rose-500/5",
    border: "border-rose-500/20",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.1)]",
    hint: "API key ausente ou inválida. Verifique suas credenciais.",
  },
  403: {
    icon: "🚫",
    label: "403 — Forbidden",
    color: "text-orange-400",
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    glow: "shadow-[0_0_40px_rgba(249,115,22,0.1)]",
    hint: "Você não tem permissão para acessar este recurso.",
  },
  404: {
    icon: "🌌",
    label: "404 — Not Found",
    color: "text-violet-400",
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.1)]",
    hint: "Nenhuma imagem foi encontrada para esta data. Tente outra.",
  },
  429: {
    icon: "⏱",
    label: "429 — Rate Limited",
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.1)]",
    hint: "Limite de requisições atingido. Aguarde alguns instantes.",
  },
  500: {
    icon: "💥",
    label: "500 — Internal Server Error",
    color: "text-red-400",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.1)]",
    hint: "Algo deu errado no servidor da NASA. Tente novamente.",
  },
  503: {
    icon: "🛸",
    label: "503 — Service Unavailable",
    color: "text-cyan-400",
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.1)]",
    hint: "Serviço temporariamente indisponível. Volte em breve.",
  },
};

const FALLBACK_CONFIG: ErrorConfig = {
  icon: "✕",
  label: "Erro Desconhecido",
  color: "text-slate-400",
  bg: "bg-slate-500/5",
  border: "border-slate-500/20",
  glow: "shadow-[0_0_40px_rgba(100,116,139,0.1)]",
  hint: "Ocorreu um erro inesperado.",
};

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  onReset?: () => void;
}

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  const config = ERROR_CONFIGS[error.status] ?? FALLBACK_CONFIG;

  return (
    <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col items-center justify-center min-h-[420px] px-6">
      <div
        className={`w-full max-w-md rounded-2xl border ${config.border} ${config.bg} ${config.glow} p-8 text-center`}
      >
        {/* Icon */}
        <div className="text-5xl mb-5 select-none">{config.icon}</div>

        {/* Status badge */}
        <div className="inline-flex items-center mb-4">
          <span
            className={`font-mono text-xs font-medium tracking-widest uppercase ${config.color} border ${config.border} px-3 py-1 rounded-full`}
          >
            {config.label}
          </span>
        </div>

        {/* Hint */}
        <p className="text-slate-300 text-sm leading-relaxed mb-2">
          {config.hint}
        </p>

        {/* API detail message */}
        {error.detail && (
          <p className="text-slate-500 text-xs font-mono mt-3 px-3 py-2 bg-white/5 rounded-lg break-words">
            {error.detail}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              Tentar novamente
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className={`px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors ${config.color.replace("text-", "bg-").replace("400", "500")}/20 hover:${config.color.replace("text-", "bg-").replace("400", "500")}/30`}
            >
              Voltar ao início
            </button>
          )}
        </div>
      </div>

      {/* Status code watermark */}
      <div
        className={`mt-6 font-display font-extrabold text-[96px] leading-none select-none pointer-events-none opacity-5 ${config.color}`}
      >
        {error.status}
      </div>
    </div>
  );
}
