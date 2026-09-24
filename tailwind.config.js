/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Ubuntu", "sans-serif"],
      },
      backgroundImage: {
        home: "url('/assets/bg-capa-spaceburguer.jpg')",
      },
    },
  },
  plugins: [],
};
