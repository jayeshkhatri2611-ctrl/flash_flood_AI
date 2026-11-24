/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spec design system tokens
        app: {
          bg: '#080E1B',
          sidebar: '#0D1729',
          card: '#121F33',
          elevated: '#192940',
          border: '#1B2B45',
          borderSubtle: 'rgba(59, 130, 246, 0.15)',
          primary: '#3B82F6',
          cyan: '#22D3EE',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        // Backward-compatible bb.* tokens aligned to new palette
        bb: {
          bg: '#080E1B',
          sidebar: '#0D1729',
          card: '#121F33',
          panel: '#192940',
          border: '#1B2B45',
          'border-subtle': 'rgba(59, 130, 246, 0.15)',
          accent: '#3B82F6',
          'accent-bright': '#22D3EE',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        risk: {
          critical: '#EF4444',
          high: '#F97316',
          moderate: '#FACC15',
          low: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '10px',
        panel: '12px',
        pill: '9999px'
      },
      boxShadow: {
        flat: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        card: '0 4px 16px -2px rgba(0, 0, 0, 0.35)',
        glow: '0 0 20px -3px rgba(59, 130, 246, 0.25)',
        cyanGlow: '0 0 20px -3px rgba(34, 211, 238, 0.25)',
        criticalGlow: '0 0 24px -2px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
