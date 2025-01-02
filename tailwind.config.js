/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-amaranth)"],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        black: "#000000",
        purple: "#9000BD",
        pink: "#FF40B1",
        blue: "#184BC2",
        green: "#35CB8F",
        orange: "#E29D6B",
        grey: "#E1DAFF",
        lightpurple: "#B8AFE0",
        darkblue: "#00184E",
        darkgrey: "#474747",
      },
    },
  },
  plugins: [],
};
