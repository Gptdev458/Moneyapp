// src/navigators/AppNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppTheme } from '../contexts/ThemeContext';
import { BottomTabParamList, RootStackParamList } from '../types';

// Import screens for the bottom tabs
import AccountsScreen from '../screens/AccountsScreen/AccountsScreen';
import BudgetScreen from '../screens/BudgetScreen/BudgetScreen';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import MoreScreen from '../screens/MoreScreen/MoreScreen';
import StatsScreen from '../screens/StatsScreen/StatsScreen';

// Import screens for modal/full-screen routes
import AccountSettingsScreen from '../screens/AccountSettingsScreen/AccountSettingsScreen';
import AccountDetailScreen from '../screens/AccountsScreen/AccountDetailScreen';
import AddTransactionScreen from '../screens/AddTransaction/AddTransactionScreen';
import AddBudgetScreen from '../screens/BudgetScreen/AddBudgetScreen';
import CategorySettingsScreen from '../screens/CategorySettingsScreen/CategorySettingsScreen';
import CategoryDetailStatsScreen from '../screens/StatsScreen/CategoryDetailStatsScreen';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Custom TabBar with FAB
const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { theme } = useAppTheme();
  
  return (
    <View style={[styles.tabBarContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;
        
        // Center FAB should replace the middle tab
        if (index === 2) {
          return (
            <View key={route.key} style={styles.fabContainer}>
              <TouchableOpacity 
                style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        }
        
        // Skip the middle position in the normal tab rendering
        if (index === Math.floor(state.routes.length / 2)) {
          return <View key={`spacer-${route.key}`} style={styles.tabButton} />;
        }
        
        let iconName = '';
        if (route.name === 'TransactionsTab') {
          iconName = 'format-list-bulleted-square';
        } else if (route.name === 'BudgetTab') {
          iconName = isFocused ? 'chart-bar' : 'chart-bar-stacked';
        } else if (route.name === 'StatsTab') {
          iconName = 'chart-pie';
        } else if (route.name === 'AccountsTab') {
          iconName = isFocused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'MoreTab') {
          iconName = isFocused ? 'dots-horizontal-circle' : 'dots-horizontal-circle-outline';
        }
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <MaterialCommunityIcons 
              name={iconName} 
              size={24} 
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <View style={styles.tabLabelContainer}>
              {typeof label === 'string' && (
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: isFocused ? theme.colors.primary : theme.colors.textSecondary }
                  ]}
                >
                  {options.tabBarLabel || label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Bottom Tab Navigator
const MainTabNavigator = () => {
  const { theme } = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'left',
        tabBarShowLabel: true,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen 
        name="TransactionsTab" 
        component={HomeScreen}
        options={{ title: 'Transactions', headerShown: false }}
      />
      <Tab.Screen 
        name="BudgetTab" 
        component={BudgetScreen}
        options={{ title: 'Budget', tabBarLabel: 'Budget', headerShown: false }}
      />
      <Tab.Screen 
        name="StatsTab" 
        component={StatsScreen}
        options={{ title: 'Statistics', tabBarLabel: 'Stats', headerShown: false }}
      />
      <Tab.Screen 
        name="AccountsTab" 
        component={AccountsScreen}
        options={{ title: 'Accounts', headerShown: false }}
      />
      <Tab.Screen 
        name="MoreTab" 
        component={MoreScreen}
        options={{ title: 'More', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = () => {
  const { theme } = useAppTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        cardStyle: { backgroundColor: theme.colors.background },
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="MainAppTabs" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={({ route }) => ({
          title: route.params?.transactionId 
            ? 'Edit Transaction' 
            : 'New Transaction',
        })}
      />
      <Stack.Screen 
        name="AddBudget" 
        component={AddBudgetScreen}
        options={({ route }) => ({
          title: route.params?.budgetId 
            ? 'Edit Budget' 
            : 'New Budget',
          headerShown: false,
        })}
      />
      <Stack.Screen 
        name="AccountDetail" 
        component={AccountDetailScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen 
        name="CategoryDetailStats" 
        component={CategoryDetailStatsScreen}
        options={({ route }) => ({
          title: route.params?.type === 'income' ? 'Income Category' : 'Expense Category',
        })}
      />
      <Stack.Screen 
        name="AllTransactions" 
        component={require('../screens/TransactionsScreen/TransactionsScreen').default}
        options={() => ({
          title: 'All Transactions',
        })}
      />
      <Stack.Screen 
        name="AccountSettings" 
        component={AccountSettingsScreen}
        options={() => ({
          title: 'Account Settings',
          headerShown: false,
        })}
      />
      <Stack.Screen 
        name="CategorySettings" 
        component={CategorySettingsScreen}
        options={() => ({
          title: 'Category Settings',
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelContainer: {
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 12,
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default AppNavigator;