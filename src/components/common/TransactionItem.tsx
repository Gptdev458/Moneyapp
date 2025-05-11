import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';

interface TransactionItemProps {
  description: string;
  category: string;
  subcategory?: string;
  account: string;
  amount: number;
  balance?: number;
  type: 'expense' | 'income' | 'transfer';
  currency?: string;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  description,
  category,
  subcategory,
  account,
  amount,
  balance,
  type,
  currency = '€',
  onPress,
}) => {
  const { theme } = useAppTheme();

  const amountColor = 
    type === 'income' ? theme.colors.income : 
    type === 'expense' ? theme.colors.expense : 
    '#2196F3'; // Fixed blue color for transfers

  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: theme.colors.border }]} 
      onPress={onPress}
    >
      <View style={styles.leftContainer}>
        <View style={styles.categoryContainer}>
          <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
            {category}
          </Text>
          {subcategory && (
            <Text style={[styles.subcategoryText, { color: theme.colors.textSecondary }]}>
              {subcategory}
            </Text>
          )}
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, { color: theme.colors.textPrimary }]}>
            {description}
          </Text>
          <Text style={[styles.accountText, { color: theme.colors.textSecondary }]}>
            {account}
          </Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {type === 'expense' ? '-' : ''}{currency} {amount.toFixed(2)}
        </Text>
        {balance !== undefined && (
          <Text style={[styles.balanceText, { color: theme.colors.textSecondary }]}>
            ({currency} {balance.toFixed(2)})
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
  },
  categoryContainer: {
    width: 64,
  },
  categoryText: {
    fontSize: 14,
  },
  subcategoryText: {
    fontSize: 12,
  },
  descriptionContainer: {
    marginLeft: 16,
  },
  descriptionText: {
    fontSize: 16,
  },
  accountText: {
    fontSize: 14,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceText: {
    fontSize: 12,
  },
});

export default TransactionItem; 