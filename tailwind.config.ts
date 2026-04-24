import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
      },
      colors: {
        // Stillwater brand palette: deep teal → sea → mist → sand → cream.
        still: {
          50: "#f5f1e8", // cream / sand light
          100: "#e8e0cc", // sand
          200: "#d9c8a9", // deep sand
          300: "#b9c6c2", // mist
          400: "#7aa9a4", // sea light
          500: "#4a8581", // sea
          600: "#2c5a5e", // deep sea
          700: "#1d4148", // teal
          800: "#16313a", // deep teal
          900: "#0e1f24", // brand dark (header)
        },
        sand: {
          100: "#efe6d2",
          200: "#e0cda6",
          300: "#c8b79a",
        },
      },
      boxShadow: {
        brand: "0 30px 60px -30px rgba(14, 31, 36, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
