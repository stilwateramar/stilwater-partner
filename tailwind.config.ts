import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        still: {
          50: "#eff8fb",
          100: "#d6eef5",
          200: "#a8dae8",
          300: "#6cbed4",
          400: "#3a9eb8",
          500: "#1f7f99",
          600: "#17667c",
          700: "#145266",
          800: "#123f51",
          900: "#0f2e3d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
