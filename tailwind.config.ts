import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: "#f3f6fa",
          bgDark: "#0f172a",
          cardLight: "#ffffff",
          cardDark: "#1e293b",
          lavender: "#e0e7ff",
          peach: "#ffe4e6",
          mint: "#dcfce7",
          sky: "#e0f2fe",
          sun: "#fef3c7",
          purple: "#f3e8ff",
        },
      },
      boxShadow: {
        clay: "8px 8px 16px rgba(163, 177, 198, 0.35), -8px -8px 16px rgba(255, 255, 255, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
        clayHover: "12px 12px 24px rgba(163, 177, 198, 0.45), -12px -12px 24px rgba(255, 255, 255, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.8)",
        clayDark: "8px 8px 20px rgba(0, 0, 0, 0.5), -4px -4px 12px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
        clayBtn: "4px 4px 10px rgba(0, 0, 0, 0.12), inset 0 2px 2px rgba(255, 255, 255, 0.6)",
        clayInset: "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
