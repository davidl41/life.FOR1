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
        rpg: {
          dark: '#0f172a',
          card: '#1e293b',
          gold: '#f59e0b',
          amber: '#d97706',
          energy: '#10b981',
          crimson: '#ef4444',
          mystic: '#8b5cf6',
          slate: '#334155'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
