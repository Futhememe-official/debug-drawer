// src/sections/Hero.tsx
import { useState, useEffect } from 'react'

const INSTALL_CMD = 'pnpm add @msw-debug/drawer msw zustand'

function TerminalLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}

export function Hero() {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(INSTALL_CMD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="bg-hero min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(255,86,35,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hero-border bg-hero-surface mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[11px] text-hero-muted tracking-wide">v1.0.0 — open source</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-hero-tx leading-[1.1] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
          Mock API scenarios{' '}
          <span style={{ background: 'linear-gradient(135deg, #FF5623 0%, #ff8c5a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            per page
          </span>
          {' '}at runtime
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-hero-muted max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '160ms' }}>
          A debug drawer that integrates with{' '}
          <span className="text-hero-tx font-medium">MSW</span> and{' '}
          <span className="text-hero-tx font-medium">Zustand</span> to switch mock scenarios
          without touching code or restarting the dev server.
        </p>

        {/* Terminal */}
        <div className="animate-fade-up" style={{ animationDelay: '240ms' }}>
          <div className="bg-hero-surface border border-hero-border rounded-xl overflow-hidden max-w-lg mx-auto text-left mb-8">
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-hero-border">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="font-mono text-[10px] text-hero-muted ml-2">terminal</span>
            </div>
            {/* Terminal body */}
            <div className="px-4 py-4 space-y-2">
              <TerminalLine delay={400}>
                <span className="font-mono text-sm">
                  <span className="text-hero-muted">$</span>{' '}
                  <span className="text-hero-tx">{INSTALL_CMD}</span>
                  <span className="inline-block w-2 h-4 bg-accent ml-0.5 translate-y-0.5 animate-cursor" />
                </span>
              </TerminalLine>
              <TerminalLine delay={1200}>
                <span className="font-mono text-xs text-hero-muted">Packages: +3 added (msw, zustand, @msw-debug/drawer)</span>
              </TerminalLine>
              <TerminalLine delay={1600}>
                <span className="font-mono text-xs text-[#28c840]">✓ Done in 1.2s</span>
              </TerminalLine>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#docs" className="px-6 py-2.5 bg-accent text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity">
              Get started
            </a>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-6 py-2.5 bg-hero-surface border border-hero-border text-hero-tx font-mono text-sm rounded-lg hover:border-hero-muted transition-colors"
            >
              {copied ? (
                <><span className="text-[#28c840]">✓</span> Copied!</>
              ) : (
                <><CopyIcon />{INSTALL_CMD}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '2s' }}>
        <span className="font-mono text-[10px] text-hero-muted tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-hero-muted to-transparent" />
      </div>
    </section>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}
