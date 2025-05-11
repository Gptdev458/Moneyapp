// src/screens/AccountsScreen/AccountsScreen.tsx
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppTheme } from '../../contexts/ThemeContext';
import { Account, AccountsStackParamList, AccountType, RootStackParamList } from '../../types';
// import { useAccountContext } from '../../contexts/AccountContext'; // When created
// import { useTransactionContext } from '../../contexts/TransactionContext'; // For calculating balances

// Import icons
import {
    SearchIcon,
    SettingsIcon
} from '../../components/icons/IconComponents';

// Navigation prop for this screen (within the AccountsStack)
type AccountsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AccountsStackParamList, 'AccountsList'>,
  StackNavigationProp<RootStackParamList>
>;

// Mock Data (Replace with context data later)
const MOCK_ACCOUNTS: Account[] = [
  // Cash accounts
  { id: 'cash', name: 'Cash', type: 'cash', initialBalance: 0, currency: 'EUR' },
  { id: 'wallet', name: 'Wallet', type: 'cash', initialBalance: 0, currency: 'EUR' },
  
  // Bank accounts
  { id: 'tekuci', name: 'Tekuci racun', type: 'bank', initialBalance: 0, currency: 'EUR' },
  { id: 'ziro', name: 'Ziro racun', type: 'bank', initialBalance: 0, currency: 'EUR' },
  
  // Savings accounts
  { id: 'savings1', name: 'Savings Account 1', type: 'savings', initialBalance: 0, currency: 'EUR' },
  
  // Other accounts
  { id: 'piggy', name: 'Piggy bank', type: 'other', initialBalance: 0, currency: 'EUR' },
  { id: 'coins', name: 'Coins', type: 'other', initialBalance: 0, currency: 'EUR' },
  
  // Debt accounts
  { id: 'creditCard', name: 'Credit Card', type: 'debt', initialBalance: 0, currency: 'EUR' },
];

// Mock balances (replace with actual calculations from transactions)
const MOCK_BALANCES: Record<string, number> = {
  cash: 141.10, 
  wallet: 141.10, 
  tekuci: 0.00, 
  ziro: 5.91, 
  savings1: 0.63, 
  piggy: 0.00, 
  coins: 0.00, 
  creditCard: -250.00
};

// Account types for grouping with colors
const ACCOUNT_TYPES = [
  { type: 'cash', label: 'Cash', color: '#4CAF50' }, // Green
  { type: 'bank', label: 'Bank', color: '#2196F3' }, // Blue
  { type: 'savings', label: 'Savings', color: '#9C27B0' }, // Purple
  { type: 'other', label: 'Other', color: '#FF9800' }, // Orange
  { type: 'debt', label: 'Debt', color: '#F44336' } // Red
];

// Account with balance
interface AccountWithBalance extends Account {
  currentBalance: number;
  color?: string;
}

// Section type for the SectionList
interface AccountSection {
  title: string;
  color: string;
  data: AccountWithBalance[];
}

const AccountsScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<AccountsScreenNavigationProp>();
  // const { accounts } = useAccountContext();
  // const { calculateAccountBalance } = useTransactionContext(); // Function to get balance

  useFocusEffect(
    useCallback(() => {
      // Fetch or refresh account list and balances
      console.log('AccountsScreen focused');
      // If using context, the list might update automatically, or you might trigger a refresh.
    }, [])
  );

  // AI Agent: `accountsWithBalances` should be derived from `accounts` context
  // and balances calculated using transactions.
  const accountsWithBalances = useMemo(() => {
    return MOCK_ACCOUNTS.map(acc => {
      const typeInfo = ACCOUNT_TYPES.find(t => t.type === acc.type);
      return {
        ...acc,
        // currentBalance: calculateAccountBalance(acc.id) || 0,
        currentBalance: MOCK_BALANCES[acc.id] || acc.initialBalance || 0, // Using mock
        color: typeInfo?.color
      };
    });
  }, []); // Add `accounts` and `calculateAccountBalance` to dependencies

  const { totalAssets, totalLiabilities, netWorth } = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    accountsWithBalances.forEach(acc => {
      if (acc.type !== 'debt') { // Assuming 'debt' type accounts are liabilities
        assets += acc.currentBalance;
      } else {
        liabilities += Math.abs(acc.currentBalance); // Liabilities are usually positive numbers representing debt
      }
    });
    return { totalAssets: assets, totalLiabilities: liabilities, netWorth: assets - liabilities };
  }, [accountsWithBalances]);

  // Prepare sections for SectionList
  const sections = useMemo(() => {
    const sectionsArray: AccountSection[] = [];
    
    ACCOUNT_TYPES.forEach(typeInfo => {
      const accountsOfType = accountsWithBalances.filter(acc => acc.type === typeInfo.type);
      if (accountsOfType.length > 0) {
        sectionsArray.push({
          title: typeInfo.label,
          color: typeInfo.color,
          data: accountsOfType
        });
      }
    });
    
    return sectionsArray;
  }, [accountsWithBalances]);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'cash':
        return 'cash';
      case 'bank':
        return 'bank';
      case 'savings':
        return 'piggy-bank';
      case 'debt':
        return 'credit-card';
      case 'other':
      default:
        return 'folder';
    }
  };

  const renderAccountItem = ({ item, section }: { item: AccountWithBalance; section: AccountSection }) => {
    const isNegative = item.currentBalance < 0;
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
        style={[
          styles.accountItem, 
          { 
            backgroundColor: theme.colors.surfaceVariant,
            borderLeftColor: section.color || theme.colors.primary,
          }
        ]}
      >
        <View style={styles.accountItemContent}>
          <View style={styles.accountItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons
                name={getAccountIcon(item.type)}
                size={24}
                color={section.color || theme.colors.primary}
              />
            </View>
            <Text style={[styles.accountName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
          </View>
          <Text
            style={[
              styles.accountBalance,
              { color: isNegative ? theme.colors.expense : theme.colors.textPrimary }
            ]}
          >
            {isNegative ? '-' : ''}{item.currency} {Math.abs(item.currentBalance).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Assets</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
            € {totalAssets.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Liabilities</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
            € {totalLiabilities.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.mainDivider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.netWorthRow}>
        <Text style={[styles.netWorthLabel, { color: theme.colors.textSecondary }]}>Net Worth</Text>
        <Text 
          style={[
            styles.netWorthValue, 
            { color: netWorth >= 0 ? theme.colors.income : theme.colors.expense }
          ]}
        >
          € {netWorth.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: AccountSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionHeaderText, { color: theme.colors.textPrimary }]}>{section.title}</Text>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No accounts found. Add one!</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Accounts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Search pressed')}>
            <SearchIcon size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Settings pressed')}>
            <SettingsIcon size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <SectionList
        sections={sections}
        renderItem={renderAccountItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
      />
      
      {/* <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('EditAccount', { accountId: '' })}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
  },
  listContent: {
    paddingBottom: 80, // Extra bottom padding for FAB
  },
  summaryContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 8,
  },
  mainDivider: {
    height: 1,
    width: '100%',
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  netWorthLabel: {
    fontSize: 16,
  },
  netWorthValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  accountItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  accountItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default AccountsScreen;