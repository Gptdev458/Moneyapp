// src/contexts/BudgetContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IBudget } from '../models/budget';
import * as storageService from '../services/storageService';
import { useTransactionContext } from './TransactionContext';

// Debug flag for logging
const DEBUG_ENABLED = false;

// Context type definition
interface BudgetContextType {
  budgets: IBudget[];
  isLoading: boolean;
  error: Error | null;
  getBudgetById: (id: string) => IBudget | undefined;
  addBudget: (budget: Omit<IBudget, 'id'>) => Promise<IBudget>;
  updateBudget: (budget: IBudget) => Promise<IBudget>;
  deleteBudget: (id: string) => Promise<void>;
  refreshBudgets: () => Promise<void>;
  getBudgetProgress: (budgetId: string) => number;
  getBudgetSpent: (budgetId: string) => number;
  getBudgetRemaining: (budgetId: string) => number;
  getBudgetsForCategory: (categoryId: string) => IBudget[];
  getCurrentPeriodBudgets: () => IBudget[];
}

// Create the context
export const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// The provider component
export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to track refresh operations
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);
  
  // Get transactions to calculate spending
  const { transactions } = useTransactionContext();
  
  // Debug logging
  const debugLog = useCallback((message: string, ...args: any[]) => {
    if (DEBUG_ENABLED) {
      console.log(`[BudgetContext] ${message}`, ...args);
    }
  }, []);

  // Load budgets on mount
  useEffect(() => {
    refreshBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh budgets from storage
  const refreshBudgets = useCallback(async (): Promise<void> => {
    try {
      // If already refreshing, don't start another refresh
      if (isRefreshing.current) {
        debugLog('Skipping refresh - already in progress');
        return;
      }
      
      // Debounce: prevent refreshes within 300ms of each other
      const now = Date.now();
      if (now - lastRefreshTime.current < 300) {
        debugLog('Debouncing refresh - too soon after last refresh');
        return;
      }
      
      // Mark that we're starting a refresh and update the last refresh time
      isRefreshing.current = true;
      lastRefreshTime.current = now;
      
      debugLog('Starting refresh operation');
      setIsLoading(true);
      setError(null);
      
      const loadedBudgets = await storageService.getBudgets();
      debugLog(`Loaded ${loadedBudgets.length} budgets`);
      setBudgets(loadedBudgets);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load budgets');
      setError(error);
      console.error('Error loading budgets:', err);
    } finally {
      setIsLoading(false);
      isRefreshing.current = false;
      debugLog('Refresh operation completed');
    }
  }, [debugLog]);

  // Get a budget by ID
  const getBudgetById = useCallback((id: string): IBudget | undefined => {
    return budgets.find(budget => budget.id === id);
  }, [budgets]);

  // Add a new budget
  const addBudget = useCallback(async (budgetData: Omit<IBudget, 'id'>): Promise<IBudget> => {
    try {
      setIsLoading(true);
      setError(null);
      
      debugLog('Adding new budget', budgetData);
      const newBudget = await storageService.addBudget(budgetData);
      
      // Update local state
      setBudgets(prevBudgets => [...prevBudgets, newBudget]);
      debugLog('Budget added successfully', newBudget.id);
      
      return newBudget;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add budget');
      setError(error);
      console.error('Error adding budget:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [debugLog]);

  // Update an existing budget
  const updateBudget = useCallback(async (budget: IBudget): Promise<IBudget> => {
    try {
      setIsLoading(true);
      setError(null);
      
      debugLog('Updating budget', budget.id);
      const updatedBudget = await storageService.updateBudget(budget);
      
      // Update local state
      setBudgets(prevBudgets => 
        prevBudgets.map(b => b.id === budget.id ? updatedBudget : b)
      );
      
      debugLog('Budget updated successfully', budget.id);
      return updatedBudget;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update budget');
      setError(error);
      console.error('Error updating budget:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [debugLog]);

  // Delete a budget
  const deleteBudget = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      debugLog('Deleting budget', id);
      await storageService.deleteBudget(id);
      
      // Update local state
      setBudgets(prevBudgets => 
        prevBudgets.filter(budget => budget.id !== id)
      );
      
      debugLog('Budget deleted successfully', id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete budget');
      setError(error);
      console.error('Error deleting budget:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [debugLog]);

  // Helper to get default end date based on period type
  const getDefaultEndDate = (budget: IBudget): Date => {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(startDate);
    
    if (budget.periodType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of the month
    } else if (budget.periodType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1);
    }
    
    return endDate;
  };

  // Calculate amount spent for a budget
  const getBudgetSpent = useCallback((budgetId: string): number => {
    const budget = getBudgetById(budgetId);
    if (!budget) return 0;
    
    // Get start and end dates for the budget period
    const startDate = new Date(budget.startDate);
    const endDate = budget.endDate ? new Date(budget.endDate) : getDefaultEndDate(budget);
    
    // Filter transactions by category and date range
    return transactions
      .filter(tx => 
        tx.categoryId === budget.categoryId &&
        tx.type === 'expense' &&
        new Date(tx.date) >= startDate &&
        new Date(tx.date) <= endDate
      )
      .reduce((total, tx) => total + tx.amount, 0);
  }, [transactions, getBudgetById]);

  // Calculate budget progress (percentage used)
  const getBudgetProgress = useCallback((budgetId: string): number => {
    const budget = getBudgetById(budgetId);
    if (!budget) return 0;
    
    const spent = getBudgetSpent(budgetId);
    return budget.amount > 0 ? Math.min(spent / budget.amount, 1) : 0;
  }, [getBudgetById, getBudgetSpent]);

  // Calculate remaining budget amount
  const getBudgetRemaining = useCallback((budgetId: string): number => {
    const budget = getBudgetById(budgetId);
    if (!budget) return 0;
    
    const spent = getBudgetSpent(budgetId);
    return budget.amount - spent;
  }, [getBudgetById, getBudgetSpent]);

  // Get budgets for a specific category
  const getBudgetsForCategory = useCallback((categoryId: string): IBudget[] => {
    return budgets.filter(budget => budget.categoryId === categoryId);
  }, [budgets]);

  // Get budgets for the current period (month/year)
  const getCurrentPeriodBudgets = useCallback((): IBudget[] => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return budgets.filter(budget => {
      const startDate = new Date(budget.startDate);
      
      // For monthly budgets, check if it's the current month
      if (budget.periodType === 'monthly') {
        return startDate.getMonth() === currentMonth && 
               startDate.getFullYear() === currentYear;
      }
      
      // For yearly budgets, check if the current date falls within the year period
      if (budget.periodType === 'yearly') {
        const endDate = budget.endDate ? new Date(budget.endDate) : getDefaultEndDate(budget);
        return now >= startDate && now <= endDate;
      }
      
      // For custom periods, check if the current date falls within the range
      if (budget.periodType === 'custom' && budget.endDate) {
        const endDate = new Date(budget.endDate);
        return now >= startDate && now <= endDate;
      }
      
      return false;
    });
  }, [budgets]);

  // Provide context values
  const value = {
    budgets,
    isLoading,
    error,
    getBudgetById,
    addBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets,
    getBudgetProgress,
    getBudgetSpent,
    getBudgetRemaining,
    getBudgetsForCategory,
    getCurrentPeriodBudgets
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

// Hook to use the budget context
export const useBudgetContext = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
}; 