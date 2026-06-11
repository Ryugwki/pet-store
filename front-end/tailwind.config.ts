import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bronze: {
          DEFAULT: "#a07c45",
          deep: "#846332",
          soft: "#c8ad85",
        },
        ivory: "#faf7f2",
        cream: "#f3ede2",
        charcoal: "#26221c",
      },
    },
  },
  plugins: [],
};

export default config;
