// TransactionsScreen.tsx - Shows all transactions
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAccountContext } from '../../contexts/AccountContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { BottomTabParamList, RootStackParamList } from '../../types';

import {
  SearchIcon,
  SettingsIcon
} from '../../components/icons/IconComponents';

// Define combined navigation prop type for this screen
type TransactionsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'TransactionsTab'>,
  StackNavigationProp<RootStackParamList>
>;

const TransactionsScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const { transactions } = useTransactionContext();
  const { categories } = useCategoryContext();
  const { accounts } = useAccountContext();
  
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('month');
  
  // Handle period changes
  const handlePeriodChange = (newPeriod: 'all' | 'month' | 'year') => {
    setPeriod(newPeriod);
  };
  
  // Get transactions grouped by date based on selected period
  const groupedTransactions = useMemo(() => {
    // Filter transactions based on selected period
    const filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const now = new Date();
      
      if (period === 'all') {
        return true; // Show all transactions
      } else if (period === 'month') {
        return txDate.getMonth() === now.getMonth() && 
               txDate.getFullYear() === now.getFullYear();
      } else if (period === 'year') {
        return txDate.getFullYear() === now.getFullYear();
      }
      
      return true;
    });

    // Sort transactions by date (newest first)
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Group by date
    const grouped: Record<string, {
      date: Date;
      dayNumber: number;
      dayName: string;
      month: string;
      year: string;
      transactions: typeof sortedTransactions;
      totalIncome: number;
      totalExpense: number;
    }> = {};
    
    sortedTransactions.forEach(tx => {
      const date = new Date(tx.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date,
          dayNumber: date.getDate(),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          month: (date.getMonth() + 1).toString().padStart(2, '0'),
          year: date.getFullYear().toString().substring(2),
          transactions: [],
          totalIncome: 0,
          totalExpense: 0
        };
      }
      
      grouped[dateKey].transactions.push(tx);
      
      if (tx.type === 'income') {
        grouped[dateKey].totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        grouped[dateKey].totalExpense += tx.amount;
      }
    });
    
    return Object.values(grouped).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [transactions, period]);
  
  // Calculate financial summary
  const financialSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    // Calculate total income and expenses for the filtered transactions
    groupedTransactions.forEach(group => {
      income += group.totalIncome;
      expenses += group.totalExpense;
    });
    
    return {
      income,
      expenses,
      total: income - expenses
    };
  }, [groupedTransactions]);
  
  const handleTransactionPress = useCallback((transactionId: string) => {
    navigation.navigate('AddTransaction', { transactionId });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <SearchIcon size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <SettingsIcon size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Period selector */}
      <View style={[styles.periodSelector, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.periodOption,
            period === 'month' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text style={[
            styles.periodText,
            { color: period === 'month' ? theme.colors.onPrimary : theme.colors.textSecondary }
          ]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodOption,
            period === 'year' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => handlePeriodChange('year')}
        >
          <Text style={[
            styles.periodText,
            { color: period === 'year' ? theme.colors.onPrimary : theme.colors.textSecondary }
          ]}>
            Year
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodOption,
            period === 'all' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => handlePeriodChange('all')}
        >
          <Text style={[
            styles.periodText,
            { color: period === 'all' ? theme.colors.onPrimary : theme.colors.textSecondary }
          ]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Balance Summary */}
      <View style={[styles.balanceSummaryContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.balanceItemContainer}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>Income</Text>
          <Text style={[styles.balanceAmount, { color: theme.colors.income }]}>
            € {financialSummary.income.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.balanceItemContainer}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>Expenses</Text>
          <Text style={[styles.balanceAmount, { color: theme.colors.expense }]}>
            € {financialSummary.expenses.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.balanceItemContainer}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          <Text style={[styles.balanceAmount, { color: theme.colors.textPrimary }]}>
            € {financialSummary.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.scrollContent}>
        <View style={styles.transactionsContainer}>
          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="inbox-outline" size={24} color={theme.colors.textSecondary} />
              </View>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No transactions found for this period.
              </Text>
            </View>
          ) : (
            groupedTransactions.map((group, index) => (
              <View key={index} style={styles.dayGroup}>
                {/* Day Header */}
                <View style={[styles.dayHeader, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={styles.dayHeaderDateContainer}>
                    <Text style={[styles.dayHeaderNumber, { color: theme.colors.textPrimary }]}>
                      {group.dayNumber.toString().padStart(2, '0')}
                    </Text>
                    <View style={styles.dayHeaderInfo}>
                      <View style={[styles.dayHeaderBadge, { backgroundColor: theme.colors.border }]}>
                        <Text style={[styles.dayHeaderBadgeText, { color: theme.colors.textPrimary }]}>
                          {group.dayName}
                        </Text>
                      </View>
                      <Text style={[styles.dayHeaderMonthYear, { color: theme.colors.textSecondary }]}>
                        {group.month}.{group.year}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dayHeaderAmounts}>
                    <Text style={[styles.dayHeaderIncome, { color: theme.colors.income }]}>
                      € {group.totalIncome.toFixed(2)}
                    </Text>
                    <Text style={[styles.dayHeaderExpense, { color: theme.colors.expense }]}>
                      € {group.totalExpense.toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                {/* Day Transactions */}
                {group.transactions.map(transaction => {
                  const category = categories.find(c => c.id === transaction.categoryId)?.name || 'Uncategorized';
                  const subcategory = transaction.note || undefined;
                  const account = accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown';
                  
                  const transactionIndex = group.transactions.indexOf(transaction);
                  const mockBalance = 150 - (transactionIndex * 5);
                  
                  return (
                    <View key={transaction.id} style={[styles.transactionItem, { borderBottomColor: theme.colors.border }]}>
                      <View style={styles.transactionLeftSection}>
                        <View style={styles.transactionCategorySection}>
                          <Text style={[styles.transactionCategoryText, { color: theme.colors.textSecondary }]}>
                            {category.toLowerCase()}
                          </Text>
                          {subcategory && (
                            <Text style={[styles.transactionSubcategoryText, { color: theme.colors.textSecondary }]}>
                              {subcategory.toLowerCase()}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity 
                          style={styles.transactionMainInfo}
                          onPress={() => handleTransactionPress(transaction.id)}
                        >
                          <Text style={[styles.transactionDescription, { color: theme.colors.textPrimary }]}>
                            {transaction.description}
                          </Text>
                          <Text style={[styles.transactionAccount, { color: theme.colors.textSecondary }]}>
                            {account}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.transactionRightSection}>
                        <Text style={[
                          styles.transactionAmount, 
                          { 
                            color: transaction.type === 'income' 
                              ? theme.colors.income 
                              : theme.colors.expense 
                          }
                        ]}>
                          {transaction.type === 'expense' ? '-' : ''}€ {transaction.amount.toFixed(2)}
                        </Text>
                        <Text style={[styles.transactionBalance, { color: theme.colors.textSecondary }]}>
                          (Balance {mockBalance.toFixed(2)})
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  balanceItemContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  transactionsContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  dayGroup: {
    marginBottom: 0,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  dayHeaderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayHeaderNumber: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  dayHeaderInfo: {
    marginLeft: 8,
    flexDirection: 'column',
  },
  dayHeaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  dayHeaderBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayHeaderMonthYear: {
    fontSize: 14,
    marginLeft: 8,
  },
  dayHeaderAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayHeaderIncome: {
    fontSize: 14,
  },
  dayHeaderExpense: {
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  transactionLeftSection: {
    flexDirection: 'row',
  },
  transactionCategorySection: {
    width: 64,
  },
  transactionCategoryText: {
    fontSize: 14,
  },
  transactionSubcategoryText: {
    fontSize: 12,
  },
  transactionMainInfo: {
    marginLeft: 16,
  },
  transactionDescription: {
    fontSize: 16,
  },
  transactionAccount: {
    fontSize: 14,
  },
  transactionRightSection: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionBalance: {
    fontSize: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 12,
  }
});

export default TransactionsScreen;
