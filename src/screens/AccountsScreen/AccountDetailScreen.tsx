// src/screens/AccountsScreen/AccountDetailScreen.tsx
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, SectionList, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Dialog, FAB, Portal, Surface, Text, TextInput, TouchableRipple } from 'react-native-paper';

import { useAccountContext } from '../../contexts/AccountContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { Account, AccountsStackParamList, RootStackParamList, Transaction } from '../../types';
// import { useTransactionContext } from '../../contexts/TransactionContext';

type AccountDetailScreenRouteProp = RouteProp<AccountsStackParamList, 'AccountDetail'>;
// For navigating to AddTransaction (modal) from RootStack
type AccountDetailScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<AccountsStackParamList, 'AccountDetail'>,
    StackNavigationProp<RootStackParamList>
>;

// Mock Data
const MOCK_ACCOUNT_DETAIL: Account = { id: 'wallet', name: 'Wallet', type: 'cash', initialBalance: 50, currency: 'EUR' };
const MOCK_TRANSACTIONS_FOR_ACCOUNT: Transaction[] = [
  { id: 't1', type: 'expense', date: '2025-05-07T10:00:00.000Z', amount: 20, accountId: 'wallet', categoryId: 'cat1', description: 'Groceries' },
  { id: 't2', type: 'expense', date: '2025-05-07T12:30:00.000Z', amount: 10, accountId: 'wallet', categoryId: 'cat2', description: 'Hell Energy Drink' },
  { id: 't3', type: 'expense', date: '2025-05-07T15:00:00.000Z', amount: 47, accountId: 'wallet', categoryId: 'cat3', description: 'Velo' },
  { id: 't4', type: 'income', date: '2025-05-02T09:00:00.000Z', amount: 120, accountId: 'wallet', categoryId: 'cat4', description: 'Birthday Gift' },
];

// Mock categories for display purposes
const MOCK_CATEGORIES = {
  'cat1': { id: 'cat1', name: 'Groceries', color: '#FF5252', icon: 'cart' },
  'cat2': { id: 'cat2', name: 'Drinks', color: '#FF9100', icon: 'bottle-soda' },
  'cat3': { id: 'cat3', name: 'Tobacco', color: '#FFEA00', icon: 'smoking' },
  'cat4': { id: 'cat4', name: 'Gifts', color: '#00E676', icon: 'gift' },
};

// Interface for transactions with running balance
interface TransactionWithBalance extends Transaction {
  runningBalance?: number;
  change?: number;
}

// Interface for section data
interface DaySection {
  date: string;
  dailyIncome: number;
  dailyExpense: number;
  data: TransactionWithBalance[];
}

const AccountDetailScreen = () => {
  const { theme } = useAppTheme();
  const route = useRoute<AccountDetailScreenRouteProp>();
  const navigation = useNavigation<AccountDetailScreenNavigationProp>();
  const { getAccountById, updateAccount } = useAccountContext();
  // const { getTransactionsForAccount, calculateBalanceForPeriod, addTransaction } = useTransactionContext();

  const { accountId } = route.params;
  const account = getAccountById(accountId) || MOCK_ACCOUNT_DETAIL; // Fallback to mock if not found

  const [currentPeriodDate, setCurrentPeriodDate] = useState(new Date(2025, 4, 1)); // May 2025
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [balanceInputValue, setBalanceInputValue] = useState(account.initialBalance.toString());
  const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);
  const [newInitialBalance, setNewInitialBalance] = useState(0);
  const [balanceDifference, setBalanceDifference] = useState(0);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Open edit dialog with current balance
  const handleEditPress = () => {
    setBalanceInputValue(account.initialBalance.toString());
    setEditDialogVisible(true);
  };

  // Handle save from edit dialog
  const handleSaveEdit = () => {
    // Parse and validate the new balance
    const newBalance = parseFloat(balanceInputValue);
    if (isNaN(newBalance)) {
      Alert.alert('Invalid balance', 'Please enter a valid number');
      return;
    }

    // Calculate the difference
    const difference = newBalance - account.initialBalance;
    
    // If there's no change, just close the dialog
    if (difference === 0) {
      setEditDialogVisible(false);
      return;
    }
    
    // Store values for confirmation dialog
    setNewInitialBalance(newBalance);
    setBalanceDifference(difference);
    
    // Close edit dialog and show confirmation
    setEditDialogVisible(false);
    setConfirmationDialogVisible(true);
  };

  // Handle tracking balance adjustment as transaction
  const handleBalanceAdjustment = async (shouldTrackInStats: boolean) => {
    try {
      // Update the account with new balance
      await updateAccount({
        ...account,
        initialBalance: newInitialBalance
      });
      
      // If we have transaction context, create a transaction for the difference
      // This would be uncommented when TransactionContext is implemented
      /*
      const transactionType = balanceDifference > 0 ? 'income' : 'expense';
      await addTransaction({
        type: transactionType,
        date: new Date().toISOString(),
        amount: Math.abs(balanceDifference),
        accountId: account.id,
        categoryId: shouldTrackInStats ? undefined : 'balance_adjustment', // Special category for untracked adjustments
        description: shouldTrackInStats ? 'Balance adjustment' : 'Balance difference',
        // Add any additional properties your transaction needs
        excludeFromStats: !shouldTrackInStats
      });
      */
      
      // Show confirmation with proper currency symbol
      Alert.alert(
        'Balance Updated',
        `Account balance has been updated to €${newInitialBalance.toFixed(2)}`
      );
      
    } catch (error) {
      console.error('Error updating account balance:', error);
      Alert.alert('Error', 'Failed to update account balance');
    } finally {
      setConfirmationDialogVisible(false);
    }
  };

  // Navigate between periods
  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentPeriodDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  // Format month year for display
  const periodLabel = useMemo(() => {
    return `${currentPeriodDate.toLocaleString('default', { month: 'short' })} ${currentPeriodDate.getFullYear()}`;
  }, [currentPeriodDate]);

  // Format statement period display
  const statementPeriodDisplay = useMemo(() => {
    const year = currentPeriodDate.getFullYear().toString().slice(-2);
    const month = currentPeriodDate.getMonth() + 1;
    const firstDay = 1;
    const lastDay = new Date(currentPeriodDate.getFullYear(), currentPeriodDate.getMonth() + 1, 0).getDate();
    return `${month}.${firstDay}.${year} ~ ${month}.${lastDay}.${year}`;
  }, [currentPeriodDate]);

  // Fetch transactions for this account and period
  const transactions = useMemo(() => {
    return MOCK_TRANSACTIONS_FOR_ACCOUNT
      .filter(tx => tx.accountId === accountId &&
        new Date(tx.date).getMonth() === currentPeriodDate.getMonth() &&
        new Date(tx.date).getFullYear() === currentPeriodDate.getFullYear()
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [accountId, currentPeriodDate]);

  // Calculate financial summary for period
  const { deposits, withdrawals, netChange, endBalance, transactionsWithRunningBalance } = useMemo(() => {
    let dep = 0, wd = 0;
    // Start with initial balance for running calculation
    let currentBalance = account.initialBalance; 
    
    // Filter for transactions *before* the start of the current month to get opening balance
    const openingBalanceTransactions = MOCK_TRANSACTIONS_FOR_ACCOUNT.filter(tx => 
      tx.accountId === accountId && 
      new Date(tx.date) < new Date(currentPeriodDate.getFullYear(), currentPeriodDate.getMonth(), 1)
    );
    
    // Apply prior transactions to get start balance
    openingBalanceTransactions.forEach(tx => {
      currentBalance += (tx.type === 'income' ? tx.amount : -tx.amount);
    });
    
    // Calculate running balance
    const txsWithRunningBalance = [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Process oldest first for running balance
      .map(tx => { 
        if(tx.type === 'income') dep += tx.amount;
        if(tx.type === 'expense') wd += tx.amount;
        
        const change = tx.type === 'income' ? tx.amount : -tx.amount;
        currentBalance += change;
        
        return { 
          ...tx, 
          runningBalance: currentBalance,
          change
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Reverse back to newest first for display

    return {
      deposits: dep,
      withdrawals: wd,
      netChange: dep - wd,
      endBalance: currentBalance, // Final running balance for period
      transactionsWithRunningBalance: txsWithRunningBalance
    };
  }, [transactions, account.initialBalance, currentPeriodDate, accountId]);

  // Group transactions by date
  const sectionListData: DaySection[] = useMemo(() => {
    const grouped: { [key: string]: DaySection } = {};
    
    transactionsWithRunningBalance.forEach(tx => {
      const dateKey = new Date(tx.date).toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!grouped[dateKey]) {
        grouped[dateKey] = { 
          date: dateKey, 
          data: [], 
          dailyIncome: 0, 
          dailyExpense: 0 
        };
      }
      grouped[dateKey].data.push(tx);
      if (tx.type === 'income') grouped[dateKey].dailyIncome += tx.amount;
      if (tx.type === 'expense') grouped[dateKey].dailyExpense += tx.amount;
    });
    
    return Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactionsWithRunningBalance]);

  // Render a transaction item
  const renderTransactionItem = ({ item }: { item: TransactionWithBalance }) => {
    const category = MOCK_CATEGORIES[item.categoryId as keyof typeof MOCK_CATEGORIES];
    const categoryIcon = category?.icon || 'help-circle-outline';
    const categoryColor = category?.color || '#999';
    const isIncome = item.type === 'income';
    
    return (
      <TouchableRipple
        onPress={() => navigation.navigate('AddTransaction', { 
          transactionId: item.id, 
          accountId: account.id 
        })}
        style={styles.transactionItem}
      >
        <View style={styles.transactionItemContent}>
          <View style={styles.transactionItemLeft}>
            <Avatar.Icon 
              size={36} 
              icon={categoryIcon}
              style={[styles.categoryIcon, { backgroundColor: categoryColor }]}
              color="#FFFFFF"
            />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionCategory}>
                {category?.name || 'Unknown Category'}
              </Text>
            </View>
          </View>
          <View style={styles.transactionItemRight}>
            <Text 
              style={[
                styles.transactionAmount,
                { color: isIncome ? theme.colors.income : theme.colors.expense }
              ]}
            >
              {isIncome ? '+' : '-'}€{Math.abs(item.amount).toFixed(2)}
            </Text>
            {item.runningBalance !== undefined && (
              <Text style={styles.balanceText}>
                €{item.runningBalance.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableRipple>
    );
  };

  // Render a section header (day group)
  const renderSectionHeader = ({ section }: { section: DaySection }) => {
    const groupDate = new Date(section.date);
    const dayNum = groupDate.getDate();
    const dayName = groupDate.toLocaleString('default', { weekday: 'short' });
    const monthYear = groupDate.toLocaleString('default', { 
      month: 'short',
      year: '2-digit'
    });
    
    return (
      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Text style={styles.dayNumber}>{dayNum}</Text>
          <View style={styles.dayNameBadge}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
          <Text style={styles.monthYearText}>{monthYear}</Text>
        </View>
        <View style={styles.daySummary}>
          {section.dailyIncome > 0 && (
            <Text style={[styles.daySummaryText, { color: theme.colors.income }]}>
              +€{section.dailyIncome.toFixed(2)}
            </Text>
          )}
          {section.dailyExpense > 0 && (
            <Text style={[styles.daySummaryText, { color: theme.colors.expense }]}>
              -€{section.dailyExpense.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={account.name} titleStyle={styles.appbarTitle} />
        <View style={styles.periodNavigation}>
          <Appbar.Action icon="chevron-left" onPress={() => navigatePeriod('prev')} />
          <Text style={styles.periodLabel}>{periodLabel}</Text>
          <Appbar.Action icon="chevron-right" onPress={() => navigatePeriod('next')} />
        </View>
        <Appbar.Action icon="chart-bar" onPress={() => console.log('Show account stats')} />
        <Appbar.Action icon="pencil" onPress={handleEditPress} />
      </Appbar.Header>

      {/* Statement Period */}
      <Surface style={styles.statementPeriodContainer}>
        <Text style={styles.statementPeriodText}>{statementPeriodDisplay}</Text>
      </Surface>

      {/* Account Summary */}
      <Surface style={styles.accountSummaryContainer}>
        <View style={styles.accountSummaryItem}>
          <Text style={styles.accountSummaryLabel}>Deposit</Text>
          <Text style={[styles.accountSummaryValue, { color: theme.colors.income }]}>
            €{deposits.toFixed(2)}
          </Text>
        </View>
        <View style={styles.accountSummaryDivider} />
        <View style={styles.accountSummaryItem}>
          <Text style={styles.accountSummaryLabel}>Withdrawal</Text>
          <Text style={[styles.accountSummaryValue, { color: theme.colors.expense }]}>
            €{withdrawals.toFixed(2)}
          </Text>
        </View>
        <View style={styles.accountSummaryDivider} />
        <View style={styles.accountSummaryItem}>
          <Text style={styles.accountSummaryLabel}>Total</Text>
          <Text style={[styles.accountSummaryValue, { 
            color: netChange >= 0 ? theme.colors.income : theme.colors.expense 
          }]}>
            €{netChange.toFixed(2)}
          </Text>
        </View>
        <View style={styles.accountSummaryDivider} />
        <View style={styles.accountSummaryItem}>
          <Text style={styles.accountSummaryLabel}>Balance</Text>
          <Text style={[styles.accountSummaryValue, { 
            color: endBalance >= 0 ? theme.colors.textPrimary : theme.colors.expense 
          }]}>
            €{endBalance.toFixed(2)}
          </Text>
        </View>
      </Surface>

      {/* Transactions List */}
      {sectionListData.length > 0 ? (
        <SectionList
          sections={sectionListData}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.transactionsListContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions for this period.</Text>
        </View>
      )}

      {/* Add Transaction FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction', { 
          accountId: account.id, 
          type: 'expense' 
        })}
        color={theme.colors.onPrimary}
      />

      {/* Edit Account Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Account Balance</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Initial Balance"
              value={balanceInputValue}
              onChangeText={setBalanceInputValue}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <Text style={styles.dialogHelperText}>
              Changing the initial balance will adjust your account's current balance.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={confirmationDialogVisible} onDismiss={() => setConfirmationDialogVisible(false)}>
          <Dialog.Title>Track Balance Change?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              You are changing the balance by €{Math.abs(balanceDifference).toFixed(2)} 
              ({balanceDifference > 0 ? 'increase' : 'decrease'}).
            </Text>
            <Text style={styles.dialogText}>
              Do you want to track this as a transaction in statistics?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => handleBalanceAdjustment(false)}
              style={styles.dialogButton}
            >
              No
            </Button>
            <Button 
              onPress={() => handleBalanceAdjustment(true)}
              mode="contained"
              style={styles.dialogButton}
            >
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    elevation: 0,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statementPeriodContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statementPeriodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  accountSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  accountSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  accountSummaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  accountSummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountSummaryDivider: {
    height: '70%',
    width: 1,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionsListContent: {
    paddingHorizontal: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  dayNameBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  monthYearText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  daySummary: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  daySummaryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  transactionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  transactionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  transactionItemRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  listFooter: {
    height: 80, // Space for FAB
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#EF4444', // theme.colors.primary
  },
  input: {
    marginBottom: 12,
  },
  dialogText: {
    marginBottom: 8,
  },
  dialogHelperText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  dialogButton: {
    marginHorizontal: 4,
  },
});

export default AccountDetailScreen;