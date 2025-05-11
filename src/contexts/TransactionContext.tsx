// src/contexts/TransactionContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as storageService from '../services/storageService';
import { Transaction } from '../types';

// Enable/disable debug logging for transaction loading
const DEBUG_ENABLED = false;

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  getTransactionById: (id: string) => Transaction | undefined;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track if a refresh operation is in progress
  const isRefreshing = useRef(false);
  // Use a ref to keep track of the last refresh time to prevent multiple rapid refreshes
  const lastRefreshTime = useRef(0);
  
  // Debug logging function
  const debugLog = useCallback((message: string, ...args: any[]) => {
    if (DEBUG_ENABLED) {
      console.log(`[TransactionContext] ${message}`, ...args);
    }
  }, []);

  // Load transactions on mount
  useEffect(() => {
    refreshTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh transactions from storage with debounce protection
  const refreshTransactions = useCallback(async (): Promise<void> => {
    try {
      // If we're already refreshing, don't start another refresh
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
      
      const loadedTransactions = await storageService.getTransactions();
      debugLog(`Loaded ${loadedTransactions.length} transactions`);
      setTransactions(loadedTransactions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load transactions');
      setError(error);
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
      isRefreshing.current = false;
      debugLog('Refresh operation completed');
    }
  }, [debugLog]);

  // Get a transaction by ID
  const getTransactionById = useCallback((id: string): Transaction | undefined => {
    return transactions.find(transaction => transaction.id === id);
  }, [transactions]);

  // Add a new transaction
  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      setIsLoading(true);
      setError(null);
      
      debugLog('Adding new transaction', transactionData);
      const newTransaction = await storageService.addTransaction(transactionData);
      
      // Update local state
      setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
      debugLog('Transaction added successfully', newTransaction.id);
      
      return newTransaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add transaction');
      setError(error);
      console.error('Error adding transaction:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [debugLog]);

  // Update an existing transaction
  const updateTransaction = useCallback(async (transaction: Transaction): Promise<Transaction> => {
    try {
      setIsLoading(true);
      setError(null);
      
      debugLog('Updating transaction', transaction.id);
      const updatedTransaction = await storageService.updateTransaction(transaction);
      
      // Update local state
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => tx.id === transaction.id ? updatedTransaction : tx)
      );
      
      debugLog('Transaction updated successfully', transaction.id);
      return updatedTransaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update transaction');
      setError(error);
      console.error('Error updating transaction:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [debugLog]);

  // Delete a transaction
  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      debugLog('Deleting transaction', id);
      await storageService.deleteTransaction(id);
      
      // Update local state
      setTransactions(prevTransactions => 
        prevTransactions.filter(transaction => transaction.id !== id)
      );
      
      debugLog('Transaction deleted successfully', id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete transaction');
      setError(error);
      console.error('Error deleting transaction:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [debugLog]);

  // Provide context values
  const value = {
    transactions,
    isLoading,
    error,
    getTransactionById,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Hook to use the transaction context
export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
}; 