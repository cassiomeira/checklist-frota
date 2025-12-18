/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: '#0f172a', // Slate-950
          surface: '#1e293b', // Slate-800
          accent: '#fbbf24', // Amber-400
          text: '#f1f5f9', // Slate-100
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-industrial': 'linear-gradient(to bottom right, #1e293b, #0f172a)',
      }
    },
  },
  plugins: [],
}
