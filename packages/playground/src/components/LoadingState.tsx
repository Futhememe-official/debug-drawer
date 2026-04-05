export function LoadingSkeleton() {
  return (
    <div className="animate-[fadeIn_0.3s_ease_forwards] space-y-6">
      {/* Image skeleton */}
      <div className="w-full aspect-video rounded-2xl shimmer" />

      {/* Meta skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full shimmer" />
        <div className="h-7 w-3/4 rounded-lg shimmer" />
        <div className="h-3 w-32 rounded-full shimmer" />
      </div>

      {/* Text skeleton */}
      <div className="space-y-2">
        {[100, 95, 88, 92, 70].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full shimmer"
            style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] gap-5">
      {/* Orbital loader */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        <div
          className="absolute inset-[6px] rounded-full border border-transparent border-t-[#1C7CF9]/60 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
        />
      </div>
      <p className="text-slate-500 text-sm font-mono tracking-widest uppercase">
        Carregando...
      </p>
    </div>
  );
}
