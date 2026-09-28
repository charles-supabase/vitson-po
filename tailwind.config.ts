import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F6F3",
        "paper-raised": "#FFFFFF",
        ink: "#14213D",
        "ink-soft": "#4B5568",
        "ink-faint": "#8A94A6",
        line: "#D8DCE1",
        accent: "#8A6D3B",
        "accent-soft": "#EFE7D8",
        danger: "#A13D3D",
        "danger-soft": "#F5E6E6",
        success: "#2F6E52",
        "success-soft": "#E5EFE9",
      },
      fontFamily: {
        display: ["var(--font-source-serif)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
