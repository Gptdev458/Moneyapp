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

// Define combined navigation prop type for this screen
type BudgetScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'BudgetTab'>,
  StackNavigationProp<RootStackParamList>
>;

const BudgetScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<BudgetScreenNavigationProp>();
  
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
  
  // Filter budgets based on selected month
  const filteredBudgets = useMemo(() => {
    return getCurrentPeriodBudgets(currentDate).filter(budget => budget.periodType === 'monthly');
  }, [budgets, getCurrentPeriodBudgets, currentDate]);
  
  // Calculate budget totals
  const { totalBudget, totalSpent, totalRemaining, overallProgress } = useMemo(() => {
    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + getBudgetSpent(budget.id), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallProgress = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
    
    return { totalBudget, totalSpent, totalRemaining, overallProgress };
  }, [filteredBudgets, getBudgetSpent]);
  
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
      {/* Month navigation - moved to top position */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthNavigationButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.monthNavigationText}>{formattedMonthYear}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavigationButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Overall budget summary */}
        <View style={styles.budgetSummaryContainer}>
          <Text style={styles.budgetTotalLabel}>Total Monthly Budget</Text>
          <Text style={styles.budgetTotalAmount}>€ {totalBudget.toFixed(2)}</Text>
          
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${overallProgress * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          {/* Spent and remaining */}
          <View style={styles.spentRemainingContainer}>
            <Text style={styles.spentText}>Spent: € {totalSpent.toFixed(2)}</Text>
            <Text style={styles.remainingText}>Remaining: € {totalRemaining.toFixed(2)}</Text>
          </View>
          
          {/* Add New Budget button */}
          <TouchableOpacity 
            style={styles.addBudgetButton}
            onPress={handleAddBudget}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={styles.addBudgetButtonText}>Add New Budget</Text>
          </TouchableOpacity>
        </View>

        {/* All Budgets section */}
        <Text style={styles.allBudgetsHeader}>All Budgets</Text>
        
        {filteredBudgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No budgets for this period.
            </Text>
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
  // Month navigation
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  monthNavigationButton: {
    padding: 8,
  },
  monthNavigationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 16,
  },
  // New Budget Summary styles
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 16,
  },
  budgetSummaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  budgetTotalLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  budgetTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4287f5', // Blue color
    borderRadius: 4,
  },
  spentRemainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  spentText: {
    fontSize: 14,
    color: 'white',
  },
  remainingText: {
    fontSize: 14,
    color: 'white',
  },
  addBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  addBudgetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  allBudgetsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 16,
  },
  budgetCards: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BudgetScreen; 