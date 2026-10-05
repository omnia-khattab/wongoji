/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main-black': '#222831',
        'main-gray': '#393E46',
        'dark-beige': '#948979',
        'light-beige': '#DFD0B8',
      },
    },
  },
  plugins: [],
}