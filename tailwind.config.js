const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#f6f7f5",
            foreground: "#1a2420",
            primary: {
              DEFAULT: "#0f766e",
              foreground: "#ffffff",
            },
            focus: "#0f766e",
          },
        },
        dark: {
          colors: {
            background: "#0d1512",
            foreground: "#e7ede9",
            primary: {
              DEFAULT: "#2dd4bf",
              foreground: "#04140f",
            },
            focus: "#2dd4bf",
          },
        },
      },
    }),
  ],
};
