/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        'white': '#FFFFFF',
        'uc-blue': '#0747A1',
      },
      fontFamily: {
        avenir: ['var(--font-avenir)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}