import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        panel: "var(--panel-bg)",
        secondary: "var(--secondary-bg)",
        border: "var(--border)",
        muted: "var(--text-muted)",
        hover: "var(--hover-bg)",
        code: "var(--code-bg)",
      },
    },
  },
  plugins: [],
};
export default config;
