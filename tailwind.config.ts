import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-elevated": "rgb(var(--bg-elevated) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2) / <alpha-value>)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "blur-in": "blurIn 0.9s ease-out forwards",
        shimmer: "shimmer 2.4s linear infinite",
        "gradient-x": "gradientX 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        grid: "grid 18s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blurIn: {
          "0%": { opacity: "0", filter: "blur(16px)", transform: "translateY(16px)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        grid: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
