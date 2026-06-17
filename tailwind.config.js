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
        'uc-navy': '#0A1628',
        'uc-navy-light': '#1A2E4A',
        'uc-blue': '#1D4ED8',
        'uc-blue-light': '#EFF6FF',
      },
    },
  },
  plugins: [],
}