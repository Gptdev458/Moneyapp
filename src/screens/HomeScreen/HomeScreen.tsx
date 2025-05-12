import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAccountContext } from '../../contexts/AccountContext';
import { useBudgetContext } from '../../contexts/BudgetContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTransactionContext } from '../../contexts/TransactionContext';

import BudgetCard from '../../components/common/BudgetCard';
import {
  FoodIcon,
  SearchIcon,
  SettingsIcon,
  TransportIcon
} from '../../components/icons/IconComponents';

const HomeScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation() as any;
  const { transactions } = useTransactionContext();
  const { categories } = useCategoryContext();
  const { accounts } = useAccountContext();
  const { budgets, getBudgetSpent, getBudgetProgress, getCurrentPeriodBudgets } = useBudgetContext();
  
  // Add state for current selected month
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format the current month and year for display
  const formattedMonthYear = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);
  
  // Handle navigation to previous month
  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);
  
  // Handle navigation to next month
  const handleNextMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  // Calculate financial summary from transactions (now filtered by selected month)
  const financialSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    // Get selected month transactions
    const selectedMonth = currentDate.getMonth();
    const selectedYear = currentDate.getFullYear();
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === selectedMonth && 
          txDate.getFullYear() === selectedYear) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else if (tx.type === 'expense') {
          expenses += tx.amount;
        }
      }
    });
    
    return {
      income,
      expenses,
      total: income - expenses
    };
  }, [transactions, currentDate]);

  // Get transactions grouped by date (filtered by selected month)
  const groupedTransactions = useMemo(() => {
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Filter transactions by selected month
    const selectedMonth = currentDate.getMonth();
    const selectedYear = currentDate.getFullYear();
    
    const filteredTransactions = sortedTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
    });
    
    // Take only the most recent transactions
    const recentTransactions = filteredTransactions.slice(0, 10);
    
    // Group by date
    const grouped: Record<string, {
      date: Date;
      dayNumber: number;
      dayName: string;
      month: string;
      year: string;
      transactions: typeof recentTransactions;
      totalIncome: number;
      totalExpense: number;
    }> = {};
    
    recentTransactions.forEach(tx => {
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
  }, [transactions, currentDate]);

  // Get current period budgets for the home screen (filtered by selected month)
  const currentBudgets = useMemo(() => {
    // Get top 2 budgets to display (with highest spending percentage)
    const currentPeriodBudgets = getCurrentPeriodBudgets(currentDate);
    return currentPeriodBudgets
      .filter(budget => budget.periodType === 'monthly') // Only show monthly budgets
      .sort((a, b) => getBudgetProgress(b.id) - getBudgetProgress(a.id)) // Sort by progress (highest first)
      .slice(0, 2); // Take top 2
  }, [budgets, getBudgetProgress, getCurrentPeriodBudgets, currentDate]);
  
  // Transform budget data for display
  const displayBudgets = useMemo(() => {
    if (currentBudgets.length === 0) return [];
    
    return currentBudgets.map(budget => {
      const category = categories.find(cat => cat.id === budget.categoryId);
      const spent = getBudgetSpent(budget.id);
      const progress = getBudgetProgress(budget.id);
      
      // Get appropriate icon (simplified)
      let icon = <FoodIcon size={20} color="#FFFFFF" />;
      if (category?.name?.toLowerCase().includes('transport')) {
        icon = <TransportIcon size={20} color="#FFFFFF" />;
      }
      
      return {
        id: budget.id,
        name: category?.name || 'Budget',
        icon,
        spent,
        limit: budget.amount,
        color: category?.color || theme.colors.expense,
        progress
      };
    });
  }, [currentBudgets, categories, getBudgetSpent, getBudgetProgress, theme.colors.expense]);

  const handleSeeAllBudgets = useCallback(() => {
    // Navigate to budgets screen
    navigation.navigate('BudgetTab');
  }, [navigation]);

  const handleBudgetPress = useCallback((budgetId: string) => {
    // Navigate to edit budget screen when a budget is pressed
    navigation.navigate('AddBudget', { budgetId });
  }, [navigation]);

  const handleSeeAllTransactions = useCallback(() => {
    // Navigate to our dedicated transactions screen
    navigation.navigate('AllTransactions');
  }, [navigation]);

  const handleTransactionPress = useCallback((transactionId: string) => {
    navigation.navigate('AddTransaction', { transactionId });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header with month picker on left and icons on right */}
      <View style={[styles.header, { paddingHorizontal: 24 }]}>
        <View style={styles.monthPickerContainer}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthPickerArrowButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[styles.monthPickerText, { color: 'white' }]}>{formattedMonthYear}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthPickerArrowButton}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <SearchIcon size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <SettingsIcon size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Summary - Using the updated styling */}
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
        
        {/* Budget Summary */}
        <View style={[styles.section, { 
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 24,
          paddingBottom: 16
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Budgets
            </Text>
            <TouchableOpacity onPress={handleSeeAllBudgets}>
              <Text style={[styles.seeAllButton, { color: theme.colors.income }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.budgetCardsContainer}>
            {displayBudgets.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  No budgets for this month. Create a budget to track your spending.
                </Text>
              </View>
            ) : (
              displayBudgets.map(budget => (
                <BudgetCard
                  key={budget.id}
                  name={budget.name}
                  icon={budget.icon}
                  spent={budget.spent}
                  limit={budget.limit}
                  color={budget.color}
                  onPress={() => handleBudgetPress(budget.id)}
                />
              ))
            )}
          </View>
        </View>

        {/* Transactions Header */}
        <View style={[styles.section, { 
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 24 
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Transactions
            </Text>
            <TouchableOpacity onPress={handleSeeAllTransactions}>
              <Text style={[styles.seeAllButton, { color: theme.colors.income }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionsContainer}>
          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="lock" size={24} color={theme.colors.textSecondary} />
              </View>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No transactions. Add a transaction to get started.
              </Text>
            </View>
          ) : (
            groupedTransactions.map((group, index) => (
              <View key={index} style={styles.dayGroup}>
                {/* Day Header - Updated styling to match HTML design */}
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
                
                {/* Day Transactions - Updated styling to match HTML design */}
                {group.transactions.map(transaction => {
                  const category = categories.find(c => c.id === transaction.categoryId)?.name || 'Uncategorized';
                  const subcategory = transaction.note || undefined;
                  const account = accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown';
                  
                  // Simulate a balance value (this would normally come from real data)
                  // In the mockup, it decreases with each transaction, but we'll just use a placeholder
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

      {/* Bottom Navigation is handled by the navigator */}
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
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  // New Balance Summary Styles matching HTML design
  balanceSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  balanceItemContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetCardsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
  },
  transactionsContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  dayGroup: {
    marginBottom: 0, // Remove margin to match the design
  },
  // New Day Header Styles matching HTML design
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
  // New Transaction Item Styles matching HTML design
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
  },
  monthPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthPickerArrowButton: {
    padding: 4,
  },
  monthPickerText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default HomeScreen; 