/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "#0F172A",
          secondary: "#1E293B",
          tertiary: "#334155",
        },
        primary: {
          DEFAULT: "#22D3EE",
          50: "#CFFAFE",
          100: "#A5F3FC",
          200: "#67E8F9",
          300: "#22D3EE",
          400: "#06B6D4",
          500: "#0891B2",
          600: "#0E7490",
          700: "#155E75",
          800: "#164E63",
          900: "#083344",
        },
        secondary: {
          DEFAULT: "#A855F7",
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
        },
        surface: {
          DEFAULT: "#1E293B",
          hover: "#334155",
          border: "#475569",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Noto Sans SC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)",
        "gradient-mixed":
          "linear-gradient(135deg, #22D3EE 0%, #A855F7 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        "gradient-glow-cyan":
          "radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, transparent 70%)",
        "gradient-glow-purple":
          "radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-cyan":
          "0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1)",
        "glow-cyan-lg":
          "0 0 30px rgba(34, 211, 238, 0.4), 0 0 60px rgba(34, 211, 238, 0.2)",
        "glow-purple":
          "0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)",
        "glow-purple-lg":
          "0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)",
        "glow-success":
          "0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)",
        "glow-danger":
          "0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)",
        "card-dark":
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-cyan": "glowCyan 2s ease-in-out infinite alternate",
        "glow-purple": "glowPurple 2s ease-in-out infinite alternate",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        glowCyan: {
          "0%": { boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(34, 211, 238, 0.6)" },
        },
        glowPurple: {
          "0%": { boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(168, 85, 247, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
