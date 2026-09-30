/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F2C59",
          blue: "#1E56A0",
          light: "#E8F1F5",
          accent: "#2670b7",
        }
      }
    },
  },
  plugins: [],
}
