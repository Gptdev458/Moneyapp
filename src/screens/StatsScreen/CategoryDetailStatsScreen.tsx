// src/screens/StatsScreen/CategoryDetailStatsScreen.tsx
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useLayoutEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppTheme } from '../../contexts/ThemeContext';
import { RootStackParamList, Transaction } from '../../types';
// import { useTransactionContext } from '../../contexts/TransactionContext';
// import { useCategoryContext } from '../../contexts/CategoryContext';

type CategoryDetailStatsScreenRouteProp = RouteProp<RootStackParamList, 'CategoryDetailStats'>;
type CategoryDetailStatsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryDetailStats'>;

// Mock Data (Replace with context data later)
const MOCK_CATEGORY_DETAIL_TRANSACTIONS: Transaction[] = [
  { id: 'd1', type: 'expense', date: '2025-04-04T10:00:00.000Z', amount: 250, accountId: 'acc1', categoryId: 'catIncome1', description: 'Paycheck for 3 month (part 1)' },
  { id: 'd2', type: 'expense', date: '2025-04-04T10:00:00.000Z', amount: 863.30, accountId: 'acc2', categoryId: 'catIncome1', description: 'Paycheck for 3 month (part 2)' },
  // Add more relevant transactions for the selected category and period
];
const MOCK_HISTORICAL_DATA = [ // For the line graph
    { month: 'Sep', amount: 1300 }, { month: 'Oct', amount: 800 },
    { month: 'Nov', amount: 1050 }, { month: 'Dec', amount: 1100 },
    { month: 'Jan', amount: 1350 }, { month: 'Feb', amount: 1550 },
    { month: 'Mar', amount: 1400 }, { month: 'Apr', amount: 1000 },
];

// Interface for grouped transactions by date
interface DayGroup {
  date: string;
  transactions: Transaction[];
  dailyTotal: number;
}

const CategoryDetailStatsScreen = () => {
  const { theme } = useAppTheme();
  const route = useRoute<CategoryDetailStatsScreenRouteProp>();
  const navigation = useNavigation<CategoryDetailStatsScreenNavigationProp>();
  // const { getTransactionsForCategoryInPeriod } = useTransactionContext();
  // const { getCategoryById } = useCategoryContext();

  const { categoryId, periodLabel, startDate, endDate, type } = route.params;

  // const category = getCategoryById(categoryId); // Fetch from context
  const category = { name: type === 'income' ? 'Paycheck' : 'Food', id: categoryId }; // Mock category name

  useLayoutEffect(() => {
    navigation.setOptions({
      title: category?.name || 'Category Details',
    });
  }, [navigation, category]);

  // const transactions = getTransactionsForCategoryInPeriod(categoryId, startDate, endDate);
  const transactions = MOCK_CATEGORY_DETAIL_TRANSACTIONS.filter(tx => tx.categoryId === categoryId && tx.type === type); // Basic filter

  const totalForPeriod = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Format historicalData for the line chart library
  const lineChartData = {
    labels: MOCK_HISTORICAL_DATA.map(d => d.month),
    datasets: [{ data: MOCK_HISTORICAL_DATA.map(d => d.amount) }],
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => 
      type === 'income' 
        ? `rgba(76, 175, 80, ${opacity})` // Green for income
        : `rgba(244, 67, 54, ${opacity})`, // Red for expenses
    labelColor: (opacity = 1) => theme.colors.textSecondary,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: type === 'income' ? theme.colors.income : theme.colors.expense
    }
  };

  // Group transactions by date for display
  const groupedTransactions = useMemo(() => {
    const grouped: Record<string, DayGroup> = {};
    
    transactions.forEach(tx => {
        const dateKey = new Date(tx.date).toLocaleDateString('en-CA'); // YYYY-MM-DD for grouping
        if(!grouped[dateKey]) {
            grouped[dateKey] = { date: dateKey, transactions: [], dailyTotal: 0 };
        }
        grouped[dateKey].transactions.push(tx);
        grouped[dateKey].dailyTotal += tx.amount;
    });
    
    return Object.values(grouped).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItemCard}>
      <View style={styles.categoryIconContainer}>
        <MaterialCommunityIcons 
          name={type === 'income' ? "cash-plus" : "silverware-fork-knife"} 
          size={24} 
          color={theme.colors.textSecondary}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionAccountText}>Account Name</Text> {/* AI Agent: Fetch account name */}
      </View>
      <Text style={[styles.transactionAmount, { color: type === 'income' ? theme.colors.income : theme.colors.expense }]}>
        €{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  // Render day group with its transactions
  const renderDayGroup = ({ item }: { item: DayGroup }) => {
    const groupDate = new Date(item.date);
    return (
      <View style={styles.dayGroupContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayDateText}>
            {String(groupDate.getDate()).padStart(2, '0')} {groupDate.toLocaleString('default', { weekday: 'short' })} {groupDate.toLocaleDateString('de-DE', { month: '2-digit', year: '2-digit' })}
          </Text>
          <Text style={[styles.dayTotalAmount, { color: type === 'income' ? theme.colors.income : theme.colors.expense }]}>
            €{item.dailyTotal.toFixed(2)}
          </Text>
        </View>
        <FlatList
          data={item.transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(tx) => tx.id}
          scrollEnabled={false} // Important: disable scrolling since it's inside another FlatList
        />
      </View>
    );
  };

  // Main render: top level components and data
  const renderListHeader = () => (
    <>
      <View style={styles.totalBalanceContainer}>
        <Text style={styles.totalBalanceLabel}>Total {category?.name} ({periodLabel})</Text>
        <Text style={[styles.totalBalanceAmount, { color: type === 'income' ? theme.colors.income : theme.colors.expense }]}>
          €{totalForPeriod.toFixed(2)}
        </Text>
      </View>

      <View style={styles.subSummaryRow}>
        <Text style={styles.subSummaryText}>All</Text>
        <Text style={styles.subSummaryText}>100%</Text>
        <Text style={[styles.subSummaryAmount, { color: type === 'income' ? theme.colors.income : theme.colors.expense }]}>
          €{totalForPeriod.toFixed(2)}
        </Text>
      </View>

      <View style={styles.lineChartContainer}>
        <LineChart
          data={lineChartData}
          width={350} // ScreenWidth - padding
          height={220}
          yAxisLabel="€"
          chartConfig={chartConfig}
          bezier // Makes the line smooth
          style={styles.lineChart}
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderListHeader}
        data={groupedTransactions}
        renderItem={renderDayGroup}
        keyExtractor={(item) => item.date}
        ListEmptyComponent={<Text style={styles.placeholderText}>No transactions for this category in this period.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  totalBalanceContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  totalBalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  subSummaryText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  subSummaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lineChartContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 12,
  },
  lineChart: {
    borderRadius: 12,
  },
  dayGroupContainer: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayDateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dayTotalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  categoryIconContainer: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  transactionAccountText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    padding: 32,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default CategoryDetailStatsScreen;