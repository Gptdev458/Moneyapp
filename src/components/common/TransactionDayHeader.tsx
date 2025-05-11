import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';

interface TransactionDayHeaderProps {
  date: Date;
  totalIncome: number;
  totalExpense: number;
  currency?: string;
}

const TransactionDayHeader: React.FC<TransactionDayHeaderProps> = ({
  date,
  totalIncome,
  totalExpense,
  currency = '€',
}) => {
  const { theme } = useAppTheme();
  
  // Format day number, day name, and month/year
  const dayNumber = date.getDate().toString().padStart(2, '0');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthYear = `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(2)}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.dateContainer}>
        <Text style={[styles.dayNumber, { color: theme.colors.textPrimary }]}>
          {dayNumber}
        </Text>
        <View style={styles.dayMonthContainer}>
          <View style={[styles.dayBadge, { backgroundColor: theme.colors.border }]}>
            <Text style={[styles.dayName, { color: theme.colors.textPrimary }]}>
              {dayName}
            </Text>
          </View>
          <Text style={[styles.monthYear, { color: theme.colors.textSecondary }]}>
            {monthYear}
          </Text>
        </View>
      </View>
      
      <View style={styles.amountsContainer}>
        <Text style={[styles.incomeAmount, { color: theme.colors.income }]}>
          {currency} {totalIncome.toFixed(2)}
        </Text>
        <Text style={[styles.expenseAmount, { color: theme.colors.expense }]}>
          {currency} {totalExpense.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 8,
  },
  dayMonthContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
  },
  monthYear: {
    fontSize: 14,
  },
  amountsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeAmount: {
    fontSize: 14,
    marginRight: 16,
  },
  expenseAmount: {
    fontSize: 14,
  },
});

export default TransactionDayHeader; 