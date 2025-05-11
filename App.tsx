// App.tsx - Main app entry point
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import storage service for data initialization
import { initializeDefaultData } from './src/services/storageService';

// Import navigators
import AppNavigator from './src/navigators/AppNavigator';

// Import context providers
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountProvider } from './src/contexts/AccountContext';
import { BudgetProvider } from './src/contexts/BudgetContext';
import { CategoryProvider } from './src/contexts/CategoryContext';
import { AppThemeProvider, useAppTheme } from './src/contexts/ThemeContext';
import { TransactionProvider } from './src/contexts/TransactionContext';

// Root app component
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize app data when the app starts
  useEffect(() => {
    const prepareApp = async () => {
      try {
        console.log('App initialization starting...');
        
        // Clear transaction loaded flag on app startup
        // This ensures fresh data loads when app is completely restarted
        await AsyncStorage.removeItem('transactionsLoaded');
        
        // Initialize default data if needed
        await initializeDefaultData();
        
        // Add any other initialization tasks here
        
        // Wait a bit to simulate longer loading
        // You can remove this in production
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('App initialization complete.');
      } catch (error) {
        console.error('Error initializing app data:', error);
        // Handle initialization errors, but still mark app as ready
      } finally {
        setAppIsReady(true);
      }
    };

    prepareApp();
  }, []);

  // Show a loading screen until app is ready
  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <ThemedApp />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

// Component that uses the theme context
const ThemedApp = () => {
  const { theme } = useAppTheme();

  // Create customized Paper themes using our app theme colors
  const paperTheme = theme.isDark 
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: theme.colors.primary,
          onPrimary: theme.colors.onPrimary,
          background: theme.colors.background,
          surface: theme.colors.surface,
          error: theme.colors.error
        }
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: theme.colors.primary,
          onPrimary: theme.colors.onPrimary,
          background: theme.colors.background,
          surface: theme.colors.surface,
          error: theme.colors.error
        }
      };

  return (
    <PaperProvider theme={paperTheme}>
      <AccountProvider>
        <CategoryProvider>
          <TransactionProvider>
            <BudgetProvider>
              <NavigationContainer
                theme={theme.isDark ? DarkTheme : DefaultTheme}
              >
                <StatusBar
                  barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                  backgroundColor={theme.colors.background}
                />
                <AppNavigator />
              </NavigationContainer>
            </BudgetProvider>
          </TransactionProvider>
        </CategoryProvider>
      </AccountProvider>
    </PaperProvider>
  );
};