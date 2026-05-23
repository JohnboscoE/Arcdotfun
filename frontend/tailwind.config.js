/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          blue:   "#3B82F6",
          violet: "#7C3AED",
          dark:   "#080C14",
          card:   "#0D1321",
          border: "#1E2D45",
          muted:  "#4A5568",
        }
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "glow-blue":   "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)",
        "glow-violet": "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.1) 0%, transparent 60%)",
      }
    },
  },
  plugins: [],
}