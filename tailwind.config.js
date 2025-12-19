export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1a1a1a',
          200: '#141414',
          300: '#0a0a0a'
        },
        accent: {
          blue: '#00bfff',
          green: '#00ff88',
          red: '#ff4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
