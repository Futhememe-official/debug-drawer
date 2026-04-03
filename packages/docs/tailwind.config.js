/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Courier New', 'monospace'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        // hero (dark)
        hero: '#09090b',
        'hero-surface': '#111113',
        'hero-border': '#27272a',
        'hero-muted': '#71717a',
        'hero-tx': '#fafafa',

        // docs (light)
        canvas: '#ffffff',
        'canvas-bg': '#f9f9f8',
        'canvas-border': '#e5e4e0',
        'canvas-border2': '#d0cfc9',
        'canvas-tx': '#18181b',
        'canvas-muted': '#71717a',
        'canvas-muted2': '#a1a1aa',
        'canvas-surface': '#f4f4f2',
        'canvas-code': '#f1f0ec',

        // accent
        accent: '#FF5623',
        'accent-dim': 'rgba(255,86,35,0.08)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        cursor: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease both',
        'fade-in': 'fade-in 0.4s ease both',
        cursor: 'cursor 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
