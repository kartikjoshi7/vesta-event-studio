/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vesta: {
          midnight: '#0f0e17',
          surface: '#1a1929',
          card: '#232136',
          border: '#2e2b45',
          muted: '#6e6a86',
          text: '#e0def4',
          gold: '#f6c177',
          rose: '#eb6f92',
          iris: '#c4a7e7',
          pine: '#31748f',
          foam: '#9ccfd8',
          success: '#56d67e',
          warning: '#f6c177',
          danger: '#eb6f92',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
