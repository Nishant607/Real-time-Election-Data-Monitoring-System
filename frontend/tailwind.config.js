/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: "rgba(15, 23, 42, 0.4)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        accent: {
          blue: "#38bdf8",
          orange: "#ea580c",
          red: "#ef4444",
          purple: "#a855f7",
          green: "#10b981",
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
