/**
 * @deprecated This component is no longer used. The app now uses the standard React Navigation
 * bottom tabs directly in the AppNavigator.tsx file.
 * 
 * This file is kept for reference purposes only and should be removed in future cleanup.
 */

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';
import { BottomTabParamList, RootStackParamList } from '../../types';
import {
    AccountsIcon,
    MoreIcon,
    PlusIcon,
    StatsIcon,
    TransactionsIcon
} from '../icons/IconComponents';

// Define a composite navigation type that can navigate to both tab screens and stack screens
type BottomBarNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  StackNavigationProp<RootStackParamList>
>;

interface BottomNavigationBarProps {
  activeTab: 'transactions' | 'stats' | 'accounts' | 'more';
}

/**
 * @deprecated This component is no longer used.
 */
const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ activeTab }) => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<BottomBarNavigationProp>();

  const handleTabPress = (tabName: string) => {
    switch (tabName) {
      case 'transactions':
        navigation.navigate('MainAppTabs', { screen: 'HomeTab' });
        break;
      case 'stats':
        navigation.navigate('MainAppTabs', { screen: 'StatsTab' });
        break;
      case 'accounts':
        navigation.navigate('MainAppTabs', { screen: 'AccountsTab' });
        break;
      case 'more':
        navigation.navigate('MainAppTabs', { screen: 'MoreTab' });
        break;
      default:
        break;
    }
  };

  const handleAddPress = () => {
    navigation.navigate('AddTransaction', { type: 'expense' });
  };

  const getTabColor = (tabName: string) => {
    return activeTab === tabName ? theme.colors.primary : theme.colors.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('transactions')}
      >
        <TransactionsIcon 
          size={24} 
          color={getTabColor('transactions')} 
        />
        <Text style={[styles.tabLabel, { color: getTabColor('transactions') }]}>Trans.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('stats')}
      >
        <StatsIcon 
          size={24} 
          color={getTabColor('stats')} 
        />
        <Text style={[styles.tabLabel, { color: getTabColor('stats') }]}>Stats</Text>
      </TouchableOpacity>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddPress}
        >
          <PlusIcon size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('accounts')}
      >
        <AccountsIcon 
          size={24} 
          color={getTabColor('accounts')} 
        />
        <Text style={[styles.tabLabel, { color: getTabColor('accounts') }]}>Accounts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress('more')}
      >
        <MoreIcon 
          size={24} 
          color={getTabColor('more')} 
        />
        <Text style={[styles.tabLabel, { color: getTabColor('more') }]}>More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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

export default BottomNavigationBar; 