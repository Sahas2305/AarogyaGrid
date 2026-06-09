/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#00d4ff',
        'brand-blue': '#0066cc',
        'surface-primary': '#0a1628',
        'surface-secondary': '#112255',
        'surface-card': '#0d2044',
        'brand-success': '#00c853',
        'brand-warning': '#ffab00',
        'brand-danger': '#ff1744',
        'brand-purple': '#7c4dff',
        'text-primary': '#ffffff',
        'text-secondary': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { borderColor: 'rgba(0, 212, 255, 0.4)' },
          '50%': { borderColor: 'rgba(0, 212, 255, 1)' },
        }
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
