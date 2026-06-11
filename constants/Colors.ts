const palette = {
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FFD166",
    400: "#F5A623",
    600: "#D97706",
    800: "#92400E",
    900: "#78350F",
  },
  green: {
    400: "#10B981",
    600: "#059669",
  },
  red: {
    400: "#EF4444",
    600: "#DC2626",
  },
  neutral: {
    0: "#FFFFFF",
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E7EB",
    400: "#6B7280",
    500: "#8E8E9E",
    600: "#4B5563",
    800: "#1C1C28",
    850: "#161620",
    900: "#111118",
    950: "#0D0D14",
    1000: "#000000",
  },
};

export const Colors = {
  light: {
    // Backgrounds
    background: palette.neutral[50],
    surface: palette.neutral[0],
    surfaceElevated: palette.neutral[100],

    // Brand
    primary: palette.amber[600],
    primaryLight: palette.amber[100],
    primaryMuted: palette.amber[50],

    // Streak badge accent
    streakGlow: palette.amber[200],

    // Semantic
    success: palette.green[600],
    error: palette.red[600],

    // Text
    textPrimary: "#111827",
    textSecondary: palette.neutral[600],
    textMuted: palette.neutral[400],
    textOnPrimary: palette.neutral[0],

    // Borders
    border: palette.neutral[200],
    borderStrong: "#D1D5DB",
  },

  dark: {
    // Backgrounds
    background: palette.neutral[900],
    surface: palette.neutral[800],
    surfaceElevated: "#252535",

    // Brand
    primary: palette.amber[400],
    primaryLight: "#2A2210",
    primaryMuted: "#1E1A0E",

    // Streak badge accent
    streakGlow: palette.amber[200],

    // Semantic
    success: palette.green[400],
    error: palette.red[400],

    // Text
    textPrimary: palette.neutral[0],
    textSecondary: "#C4C4D4",
    textMuted: palette.neutral[500],
    textOnPrimary: palette.neutral[900],

    // Borders
    border: "#2A2A3A",
    borderStrong: "#3A3A4A",
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;