import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'app_theme_mode';
const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useNativeColorScheme() as ThemeType;
  const { setColorScheme } = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  // ── Charger le thème sauvegardé au démarrage ──
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setMode(saved);
        setColorScheme(saved);
      }
    });
  }, []);

  const theme: ThemeType = mode === 'system'
    ? (systemScheme || 'light')
    : mode;

  const isDark = theme === 'dark';

  const handleSetTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    setColorScheme(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode); // 👈 sauvegarde
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};