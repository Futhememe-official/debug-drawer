// src/components/CodeBlock.tsx
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const highlighted = highlight(code);

  return (
    <div className="rounded-xl relative border border-canvas-border overflow-hidden bg-[#fafaf8] text-sm">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-canvas-border bg-canvas-code">
          <span className="font-mono text-[11px] text-canvas-muted">
            {filename}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 font-mono text-[10px] text-canvas-muted hover:text-canvas-tx transition-colors"
          >
            {copied ? (
              <>
                <span className="text-emerald-600">✓</span> Copied
              </>
            ) : (
              <>
                <CopyIcon /> Copy
              </>
            )}
          </button>
        </div>
      )}
      {!filename && (
        <div className="absolute flex justify-end px-3 pt-3 right-0">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 font-mono text-[10px] text-canvas-muted hover:text-canvas-tx transition-colors"
          >
            {copied ? (
              <>
                <span className="text-emerald-600">✓</span> Copied
              </>
            ) : (
              <>
                <CopyIcon /> Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre className="px-4 py-4 overflow-x-auto leading-relaxed">
        <code
          className="font-mono text-[12.5px]"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// Simple syntax highlighter — no external deps
function highlight(code: string): string {
  return (
    code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // strings
      .replace(
        /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
        '<span style="color:#16a34a">$1</span>',
      )
      // comments
      .replace(
        /(\/\/[^\n]*)/g,
        '<span style="color:#9ca3af;font-style:italic">$1</span>',
      )
      // keywords
      .replace(
        /\b(import|export|from|const|let|var|function|async|await|return|if|else|type|interface|default|extends)\b/g,
        '<span style="color:#7c3aed">$1</span>',
      )
      // types / components (capitalized)
      .replace(
        /\b([A-Z][a-zA-Z0-9]*)\b/g,
        '<span style="color:#0369a1">$1</span>',
      )
      // functions
      .replace(
        /\b([a-z][a-zA-Z0-9]*)(?=\s*\()/g,
        '<span style="color:#d97706">$1</span>',
      )
      // numbers
      .replace(/\b(\d+)\b/g, '<span style="color:#dc2626">$1</span>')
      // punctuation / brackets
      .replace(/([{}[\]()])/g, '<span style="color:#71717a">$1</span>')
  );
}
