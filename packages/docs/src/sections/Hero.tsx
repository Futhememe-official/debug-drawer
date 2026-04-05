// src/sections/Hero.tsx
import { useState, useEffect } from "react";

const INSTALL_CMD = "pnpm add @withgus/debug msw zustand vaul";

function TerminalLine({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  );
}

export function Hero() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="bg-hero w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,86,35,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hero-border bg-hero-surface mb-6 sm:mb-8 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
          <span className="font-mono text-[10px] sm:text-[11px] text-hero-muted tracking-wide">
            v1.2.3 — open source
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-hero-tx leading-[1.1] tracking-tight mb-4 sm:mb-6 animate-fade-up px-2"
          style={{ animationDelay: "80ms" }}
        >
          Mock API scenarios{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #FF5623 0%, #ff8c5a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            per page
          </span>{" "}
          at runtime
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg text-hero-muted max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 animate-fade-up px-2"
          style={{ animationDelay: "160ms" }}
        >
          A debug drawer that integrates with{" "}
          <span className="text-hero-tx font-medium">MSW</span> and{" "}
          <span className="text-hero-tx font-medium">Zustand</span> to switch
          mock scenarios without touching code or restarting the dev server.
        </p>

        {/* Terminal + CTAs */}
        <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          {/* Terminal */}
          <div className="bg-hero-surface border border-hero-border rounded-xl overflow-hidden w-full max-w-lg mx-auto text-left mb-6 sm:mb-8">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-hero-border">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] flex-shrink-0" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] flex-shrink-0" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] flex-shrink-0" />
              <span className="font-mono text-[10px] text-hero-muted ml-2">
                terminal
              </span>
            </div>
            <div className="px-4 py-4 space-y-2 overflow-x-auto">
              <TerminalLine delay={400}>
                <span className="font-mono text-xs sm:text-sm whitespace-nowrap">
                  <span className="text-hero-muted">$</span>{" "}
                  <span className="text-hero-tx">{INSTALL_CMD}</span>
                  <span className="inline-block w-2 h-4 bg-accent ml-0.5 translate-y-0.5 animate-cursor" />
                </span>
              </TerminalLine>
              <TerminalLine delay={1200}>
                <span className="font-mono text-xs text-hero-muted whitespace-nowrap">
                  Packages: +4 added (msw, zustand, vaul, @msw-debug/drawer)
                </span>
              </TerminalLine>
              <TerminalLine delay={1600}>
                <span className="font-mono text-xs text-[#28c840]">
                  ✓ Done in 1.2s
                </span>
              </TerminalLine>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-2">
            <a
              href="#docs"
              className="w-full sm:w-auto px-6 py-2.5 bg-accent text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Get started
            </a>
            <button
              onClick={copy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-hero-surface border border-hero-border text-hero-tx font-mono text-xs sm:text-sm rounded-lg hover:border-hero-muted transition-colors min-w-0"
            >
              {copied ? (
                <>
                  <span className="text-[#28c840]">✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon />
                  {/* Show short version on mobile, full on desktop */}
                  <span className="sm:hidden">{INSTALL_CMD}</span>
                  <span className="hidden sm:inline truncate max-w-[280px]">
                    {INSTALL_CMD}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll hint — hidden on very small screens */}
      <div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 animate-fade-in"
        style={{ animationDelay: "2s" }}
      >
        <span className="font-mono text-[10px] text-hero-muted tracking-widest uppercase">
          scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-hero-muted to-transparent" />
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      className="flex-shrink-0"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
