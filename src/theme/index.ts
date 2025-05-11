const baseColors = {
    primary: '#E53935',
    primaryVariant: '#B71C1C',
    accent: '#FF7043',
    error: '#D32F2F',
    success: '#4CAF50',
    income: '#4CAF50',
    expense: '#F44336',
    transfer: '#2196F3',
    pieSlice1: '#EF5350',
    pieSlice2: '#FFA726',
    pieSlice3: '#FFEE58',
    pieSlice4: '#9CCC65',
  };
  
  export const lightThemeColors = {
    ...baseColors,
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#E0E0E0',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
    onBackground: '#212121',
    onSurface: '#212121',
    onSurfaceVariant: '#333333',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    textPlaceholder: '#9E9E9E',
    border: '#D1D1D1',
    underline: baseColors.primary,
    tabActive: baseColors.primary,
    tabInactive: '#757575',
    iconDefault: '#757575',
    iconActive: baseColors.primary,
  };
  
  export const darkThemeColors = {
    ...baseColors,
    background: '#1e2126',
    surface: '#1e2126',
    surfaceVariant: '#2d3038',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
    onBackground: '#E0E0E0',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#E0E0E0',
    textPrimary: '#FFFFFF',
    textSecondary: '#BDBDBD',
    textDisabled: '#757575',
    textPlaceholder: '#9E9E9E',
    border: '#2d3038',
    underline: baseColors.primary,
    tabActive: baseColors.primary,
    tabInactive: '#757575',
    iconDefault: '#BDBDBD',
    iconActive: '#FFFFFF',
  };
  
  export const typography = {
    h1: { fontSize: 28, fontWeight: 'bold' as 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' as 'bold' },
    h3: { fontSize: 20, fontWeight: 'bold' as 'bold' },
    h4: { fontSize: 18, fontWeight: '600' as '600' },
    body1: { fontSize: 16, fontWeight: 'normal' as 'normal' },
    body2: { fontSize: 14, fontWeight: 'normal' as 'normal' },
    label: { fontSize: 14, fontWeight: '500' as '500' },
    caption: { fontSize: 12, fontWeight: 'normal' as 'normal' },
    button: { fontSize: 14, fontWeight: 'bold' as 'bold', textTransform: 'uppercase' as 'uppercase' },
  };
  
  export const spacing = {
    xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  };
  
  export type AppThemeColors = typeof lightThemeColors;
  export interface AppTheme {
    colors: AppThemeColors;
    typography: typeof typography;
    spacing: typeof spacing;
    isDark: boolean;
  }
  
  export const createTheme = (isDark: boolean): AppTheme => ({
    colors: isDark ? darkThemeColors : lightThemeColors,
    typography,
    spacing,
    isDark,
  });
  
  // Default export can be one of the themes, or you can export `createTheme`
  // and decide in App.tsx which one to use initially.
  const defaultTheme = createTheme(true); // Default to dark theme
  export default defaultTheme;