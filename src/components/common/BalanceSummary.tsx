import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';

interface BalanceSummaryProps {
  income: number;
  expenses: number;
  total?: number;
  currency?: string;
  showTotal?: boolean;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  income,
  expenses,
  total = income - expenses,
  currency = '€',
  showTotal = true,
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.balanceItem}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Income</Text>
        <Text style={[styles.amount, { color: theme.colors.income }]}>
          {currency} {income.toFixed(2)}
        </Text>
      </View>

      <View style={styles.balanceItem}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Expenses</Text>
        <Text style={[styles.amount, { color: theme.colors.expense }]}>
          {currency} {expenses.toFixed(2)}
        </Text>
      </View>

      {showTotal && (
        <View style={styles.balanceItem}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Total</Text>
          <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
            {currency} {total.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  balanceItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BalanceSummary; 