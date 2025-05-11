// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as storageService from '../services/storageService';

// Theme type definition
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryVariant: string;
  onPrimary: string;
  secondary: string;
  secondaryVariant: string;
  onSecondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  error: string;
  onError: string;
  success: string;
  onSuccess: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  income: string;
  expense: string;
}

interface Theme {
  isDark: boolean;
  colors: ThemeColors;
}

interface AppThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: Theme;
}

// Define dark theme colors - Updated to match the design
const darkColors: ThemeColors = {
  primary: '#60A5FA', // Blue-400 for primary buttons and accents
  primaryVariant: '#3B82F6', // Blue-500
  onPrimary: '#000000',
  secondary: '#10B981', // Green-500
  secondaryVariant: '#059669', // Green-600
  onSecondary: '#000000',
  background: '#111827', // Dark gray - Gray-900 from Tailwind
  surface: '#1F2937', // Slightly lighter gray - Gray-800 from Tailwind
  surfaceVariant: '#374151', // Gray-700 from Tailwind
  onSurface: '#FFFFFF',
  error: '#F87171', // Red-400 
  onError: '#000000',
  success: '#4CAF50',
  onSuccess: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF', // Gray-400 from Tailwind
  border: '#374151', // Gray-700 from Tailwind
  income: '#60A5FA', // Blue-400 for income (from the design)
  expense: '#F87171', // Red-400 for expense (from the design)
};

// Define light theme colors
const lightColors: ThemeColors = {
  primary: '#3B82F6', // Blue-500
  primaryVariant: '#2563EB', // Blue-600
  onPrimary: '#FFFFFF',
  secondary: '#10B981', // Green-500
  secondaryVariant: '#059669', // Green-600
  onSecondary: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#E0E0E0',
  onSurface: '#000000',
  error: '#EF4444', // Red-500
  onError: '#FFFFFF',
  success: '#10B981', // Green-500
  onSuccess: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#6B7280', // Gray-500
  border: '#E0E0E0',
  income: '#3B82F6', // Blue-500 for income
  expense: '#EF4444', // Red-500 for expense
};

// Create dark and light themes
const darkTheme: Theme = {
  isDark: true,
  colors: darkColors,
};

const lightTheme: Theme = {
  isDark: false,
  colors: lightColors,
};

// Create context
export const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

// Context provider component
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();
  
  // State for theme mode (system, light, dark)
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const settings = await storageService.getSettings();
        if (settings && settings.theme) {
          setThemeMode(settings.theme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        const settings = await storageService.getSettings();
        await storageService.saveSettings({ ...settings, theme: themeMode });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };
    
    saveThemePreference();
  }, [themeMode]);
  
  // Determine active theme based on theme mode and system settings
  const activeTheme = React.useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemColorScheme]);

  // Create context value
  const contextValue: AppThemeContextType = {
    themeMode,
    setThemeMode,
    theme: activeTheme,
  };

  return (
    <AppThemeContext.Provider value={contextValue}>
      {children}
    </AppThemeContext.Provider>
  );
};

// Hook to use the app theme
export const useAppTheme = (): AppThemeContextType => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};