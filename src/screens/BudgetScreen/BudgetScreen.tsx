// src/screens/BudgetScreen/BudgetScreen.tsx
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useBudgetContext } from '../../contexts/BudgetContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { BottomTabParamList, RootStackParamList } from '../../types';

// Import BudgetCard component
import BudgetCard from '../../components/common/BudgetCard';

// Import icons
import {
    SearchIcon,
    SettingsIcon,
} from '../../components/icons/IconComponents';

// Define combined navigation prop type for this screen
type BudgetScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'BudgetTab'>,
  StackNavigationProp<RootStackParamList>
>;

const BudgetScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<BudgetScreenNavigationProp>();
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  
  // Use BudgetContext
  const { 
    budgets, 
    isLoading, 
    error,
    getCurrentPeriodBudgets,
    getBudgetProgress,
    getBudgetSpent,
    getBudgetRemaining
  } = useBudgetContext();
  
  // Get categories for displaying icons
  const { categories } = useCategoryContext();
  
  // Filter budgets based on selected period
  const filteredBudgets = useMemo(() => {
    return period === 'month' 
      ? budgets.filter(budget => budget.periodType === 'monthly')
      : budgets.filter(budget => budget.periodType === 'yearly');
  }, [budgets, period]);
  
  // Calculate budget totals
  const { totalBudget, totalSpent, totalRemaining, overallProgress } = useMemo(() => {
    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + getBudgetSpent(budget.id), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallProgress = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
    
    return { totalBudget, totalSpent, totalRemaining, overallProgress };
  }, [filteredBudgets, getBudgetSpent]);
  
  // Handle period change
  const handlePeriodChange = (newPeriod: 'month' | 'year') => {
    setPeriod(newPeriod);
  };
  
  // Navigate to add budget screen
  const handleAddBudget = useCallback(() => {
    console.log('Add new budget');
    navigation.getParent()?.navigate('AddBudget');
  }, [navigation]);
  
  // Navigate to budget detail screen
  const handleBudgetPress = useCallback((budgetId: string) => {
    console.log(`Budget pressed: ${budgetId}`);
    navigation.getParent()?.navigate('AddBudget', { budgetId });
  }, [navigation]);
  
  // Get category icon based on category ID
  const getCategoryIcon = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 'food';
    
    // This is a simplification; in a real app, you would map category.icon to actual icons
    return category.icon || 'shapes';
  }, [categories]);
  
  // Get category color based on category ID
  const getCategoryColor = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return theme.colors.expense;
    return category.color || theme.colors.expense;
  }, [categories, theme.colors.expense]);
  
  // Get category name based on category ID
  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  }, [categories]);

  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>Loading budgets...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Error loading budgets: {error.message}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {/* refreshBudgets() */}}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Budgets</Text>
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
      <View style={[styles.periodSelector, { backgroundColor: theme.colors.surfaceVariant }]}>
        <TouchableOpacity
          style={[
            styles.periodOption,
            period === 'month' && [styles.activePeriod, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text style={[
            styles.periodText,
            { color: period === 'month' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodOption,
            period === 'year' && [styles.activePeriod, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => handlePeriodChange('year')}
        >
          <Text style={[
            styles.periodText,
            { color: period === 'year' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Year
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Overall budget summary */}
        <View style={[styles.overallBudget, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.overallBudgetHeader}>
            <Text style={[styles.overallBudgetTitle, { color: theme.colors.textPrimary }]}>
              Total Budget
            </Text>
            <Text style={[styles.overallBudgetAmount, { color: theme.colors.income }]}>
              € {totalBudget.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${overallProgress * 100}%`, backgroundColor: theme.colors.primary }
                ]} 
              />
            </View>
            <View style={styles.budgetStats}>
              <View style={styles.budgetStatItem}>
                <Text style={[styles.budgetStatLabel, { color: theme.colors.textSecondary }]}>
                  Spent
                </Text>
                <Text style={[styles.budgetStatValue, { color: theme.colors.expense }]}>
                  € {totalSpent.toFixed(2)}
                </Text>
              </View>
              <View style={styles.budgetStatItem}>
                <Text style={[styles.budgetStatLabel, { color: theme.colors.textSecondary }]}>
                  Remaining
                </Text>
                <Text style={[styles.budgetStatValue, { color: theme.colors.income }]}>
                  € {totalRemaining.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category budgets */}
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Category Budgets
          </Text>
          <TouchableOpacity onPress={handleAddBudget}>
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {filteredBudgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No budgets for this period.
            </Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddBudget}
            >
              <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }]}>
                Add Budget
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetCards}>
            {filteredBudgets.map(budget => {
              const progress = getBudgetProgress(budget.id);
              const spent = getBudgetSpent(budget.id);
              const remaining = getBudgetRemaining(budget.id);
              const categoryColor = getCategoryColor(budget.categoryId);
              const categoryIcon = getCategoryIcon(budget.categoryId);
              const categoryName = getCategoryName(budget.categoryId);
              
              return (
                <BudgetCard
                  key={budget.id}
                  name={categoryName}
                  icon={<MaterialCommunityIcons name={categoryIcon} size={24} color={categoryColor} />}
                  spent={spent}
                  limit={budget.amount}
                  color={categoryColor}
                  onPress={() => handleBudgetPress(budget.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      
      {/* <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddBudget}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activePeriod: {
    borderBottomWidth: 3,
  },
  periodText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for FAB
  },
  overallBudget: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  overallBudgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallBudgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overallBudgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarWrapper: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStatItem: {
    alignItems: 'flex-start',
  },
  budgetStatLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  budgetStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  budgetCards: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BudgetScreen; 