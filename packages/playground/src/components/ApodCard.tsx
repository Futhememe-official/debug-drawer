import type { ApodResponse } from "../types/api";

interface ApodCardProps {
  data: ApodResponse;
}

export function ApodCard({ data }: ApodCardProps) {
  const isVideo = data.media_type === "video";
  const imgSrc = data.hdurl || data.url;

  return (
    <article className="animate-[slideUp_0.5s_ease_forwards] space-y-6">
      {/* Media */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-cosmos-800 border border-white/5">
        {isVideo ? (
          <div className="aspect-video">
            <iframe
              src={data.url}
              className="w-full h-full"
              allowFullScreen
              title={data.title}
            />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={data.title}
            className="w-full object-cover max-h-[520px] transition-transform duration-700 hover:scale-[1.02]"
          />
        )}

        {/* Date badge */}
        <div className="absolute top-4 left-4">
          <span className="font-mono text-xs text-white/70 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {data.date}
          </span>
        </div>

        {/* Media type badge */}
        {isVideo && (
          <div className="absolute top-4 right-4">
            <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full">
              VIDEO
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-white leading-snug">
            {data.title}
          </h2>
          {data.copyright && (
            <p className="text-xs text-slate-500 font-mono">
              © {data.copyright.trim()}
            </p>
          )}
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          {data.explanation}
        </p>

        {/* Footer meta */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-mono text-slate-600">
            {data.service_version}
          </span>
          <span className="text-slate-700">·</span>
          <a
            href={imgSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-[#1C7CF9] hover:text-[#1C7CF9]/80 transition-colors"
          >
            Ver em HD →
          </a>
        </div>
      </div>
    </article>
  );
}
