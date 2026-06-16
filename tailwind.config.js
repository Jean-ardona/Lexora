/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily : {
        "geist" : ['Geist-Regular'],
        "geist-bold" : ['Geist-Bold'],
        "inter" : ['Inter-Regular'],
        "inter-bold" : ['Inter-Bold'],
      },
      colors:{
          bg:{light : "#FAF8F4",dark : "#131210", streakLight : "#FFF7EC", streakDark : "#1F1508", cardLight : "#FFFFFF", cardDark : "#1E1C19"},
          primary:{light : "#1A1714",dark : "#F5F2ED"},
          secondary:{light : "#6B6560",dark : "#9B9088"},
          muted:{light : "#A89F96",dark : "#5C5651"},
          accent:{DEFAULT : "#E85D26"},
          accentSoft:{light : "#FDE8DC", dark: "#2A1A0F"},
          accentText:{light : "#C44A18", dark: "#F07A4A"},
          border:{light : "#1a171417",dark : "#f5f2ed12", streakLight : "#F5C887", streakDark : "#6B4A12"},
          borderMedium:{light : "#1a171424",dark : "#f5f2ed1f"},
          shadow:{cardLight : "0 2px 16px rgba(26,23,20,0.06), 0 1px 4px rgba(26,23,20,0.04)", cardDark : "0 2px 20px rgba(0,0,0,0.35), 0 1px 6px rgba(0,0,0,0.25)", btnLight : "0 2px 8px rgba(26,23,20,0.08), 0 1px 3px rgba(26,23,20,0.05)", btnDark : "0 2px 10px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)"},
      }
    },
  },
  plugins: [],
}