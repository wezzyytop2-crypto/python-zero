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
        brand: {
          50: '#f2fcf0',
          100: '#e1f8de',
          200: '#c3f2bd',
          300: '#94e88b',
          400: '#58cc02', // Duolingo Iconic Green
          500: '#46a302',
          600: '#378202',
          700: '#2b6305',
          800: '#264f0a',
          900: '#21420c',
          950: '#0e2404',
        },
        duo: {
          green: '#58cc02',
          greenDark: '#46a302',
          blue: '#1cb0f6',
          blueDark: '#1899d6',
          amber: '#ff9600',
          amberDark: '#e58600',
          rose: '#ff4b4b',
          roseDark: '#ea2b2b',
          yellow: '#ffc800',
          yellowDark: '#e5b400',
          purple: '#ce82ff',
          purpleDark: '#a559e8',
          card: '#ffffff',
          cardDark: '#1f2e35',
          bg: '#f7f7f7',
          bgDark: '#131f24',
          border: '#e5e5e5',
          borderDark: '#37464f',
        },
        python: {
          blue: '#3776AB',
          yellow: '#FFD438',
          dark: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
