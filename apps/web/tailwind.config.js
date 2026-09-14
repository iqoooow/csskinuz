/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0b0e',
          secondary: '#12141a',
          tertiary: '#1b1e27',
          card: '#151720',
          elevated: '#1f2330'
        },
        brand: {
          gold: '#f59e0b',
          'gold-glow': 'rgba(245, 158, 11, 0.4)',
          cyan: '#06b6d4',
          'cyan-glow': 'rgba(6, 182, 212, 0.4)',
          green: '#10b981',
          red: '#ef4444',
          purple: '#8b5cf6'
        },
        rarity: {
          consumer: '#b0c3d9',
          milspec: '#4b69ff',
          restricted: '#8847ff',
          classified: '#d32ce6',
          covert: '#eb4b4b',
          special: '#ffd700'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
        'glow-covert': '0 0 30px rgba(235, 75, 75, 0.4)',
        'glow-special': '0 0 35px rgba(255, 215, 0, 0.5)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
};
