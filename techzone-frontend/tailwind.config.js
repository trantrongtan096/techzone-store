/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E30019',
        darkNavy: '#0F172A',
        lightGray: '#F4F4F4',
        brand: {
          red: '#E30019',
          dark: '#0F172A',
          card: '#ffffff',
          neon: '#ff2e4c',
          accent: '#0284c7'
        }
      }
    },
  },
  plugins: [],
}
