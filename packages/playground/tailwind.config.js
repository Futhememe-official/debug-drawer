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
        // Light mode palette
        bg:       '#f2f1ed',
        surface:  '#ffffff',
        surface2: '#f7f6f3',
        surface3: '#eeecea',
        border:   '#e2dfd9',
        border2:  '#ccc9c2',
        tx:       '#1a1917',
        muted:    '#7a7872',
        muted2:   '#a09d97',

        // Accent
        accent:   '#FF5623',
        'accent-dim': 'rgba(255,86,35,0.08)',
        'accent-border': 'rgba(255,86,35,0.25)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.32s cubic-bezier(0.32,0.72,0,1) both',
        'fade-in':  'fade-in 0.2s ease both',
        'fade-up':  'fade-up 0.35s ease both',
        spin:       'spin 0.7s linear infinite',
        pulse:      'pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
