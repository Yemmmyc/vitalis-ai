/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alexa: {
          cyan: '#00CAFF',
          blue: '#0052D4',
          dark: '#0F172A',
          card: '#1E293B',
          glow: '#38BDF8'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'soundwave': 'soundwave 1.2s infinite ease-in-out'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(0, 202, 255, 0.4)' },
          '50%': { boxShadow: '0 0 45px rgba(0, 202, 255, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
