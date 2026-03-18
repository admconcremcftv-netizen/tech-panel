import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(142, 93%, 8%)",
          foreground: "hsl(0, 0%, 100%)",
          hover: "hsl(142, 93%, 15%)",
        },
        secondary: {
          DEFAULT: "hsl(210, 51%, 24%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        background: "hsl(214, 32%, 97%)",
        foreground: "hsl(210, 24%, 24%)",
        muted: {
          DEFAULT: "hsl(214, 32%, 91%)",
          foreground: "hsl(213, 12%, 52%)",
        },
        border: "hsl(214, 32%, 91%)",
        input: "hsl(214, 32%, 91%)",
        ring: "hsl(142, 93%, 8%)",
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(210, 24%, 24%)",
        },
        status: {
          success: "hsl(142, 93%, 8%)",
          warning: "hsl(27, 90%, 65%)",
          danger: "hsl(0, 93%, 74%)",
          info: "hsl(204, 71%, 57%)",
        },
        sidebar: {
          background: "hsl(142, 93%, 8%)",
          foreground: "hsl(0, 0%, 100%)",
          primary: "hsl(142, 93%, 15%)",
          "primary-foreground": "hsl(0, 0%, 100%)",
          accent: "hsl(142, 93%, 15%)",
          "accent-foreground": "hsl(0, 0%, 100%)",
          border: "hsl(142, 93%, 15%)",
          ring: "hsl(142, 93%, 8%)",
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
