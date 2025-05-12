// src/screens/AccountsScreen/AccountsScreen.tsx
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAccountContext } from '../../contexts/AccountContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { Account, AccountsStackParamList, AccountType, RootStackParamList } from '../../types';
// import { useTransactionContext } from '../../contexts/TransactionContext'; // For calculating balances

// Navigation prop for this screen (within the AccountsStack)
type AccountsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AccountsStackParamList, 'AccountsList'>,
  StackNavigationProp<RootStackParamList>
>;

// Account types for grouping with colors
const ACCOUNT_TYPES = [
  { type: 'cash', label: 'Cash', color: '#4CAF50' }, // Green
  { type: 'bank', label: 'Bank', color: '#2196F3' }, // Blue
  { type: 'savings', label: 'Savings', color: '#9C27B0' }, // Purple
  { type: 'debt', label: 'Debt', color: '#F44336' }, // Red
  { type: 'investment', label: 'Investment', color: '#FF9800' }, // Orange
  { type: 'other', label: 'Other', color: '#607D8B' } // Gray
];

// Account with balance
interface AccountWithBalance extends Account {
  currentBalance: number;
  color?: string;
}

// Section for SectionList
interface AccountSection {
  title: string;
  color?: string;
  data: AccountWithBalance[];
  isCollapsed: boolean;
  totalBalance: number;
}

const AccountsScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<AccountsScreenNavigationProp>();
  const { accounts } = useAccountContext();
  // const { calculateAccountBalance } = useTransactionContext(); // Function to get balance

  // Track which sections are collapsed
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  useFocusEffect(
    useCallback(() => {
      // Fetch or refresh account list and balances
      console.log('AccountsScreen focused');
      // If using context, the list might update automatically, or you might trigger a refresh.
    }, [])
  );

  // Get accounts with balances from context data
  const accountsWithBalances = useMemo(() => {
    return accounts
      .filter(acc => !acc.isArchived)
      .map(acc => {
        const typeInfo = ACCOUNT_TYPES.find(t => t.type === acc.type);
        return {
          ...acc,
          // When transactions context is implemented:
          // currentBalance: calculateAccountBalance(acc.id) || 0,
          currentBalance: acc.initialBalance || 0, // Using initial balance until transactions are implemented
          color: typeInfo?.color
        };
      });
  }, [accounts]); // Add calculateAccountBalance to dependencies when available

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
        // Calculate total balance for this category
        const totalBalance = accountsOfType.reduce((sum, acc) => sum + acc.currentBalance, 0);
        
        sectionsArray.push({
          title: typeInfo.label,
          color: typeInfo.color,
          data: collapsedSections[typeInfo.label] ? [] : accountsOfType,
          isCollapsed: collapsedSections[typeInfo.label] || false,
          totalBalance
        });
      }
    });
    
    return sectionsArray;
  }, [accountsWithBalances, collapsedSections]);

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
              { color: isNegative ? theme.colors.expense : '#2196F3' } // Blue color for positive balances
            ]}
          >
            {isNegative ? '-' : ''}{item.currency} {Math.abs(item.currentBalance).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: AccountSection }) => {
    const isNegative = section.totalBalance < 0;
    
    return (
      <TouchableOpacity 
        onPress={() => toggleSection(section.title)}
        style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.sectionHeaderContent}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.textPrimary }]}>
            {section.title}
          </Text>
          <Text
            style={[
              styles.sectionTotalBalance,
              { color: isNegative ? theme.colors.expense : '#2196F3' }
            ]}
          >
            {isNegative ? '-' : ''}€ {Math.abs(section.totalBalance).toFixed(2)}
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
          <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
            € {totalAssets.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Liabilities</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.expense }]}>
            € {totalLiabilities.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Net Worth</Text>
          <Text 
            style={[
              styles.summaryValue, 
              { color: netWorth >= 0 ? '#2196F3' : theme.colors.expense }
            ]}
          >
            € {netWorth.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No accounts found. Add one!</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Empty header for spacing only */}
      <View style={styles.emptyHeader} />
      
      <SectionList
        sections={sections}
        renderItem={renderAccountItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
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
  emptyHeader: {
    height: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContent: {
    paddingBottom: 80, // Extra bottom padding for FAB
  },
  summaryContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
    height: '80%',
    alignSelf: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTotalBalance: {
    fontSize: 16,
    fontWeight: 'bold',
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