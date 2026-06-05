/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#fff0ec',
          100: '#ffe1d9',
          200: '#ffc7b8',
          300: '#ffa38c',
          400: '#ff7a59', // HubSpot Orange primary
          500: '#ff7a59', // HubSpot Orange primary
          600: '#ff5c35', 
          700: '#e5431c', 
          800: '#bf3210', 
          900: '#992408',
          950: '#531002',
        }
      }
    },
  },
  plugins: [],
}
