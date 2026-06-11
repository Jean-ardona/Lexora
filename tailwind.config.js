/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // --- Brand ---
        primary: {
          DEFAULT: "#F5A623",   // dark mode
          light: "#D97706",     // light mode
          muted: "#2A2210",     // dark bg subtle
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FFD166",
          400: "#F5A623",
          600: "#D97706",
          800: "#92400E",
        },

        // --- Backgrounds ---
        background: {
          DEFAULT: "#111118",   // dark
          light: "#FAFAFA",     // light
        },
        surface: {
          DEFAULT: "#1C1C28",   // dark card
          light: "#FFFFFF",     // light card
          elevated: {
            DEFAULT: "#252535", // dark elevated
            light: "#F5F5F5",   // light elevated
          },
        },

        // --- Text ---
        content: {
          primary: {
            DEFAULT: "#FFFFFF",
            light: "#111827",
          },
          secondary: {
            DEFAULT: "#C4C4D4",
            light: "#4B5563",
          },
          muted: {
            DEFAULT: "#8E8E9E",
            light: "#6B7280",
          },
        },

        // --- Semantic ---
        success: {
          DEFAULT: "#10B981",
          light: "#059669",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#DC2626",
        },

        // --- Borders ---
        border: {
          DEFAULT: "#2A2A3A",
          light: "#E5E7EB",
          strong: {
            DEFAULT: "#3A3A4A",
            light: "#D1D5DB",
          },
        },
      },

      fontFamily: {
        'playfair': ['PlayfairDisplay_700Bold'],
        'playfair-regular': ['PlayfairDisplay_400Regular'],
        'playfair-black': ['PlayfairDisplay_800ExtraBold'],
        'inter': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },

      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
    },
  },
  plugins: [],
};