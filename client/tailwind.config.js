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
        primary: {
          DEFAULT: '#2563EB', // Blue
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#22C55E', // Green
          light: '#4ADE80',
          dark: '#15803D',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FBBF24',
          dark: '#B45309',
        },
        background: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        darkSurface: {
          DEFAULT: '#1E293B',
          light: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(37, 99, 235, 0.08), 0 2px 15px -5px rgba(0, 0, 0, 0.03)',
        glass: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
