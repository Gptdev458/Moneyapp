import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { darkThemeColors, lightThemeColors } from './index';

// Create Paper themes using our existing theme colors
export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkThemeColors.primary,
    onPrimary: darkThemeColors.onPrimary,
    primaryContainer: darkThemeColors.primaryVariant,
    secondary: darkThemeColors.accent,
    onSecondary: darkThemeColors.onAccent,
    surface: darkThemeColors.surface,
    onSurface: darkThemeColors.onSurface,
    background: darkThemeColors.background,
    error: darkThemeColors.error,
    success: darkThemeColors.success,
  },
  // Our app already uses dark theme by default, so we'll set this to true
  dark: true,
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightThemeColors.primary,
    onPrimary: lightThemeColors.onPrimary,
    primaryContainer: lightThemeColors.primaryVariant,
    secondary: lightThemeColors.accent,
    onSecondary: lightThemeColors.onAccent,
    surface: lightThemeColors.surface,
    onSurface: lightThemeColors.onSurface,
    background: lightThemeColors.background,
    error: lightThemeColors.error,
    success: lightThemeColors.success,
  },
  dark: false,
}; 