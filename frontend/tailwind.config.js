/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bb: {
          bg: '#080F1F',
          sidebar: '#0B1427',
          card: '#111D33',
          panel: '#17243B',
          border: '#1E2D4A',
          'border-subtle': 'rgba(0, 168, 255, 0.16)',
          accent: '#00A8FF',
          'accent-bright': '#00D4FF',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        // Backwards compatibility with previous classes
        command: {
          darkest: '#080F1F',
          darker: '#0B1427',
          dark: '#111D33',
          card: '#17243B',
          border: '#1E2D4A',
          accent: '#00A8FF',
          muted: '#94A3B8'
        },
        risk: {
          critical: '#EF4444',
          high: '#F97316',
          moderate: '#FACC15',
          low: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '8px'
      },
      boxShadow: {
        flat: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        subtle: '0 2px 8px -2px rgba(0, 168, 255, 0.08)'
      }
    },
  },
  plugins: [],
}
