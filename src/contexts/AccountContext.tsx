// src/contexts/AccountContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as storageService from '../services/storageService';
import { Account } from '../types';

interface AccountContextType {
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
  getAccountById: (id: string) => Account | undefined;
  addAccount: (account: Omit<Account, 'id'>) => Promise<Account>;
  updateAccount: (account: Account) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load accounts on mount
  useEffect(() => {
    refreshAccounts();
  }, []);

  // Refresh accounts from storage
  const refreshAccounts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedAccounts = await storageService.getAccounts();
      setAccounts(loadedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load accounts'));
      console.error('Error loading accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get an account by ID
  const getAccountById = (id: string): Account | undefined => {
    return accounts.find(account => account.id === id);
  };

  // Add a new account
  const addAccount = async (accountData: Omit<Account, 'id'>): Promise<Account> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newAccount = await storageService.addAccount(accountData);
      
      // Update local state
      setAccounts(prevAccounts => [...prevAccounts, newAccount]);
      
      return newAccount;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add account');
      setError(error);
      console.error('Error adding account:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing account
  const updateAccount = async (account: Account): Promise<Account> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedAccount = await storageService.updateAccount(account);
      
      // Update local state
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => acc.id === account.id ? updatedAccount : acc)
      );
      
      return updatedAccount;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update account');
      setError(error);
      console.error('Error updating account:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an account
  const deleteAccount = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await storageService.deleteAccount(id);
      
      // Update local state
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => {
          if (acc.id === id) {
            return { ...acc, isArchived: true }; // Soft delete
          }
          return acc;
        })
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete account');
      setError(error);
      console.error('Error deleting account:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide context values
  const value = {
    accounts,
    isLoading,
    error,
    getAccountById,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

// Hook to use the account context
export const useAccountContext = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccountContext must be used within an AccountProvider');
  }
  return context;
}; 