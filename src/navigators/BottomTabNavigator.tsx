// src/navigators/BottomTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screen components
import BudgetScreen from '../screens/BudgetScreen/BudgetScreen';
import MoreScreen from '../screens/MoreScreen/MoreScreen';
import TransactionsScreen from '../screens/TransactionsScreen/TransactionsScreen';
import AccountsStackNavigator from './AccountsStackNavigator';
import StatsStackNavigator from './StatsStackNavigator';

import { useAppTheme } from '../contexts/ThemeContext';
import { BottomTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type AddButtonProps = {
  onPress: () => void;
};

const AddButton = ({ onPress }: AddButtonProps) => {
  const { theme } = useAppTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.addButton,
        { backgroundColor: theme.colors.expense }
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name="plus" color="#FFFFFF" size={32} />
    </TouchableOpacity>
  );
};

const BottomTabNavigator = () => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.textPrimary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceVariant,
          borderTopColor: theme.colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingHorizontal: 10,
        },
      }}
    >
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Trans.</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-vertical" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsStackNavigator}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Stats</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BudgetTab"
        component={BudgetScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <View style={styles.addButtonContainer}>
              <AddButton
                onPress={() => navigation.navigate('AddTransaction', {})}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AccountsTab"
        component={AccountsStackNavigator}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Accounts</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>More</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    height: 60,
  },
  addButton: {
    position: 'absolute',
    bottom: 5, // This positions it higher up, overlapping with the tab bar
    height: 64,
    width: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
});

export default BottomTabNavigator;