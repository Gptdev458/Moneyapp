// src/screens/StatsScreen/StatsScreen.tsx
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    LineChart,
    PieChart
} from 'react-native-chart-kit';
import {
    Appbar,
    IconButton,
    Surface,
    Text,
    TouchableRipple
} from 'react-native-paper';
import { useAppTheme } from '../../contexts/ThemeContext';

import { BottomTabParamList, RootStackParamList } from '../../types';

// Navigation prop type
type StatsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'StatsTab'>,
  StackNavigationProp<RootStackParamList>
>;

// Mock data
const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Drinks', amount: 175.4, color: '#FF5252' },
  { id: 'entertainment', name: 'Entertainment', amount: 120.9, color: '#FF9100' },
  { id: 'shopping', name: 'Shopping', amount: 85.2, color: '#FFEA00' },
  { id: 'transportation', name: 'Transportation', amount: 63.8, color: '#00E676' },
  { id: 'utilities', name: 'Utilities', amount: 45.5, color: '#00B0FF' },
  { id: 'other', name: 'Other', amount: 34.2, color: '#651FFF' }
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', amount: 2400, color: '#00C853' },
  { id: 'freelance', name: 'Freelance', amount: 350, color: '#00B0FF' },
  { id: 'gifts', name: 'Gifts', amount: 100, color: '#AA00FF' }
];

// Mock transactions data for category detail view
const MOCK_TRANSACTIONS = {
  'food': [
    { id: 't1', date: '2023-05-07', description: 'Grocery shopping', account: 'Cash', amount: 45.8 },
    { id: 't2', date: '2023-05-10', description: 'Restaurant', account: 'Credit Card', amount: 32.5 },
    { id: 't3', date: '2023-05-15', description: 'Coffee shop', account: 'Cash', amount: 8.2 },
    { id: 't4', date: '2023-05-20', description: 'Bakery', account: 'Cash', amount: 12.4 },
    { id: 't5', date: '2023-05-25', description: 'Supermarket', account: 'Credit Card', amount: 76.5 },
  ]
};

// Monthly trend data for the last 6 months
const MONTHLY_TREND = {
  expenses: [420, 480, 510, 525, 495, 525],
  income: [2500, 2500, 2750, 2800, 2850, 2850]
};

// Time periods
type TimePeriod = 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';
type StatsType = 'Income' | 'Expenses';

const StatsScreen = () => {
  const { theme } = useAppTheme();
  const [activeStatsType, setActiveStatsType] = useState<StatsType>('Expenses');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;

  // Refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('StatsScreen focused');
      // Refresh data logic would go here
    }, [])
  );

  // Navigate between periods
  const navigatePeriod = (direction: 'prev' | 'next') => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      // Adjust date based on time period
      if (timePeriod === 'Monthly') {
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      } else if (timePeriod === 'Weekly') {
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      } else if (timePeriod === 'Yearly') {
        newDate.setFullYear(newDate.getFullYear() + (direction === 'prev' ? -1 : 1));
      }
      return newDate;
    });
  };

  // Format period label based on selected time period
  const getPeriodLabel = () => {
    if (timePeriod === 'Monthly') {
      return `${selectedDate.toLocaleString('default', { month: 'short' })} ${selectedDate.getFullYear()}`;
    } else if (timePeriod === 'Weekly') {
      // Calculate week start and end dates
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else if (timePeriod === 'Yearly') {
      return `${selectedDate.getFullYear()}`;
    }
    return 'Custom Period';
  };

  // Transform data for pie chart
  const pieChartData = useMemo(() => {
    const categories = activeStatsType === 'Expenses' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return categories.map(category => ({
      name: category.name,
      amount: category.amount,
      color: category.color,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12
    }));
  }, [activeStatsType, theme.colors.onSurface]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    const categories = activeStatsType === 'Expenses' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return categories.reduce((sum, category) => sum + category.amount, 0);
  }, [activeStatsType]);

  // Generate line chart data
  const lineChartData = useMemo(() => {
    const data = activeStatsType === 'Expenses' ? MONTHLY_TREND.expenses : MONTHLY_TREND.income;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      labels: months,
      datasets: [
        {
          data,
          color: () => activeStatsType === 'Expenses' ? theme.colors.expense : theme.colors.income,
          strokeWidth: 2
        }
      ],
      legend: [activeStatsType]
    };
  }, [activeStatsType, theme.colors.expense, theme.colors.income]);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => 
      activeStatsType === 'Expenses' 
        ? `rgba(244, 67, 54, ${opacity})` // Red for expenses
        : `rgba(76, 175, 80, ${opacity})`, // Green for income
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: activeStatsType === 'Expenses' ? theme.colors.expense : theme.colors.income
    }
  };

  // Get transactions for selected category
  const getCategoryTransactions = (categoryId: string) => {
    return MOCK_TRANSACTIONS[categoryId as keyof typeof MOCK_TRANSACTIONS] || [];
  };

  // Back to main stats view
  const handleBackToMainStats = () => {
    setSelectedCategory(null);
  };

  // Render category list item
  const renderCategoryItem = ({ item, index }: { item: typeof EXPENSE_CATEGORIES[0], index: number }) => {
    const percentage = Math.round((item.amount / totalAmount) * 100);
    
    return (
      <TouchableRipple
        onPress={() => setSelectedCategory(item.id)}
        style={styles.categoryItem}
      >
        <View style={styles.categoryItemContent}>
          <View style={styles.categoryColorAndInfo}>
            <View 
              style={[
                styles.categoryColorBox, 
                { backgroundColor: item.color }
              ]} 
            />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryPercentage}>{percentage}%</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
          </View>
          <Text style={styles.categoryAmount}>
            €{item.amount.toFixed(2)}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  // Render transaction list item
  const renderTransactionItem = ({ item }: { item: any }) => {
    const transactionDate = new Date(item.date);
    const formattedDate = `${transactionDate.getDate()} ${transactionDate.toLocaleString('default', { weekday: 'short' })} ${transactionDate.toLocaleString('default', { month: 'short' })}.${transactionDate.getFullYear().toString().slice(2)}`;
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionAccount}>{item.account}</Text>
        </View>
        <Text 
          style={[
            styles.transactionAmount,
            { color: activeStatsType === 'Expenses' ? theme.colors.expense : theme.colors.income }
          ]}
        >
          €{item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  // Render Main Stats View Content
  const renderMainStatsContent = () => {
    const categories = activeStatsType === 'Expenses' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    
    return (
      <View style={styles.contentContainer}>
        {/* Income/Expense Toggle */}
        <Surface style={styles.toggleContainer}>
          <TouchableRipple
            onPress={() => setActiveStatsType('Income')}
            style={[
              styles.toggleButton,
              activeStatsType === 'Income' && styles.activeToggleButton
            ]}
          >
            <View style={styles.toggleContent}>
              <Text style={[styles.toggleLabel, activeStatsType === 'Income' && styles.activeToggleLabel]}>Income</Text>
              <Text 
                style={[
                  styles.toggleAmount,
                  { color: theme.colors.income }
                ]}
              >
                €{MONTHLY_TREND.income[MONTHLY_TREND.income.length - 1]}
              </Text>
            </View>
          </TouchableRipple>
          
          <TouchableRipple
            onPress={() => setActiveStatsType('Expenses')}
            style={[
              styles.toggleButton,
              activeStatsType === 'Expenses' && styles.activeToggleButton
            ]}
          >
            <View style={styles.toggleContent}>
              <Text style={[styles.toggleLabel, activeStatsType === 'Expenses' && styles.activeToggleLabel]}>Expenses</Text>
              <Text 
                style={[
                  styles.toggleAmount,
                  { color: theme.colors.expense }
                ]}
              >
                €{MONTHLY_TREND.expenses[MONTHLY_TREND.expenses.length - 1]}
              </Text>
            </View>
          </TouchableRipple>
        </Surface>

        {/* Pie Chart */}
        <View style={styles.pieChartContainer}>
          <PieChart
            data={pieChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={false}
            center={[screenWidth / 4, 0]}
          />
        </View>

        {/* Categories List */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  // Render Category Detail View Content
  const renderCategoryDetailContent = () => {
    if (!selectedCategory) return null;
    
    const category = (activeStatsType === 'Expenses' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)
      .find(cat => cat.id === selectedCategory);
    
    if (!category) return null;
    
    const transactions = getCategoryTransactions(selectedCategory);

    return (
      <View style={styles.contentContainer}>
        {/* Category Header */}
        <Surface style={styles.categoryHeaderContainer}>
          <View style={styles.categoryHeaderContent}>
            <Text style={styles.categoryHeaderTitle}>{category.name}</Text>
            <Text 
              style={[
                styles.categoryHeaderAmount,
                { color: activeStatsType === 'Expenses' ? theme.colors.expense : theme.colors.income }
              ]}
            >
              €{category.amount.toFixed(2)}
            </Text>
          </View>
        </Surface>

        {/* Historical Trend Graph */}
        <View style={styles.trendGraphContainer}>
          <Text style={styles.trendGraphTitle}>Historical Trend</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 32}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.trendGraph}
          />
        </View>

        {/* Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.transactionsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noTransactionsText}>No transactions found for this category.</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.appbar}>
        {selectedCategory && (
          <Appbar.BackAction onPress={handleBackToMainStats} />
        )}
        <View style={styles.periodNavigation}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={() => navigatePeriod('prev')}
          />
          <TouchableOpacity 
            onPress={() => console.log('Open period picker')}
            style={styles.periodLabelContainer}
          >
            <Text style={styles.periodLabel}>{getPeriodLabel()}</Text>
          </TouchableOpacity>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => navigatePeriod('next')}
          />
        </View>
        <View style={styles.appbarActions}>
          {!selectedCategory && (
            <IconButton
              icon="calendar"
              size={24}
              onPress={() => console.log('Change period type')}
            />
          )}
        </View>
      </Appbar.Header>

      {!selectedCategory && (
        <View style={styles.periodTypeContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: 'weekly', label: 'Weekly', value: 'Weekly' as TimePeriod },
              { id: 'monthly', label: 'Monthly', value: 'Monthly' as TimePeriod },
              { id: 'yearly', label: 'Yearly', value: 'Yearly' as TimePeriod },
              { id: 'custom', label: 'Custom', value: 'Custom' as TimePeriod }
            ]}
            renderItem={({ item }) => (
              <TouchableRipple
                style={[styles.periodTypeButton, timePeriod === item.value && styles.activePeriodTypeButton]}
                onPress={() => setTimePeriod(item.value)}
              >
                <Text style={[styles.periodTypeText, timePeriod === item.value && styles.activePeriodTypeText]}>
                  {item.label}
                </Text>
              </TouchableRipple>
            )}
            keyExtractor={item => item.id}
          />
        </View>
      )}

      {/* Main Content */}
      {selectedCategory ? (
        renderCategoryDetailContent()
      ) : (
        renderMainStatsContent()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    elevation: 0,
    backgroundColor: 'transparent',
  },
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  periodLabelContainer: {
    paddingHorizontal: 8,
  },
  periodLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  appbarActions: {
    flexDirection: 'row',
  },
  periodTypeContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  periodTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
  },
  activePeriodTypeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodTypeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activePeriodTypeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
  },
  toggleContent: {
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleLabel: {
    fontSize: 15,
    marginBottom: 4,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeToggleLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  toggleAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoriesList: {
    paddingBottom: 16,
  },
  categoryItem: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryColorAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColorBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flexDirection: 'column',
  },
  categoryPercentage: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    opacity: 0.7,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryHeaderContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeaderContent: {
    padding: 16,
    alignItems: 'center',
  },
  categoryHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryHeaderAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trendGraphContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trendGraphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trendGraph: {
    borderRadius: 12,
  },
  transactionsContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  transactionsList: {
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '500',
  },
  transactionAccount: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTransactionsText: {
    textAlign: 'center',
    padding: 16,
    opacity: 0.7,
  },
});

export default StatsScreen;