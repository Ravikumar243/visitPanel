/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      white: "#ffffff",
      black: "#000000",

      gray: {
        100: "hsl(210, 16%, 93%)",
        200: "hsl(210, 16%, 82%)",
        800: "hsl(210, 7%, 22%)",
      },
      blue: {
        600: "hsl(221, 83%, 53%)",
      },
      red: {
        600: "hsl(360, 91%, 36%)",
      },
      // Add more if you use them in your UI
    },
    extend: {},
  },
  plugins: [],
};
