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
        "bg-2": "rgb(var(--bg-2) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-strong": "rgb(var(--text-strong) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "grad-1": "rgb(var(--grad-1) / <alpha-value>)",
        "grad-2": "rgb(var(--grad-2) / <alpha-value>)",
        "grad-3": "rgb(var(--grad-3) / <alpha-value>)",
      },
      borderColor: {
        DEFAULT: "rgb(var(--line) / 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
