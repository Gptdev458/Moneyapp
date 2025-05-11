// src/services/storageService.ts
// Storage service for handling data persistence with AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAccount } from '../models/account';
import { IBudget } from '../models/budget';
import { ICategory } from '../models/category';
import { IGoal } from '../models/goal';
import { ISettings } from '../models/settings';
import { ITransaction } from '../models/transaction';
import { generateId } from '../utils/idGenerator';
import { updateBalancesForTransaction } from './balanceService';

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  ACCOUNTS: 'accounts',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  GOALS: 'goals',
};

// Default data

export const DEFAULT_SETTINGS: ISettings = {
  currency: 'USD',
  startDayOfMonth: 1,
  theme: 'system',
  passcodeEnabled: false,
  biometricEnabled: false,
  hideNetWorth: false,
  notificationsEnabled: true,
  backupRemindDays: 30
};

export const DEFAULT_ACCOUNTS: IAccount[] = [
  {
    id: generateId(),
    name: 'Cash',
    type: 'cash',
    initialBalance: 0,
    currency: 'USD',
    icon: 'cash',
    color: '#4CAF50',
    includeInNetWorth: true,
    isArchived: false
  },
  {
    id: generateId(),
    name: 'Bank Account',
    type: 'bank',
    initialBalance: 0,
    currency: 'USD',
    icon: 'bank',
    color: '#2196F3',
    includeInNetWorth: true,
    isArchived: false
  }
];

export const DEFAULT_CATEGORIES: ICategory[] = [
  // Income categories
  {
    id: generateId(),
    name: 'Salary',
    type: 'income',
    icon: 'cash',
    color: '#4CAF50'
  },
  {
    id: generateId(),
    name: 'Gifts',
    type: 'income',
    icon: 'gift',
    color: '#9C27B0'
  },
  {
    id: generateId(),
    name: 'Interest',
    type: 'income',
    icon: 'percent',
    color: '#3F51B5'
  },
  // Expense categories
  {
    id: generateId(),
    name: 'Food & Dining',
    type: 'expense',
    icon: 'food',
    color: '#FF5722'
  },
  {
    id: generateId(),
    name: 'Transportation',
    type: 'expense',
    icon: 'car',
    color: '#607D8B'
  },
  {
    id: generateId(),
    name: 'Housing',
    type: 'expense',
    icon: 'home',
    color: '#795548'
  },
  {
    id: generateId(),
    name: 'Utilities',
    type: 'expense',
    icon: 'flash',
    color: '#FFC107'
  },
  {
    id: generateId(),
    name: 'Shopping',
    type: 'expense',
    icon: 'cart',
    color: '#E91E63'
  },
  {
    id: generateId(),
    name: 'Entertainment',
    type: 'expense',
    icon: 'movie',
    color: '#9E9E9E'
  }
];

/**
 * Saves data to AsyncStorage with the given key
 * @param {string} key - The storage key
 * @param {any} data - The data to save
 * @returns {Promise<void>}
 */
export const saveData = async (key: string, data: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Loads data from AsyncStorage with the given key
 * @param {string} key - The storage key
 * @returns {Promise<any>} The parsed data or null if not found
 */
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Checks if the app is running for the first time by checking if settings exist
 * @returns {Promise<boolean>} True if first run, false otherwise
 */
export const isFirstRun = async (): Promise<boolean> => {
  try {
    const settings = await loadData<ISettings>(STORAGE_KEYS.SETTINGS);
    return settings === null;
  } catch (error) {
    console.error('Error checking first run status:', error);
    return true; // Assume first run on error
  }
};

/**
 * Initializes default data for the app if not already present
 * @returns {Promise<void>}
 */
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Check and initialize settings
    const settings = await loadData<ISettings>(STORAGE_KEYS.SETTINGS);
    if (settings === null) {
      await saveData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      console.log('Initialized default settings');
    }

    // Check and initialize accounts
    const accounts = await loadData<IAccount[]>(STORAGE_KEYS.ACCOUNTS);
    if (accounts === null) {
      await saveData(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
      console.log('Initialized default accounts');
    }

    // Check and initialize categories
    const categories = await loadData<ICategory[]>(STORAGE_KEYS.CATEGORIES);
    if (categories === null) {
      await saveData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      console.log('Initialized default categories');
    }

    // Check and initialize empty transactions array
    const transactions = await loadData<ITransaction[]>(STORAGE_KEYS.TRANSACTIONS);
    if (transactions === null) {
      await saveData(STORAGE_KEYS.TRANSACTIONS, []);
      console.log('Initialized empty transactions array');
    }

    // Check and initialize empty budgets array
    const budgets = await loadData<IBudget[]>(STORAGE_KEYS.BUDGETS);
    if (budgets === null) {
      await saveData(STORAGE_KEYS.BUDGETS, []);
      console.log('Initialized empty budgets array');
    }

    // Check and initialize empty goals array
    const goals = await loadData<IGoal[]>(STORAGE_KEYS.GOALS);
    if (goals === null) {
      await saveData(STORAGE_KEYS.GOALS, []);
      console.log('Initialized empty goals array');
    }

    console.log('Data initialization completed');
  } catch (error) {
    console.error('Error initializing default data:', error);
    throw error;
  }
};

// ============================================================================
// Specific API for Settings
// ============================================================================

/**
 * Gets the app settings
 * @returns {Promise<ISettings>} The app settings or default settings if not found
 */
export const getSettings = async (): Promise<ISettings> => {
  try {
    const settings = await loadData<ISettings>(STORAGE_KEYS.SETTINGS);
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS; // Return defaults on error
  }
};

/**
 * Saves the app settings
 * @param {ISettings} settings - The settings to save
 * @returns {Promise<void>}
 */
export const saveSettings = async (settings: ISettings): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.SETTINGS, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// ============================================================================
// Specific API for Accounts
// ============================================================================

/**
 * Gets all accounts
 * @returns {Promise<IAccount[]>} The accounts or empty array if not found
 */
export const getAccounts = async (): Promise<IAccount[]> => {
  try {
    const accounts = await loadData<IAccount[]>(STORAGE_KEYS.ACCOUNTS);
    return accounts || [];
  } catch (error) {
    console.error('Error getting accounts:', error);
    return []; // Return empty array on error
  }
};

/**
 * Saves all accounts
 * @param {IAccount[]} accounts - The accounts to save
 * @returns {Promise<void>}
 */
export const saveAccounts = async (accounts: IAccount[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.ACCOUNTS, accounts);
  } catch (error) {
    console.error('Error saving accounts:', error);
    throw error;
  }
};

/**
 * Adds a new account
 * @param {Omit<IAccount, 'id'>} account - The account data without ID
 * @returns {Promise<IAccount>} The created account with generated ID
 */
export const addAccount = async (account: Omit<IAccount, 'id'>): Promise<IAccount> => {
  try {
    const accounts = await getAccounts();
    
    const newAccount: IAccount = {
      ...account,
      id: generateId(),
    };
    
    accounts.push(newAccount);
    await saveAccounts(accounts);
    
    return newAccount;
  } catch (error) {
    console.error('Error adding account:', error);
    throw error;
  }
};

/**
 * Updates an existing account
 * @param {IAccount} account - The account data with ID
 * @returns {Promise<IAccount>} The updated account
 */
export const updateAccount = async (account: IAccount): Promise<IAccount> => {
  try {
    const accounts = await getAccounts();
    
    const index = accounts.findIndex(a => a.id === account.id);
    if (index === -1) {
      throw new Error(`Account with ID ${account.id} not found`);
    }
    
    accounts[index] = account;
    await saveAccounts(accounts);
    
    return account;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

/**
 * Deletes an account
 * Note: This is a soft delete (isArchived = true)
 * TODO: Handle associated transactions when deleting an account
 * @param {string} accountId - The ID of the account to delete
 * @returns {Promise<void>}
 */
export const deleteAccount = async (accountId: string): Promise<void> => {
  try {
    const accounts = await getAccounts();
    
    const index = accounts.findIndex(a => a.id === accountId);
    if (index === -1) {
      throw new Error(`Account with ID ${accountId} not found`);
    }
    
    // Soft delete
    accounts[index] = { ...accounts[index], isArchived: true };
    await saveAccounts(accounts);
    
    // TODO: Update or mark associated transactions
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

/**
 * Gets an account by ID
 * @param {string} accountId - The ID of the account to get
 * @returns {Promise<IAccount|null>} The account or null if not found
 */
export const getAccountById = async (accountId: string): Promise<IAccount|null> => {
  try {
    const accounts = await getAccounts();
    return accounts.find(a => a.id === accountId) || null;
  } catch (error) {
    console.error(`Error getting account with ID ${accountId}:`, error);
    return null;
  }
};

// ============================================================================
// Specific API for Categories
// ============================================================================

/**
 * Gets all categories
 * @returns {Promise<ICategory[]>} The categories or empty array if not found
 */
export const getCategories = async (): Promise<ICategory[]> => {
  try {
    const categories = await loadData<ICategory[]>(STORAGE_KEYS.CATEGORIES);
    return categories || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return []; // Return empty array on error
  }
};

/**
 * Saves all categories
 * @param {ICategory[]} categories - The categories to save
 * @returns {Promise<void>}
 */
export const saveCategories = async (categories: ICategory[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.CATEGORIES, categories);
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};

/**
 * Adds a new category
 * @param {Omit<ICategory, 'id'>} category - The category data without ID
 * @returns {Promise<ICategory>} The created category with generated ID
 */
export const addCategory = async (category: Omit<ICategory, 'id'>): Promise<ICategory> => {
  try {
    const categories = await getCategories();
    
    const newCategory: ICategory = {
      ...category,
      id: generateId(),
    };
    
    categories.push(newCategory);
    await saveCategories(categories);
    
    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Updates an existing category
 * @param {ICategory} category - The category data with ID
 * @returns {Promise<ICategory>} The updated category
 */
export const updateCategory = async (category: ICategory): Promise<ICategory> => {
  try {
    const categories = await getCategories();
    
    const index = categories.findIndex(c => c.id === category.id);
    if (index === -1) {
      throw new Error(`Category with ID ${category.id} not found`);
    }
    
    categories[index] = category;
    await saveCategories(categories);
    
    return category;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Deletes a category (soft delete)
 * @param {string} categoryId - The ID of the category to delete
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const categories = await getCategories();
    
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Soft delete
    categories[index] = { ...categories[index], isArchived: true };
    await saveCategories(categories);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Gets a category by ID
 * @param {string} categoryId - The ID of the category to get
 * @returns {Promise<ICategory|null>} The category or null if not found
 */
export const getCategoryById = async (categoryId: string): Promise<ICategory|null> => {
  try {
    const categories = await getCategories();
    return categories.find(c => c.id === categoryId) || null;
  } catch (error) {
    console.error(`Error getting category with ID ${categoryId}:`, error);
    return null;
  }
};

// ============================================================================
// Specific API for Transactions
// ============================================================================

/**
 * Gets all transactions
 * @returns {Promise<ITransaction[]>} The transactions or empty array if not found
 */
export const getTransactions = async (): Promise<ITransaction[]> => {
  try {
    console.log('[StorageService] Loading transactions from AsyncStorage');
    const transactions = await loadData<ITransaction[]>(STORAGE_KEYS.TRANSACTIONS);
    
    if (transactions === null) {
      console.log('[StorageService] No transactions found, returning empty array');
      return [];
    }
    
    console.log(`[StorageService] Loaded ${transactions.length} transactions successfully`);
    return transactions;
  } catch (error) {
    console.error('[StorageService] Error loading transactions:', error);
    
    // Check if this is a parsing error, which might indicate corrupted data
    if (error instanceof SyntaxError) {
      console.warn('[StorageService] JSON parsing error. Data might be corrupted. Resetting transactions store.');
      
      try {
        // Reset the transactions store to an empty array
        await saveData(STORAGE_KEYS.TRANSACTIONS, []);
      } catch (saveError) {
        console.error('[StorageService] Failed to reset transactions store:', saveError);
      }
    }
    
    // Return empty array as fallback to prevent app crash
    return [];
  }
};

/**
 * Saves all transactions
 * @param {ITransaction[]} transactions - The transactions to save
 * @returns {Promise<void>}
 */
export const saveTransactions = async (transactions: ITransaction[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

/**
 * Adds a new transaction and updates account balances
 * @param {Omit<ITransaction, 'id'>} transaction - The transaction data without ID
 * @returns {Promise<ITransaction>} The created transaction with generated ID
 */
export const addTransaction = async (transaction: Omit<ITransaction, 'id'>): Promise<ITransaction> => {
  try {
    const transactions = await getTransactions();
    
    const newTransaction: ITransaction = {
      ...transaction,
      id: generateId(),
    };
    
    transactions.push(newTransaction);
    await saveTransactions(transactions);
    
    // Update account balances
    await updateBalancesForTransaction(newTransaction);
    
    return newTransaction;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

/**
 * Updates an existing transaction and recalculates account balances
 * @param {ITransaction} transaction - The transaction data with ID
 * @returns {Promise<ITransaction>} The updated transaction
 */
export const updateTransaction = async (transaction: ITransaction): Promise<ITransaction> => {
  try {
    const transactions = await getTransactions();
    
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index === -1) {
      throw new Error(`Transaction with ID ${transaction.id} not found`);
    }
    
    // Get old transaction for balance recalculation
    const oldTransaction = transactions[index];
    
    transactions[index] = transaction;
    await saveTransactions(transactions);
    
    // Update account balances
    await updateBalancesForTransaction(transaction, oldTransaction);
    
    return transaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Deletes a transaction and updates account balances
 * @param {string} transactionId - The ID of the transaction to delete
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    const transactions = await getTransactions();
    
    const index = transactions.findIndex(t => t.id === transactionId);
    if (index === -1) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
    
    // Get transaction before removing for balance recalculation
    const deletedTransaction = transactions[index];
    
    // Remove transaction
    transactions.splice(index, 1);
    await saveTransactions(transactions);
    
    // Update account balances by reverting the transaction's effect
    await updateBalancesForTransaction(null as any, deletedTransaction);
    
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Gets a transaction by ID
 * @param {string} transactionId - The ID of the transaction to get
 * @returns {Promise<ITransaction|null>} The transaction or null if not found
 */
export const getTransactionById = async (transactionId: string): Promise<ITransaction|null> => {
  try {
    const transactions = await getTransactions();
    return transactions.find(t => t.id === transactionId) || null;
  } catch (error) {
    console.error(`Error getting transaction with ID ${transactionId}:`, error);
    return null;
  }
};

// ============================================================================
// Specific API for Budgets
// ============================================================================

/**
 * Gets all budgets
 * @returns {Promise<IBudget[]>} The budgets or empty array if not found
 */
export const getBudgets = async (): Promise<IBudget[]> => {
  try {
    const budgets = await loadData<IBudget[]>(STORAGE_KEYS.BUDGETS);
    return budgets || [];
  } catch (error) {
    console.error('Error getting budgets:', error);
    return []; // Return empty array on error
  }
};

/**
 * Saves all budgets
 * @param {IBudget[]} budgets - The budgets to save
 * @returns {Promise<void>}
 */
export const saveBudgets = async (budgets: IBudget[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.BUDGETS, budgets);
  } catch (error) {
    console.error('Error saving budgets:', error);
    throw error;
  }
};

/**
 * Adds a new budget
 * @param {Omit<IBudget, 'id'>} budget - The budget data without ID
 * @returns {Promise<IBudget>} The created budget with generated ID
 */
export const addBudget = async (budget: Omit<IBudget, 'id'>): Promise<IBudget> => {
  try {
    const budgets = await getBudgets();
    
    const newBudget: IBudget = {
      ...budget,
      id: generateId(),
    };
    
    budgets.push(newBudget);
    await saveBudgets(budgets);
    
    return newBudget;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

/**
 * Updates an existing budget
 * @param {IBudget} budget - The budget data with ID
 * @returns {Promise<IBudget>} The updated budget
 */
export const updateBudget = async (budget: IBudget): Promise<IBudget> => {
  try {
    const budgets = await getBudgets();
    
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index === -1) {
      throw new Error(`Budget with ID ${budget.id} not found`);
    }
    
    budgets[index] = budget;
    await saveBudgets(budgets);
    
    return budget;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

/**
 * Deletes a budget
 * @param {string} budgetId - The ID of the budget to delete
 * @returns {Promise<void>}
 */
export const deleteBudget = async (budgetId: string): Promise<void> => {
  try {
    const budgets = await getBudgets();
    
    const index = budgets.findIndex(b => b.id === budgetId);
    if (index === -1) {
      throw new Error(`Budget with ID ${budgetId} not found`);
    }
    
    budgets.splice(index, 1);
    await saveBudgets(budgets);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

/**
 * Gets a budget by ID
 * @param {string} budgetId - The ID of the budget to get
 * @returns {Promise<IBudget|null>} The budget or null if not found
 */
export const getBudgetById = async (budgetId: string): Promise<IBudget|null> => {
  try {
    const budgets = await getBudgets();
    return budgets.find(b => b.id === budgetId) || null;
  } catch (error) {
    console.error(`Error getting budget with ID ${budgetId}:`, error);
    return null;
  }
};

// ============================================================================
// Specific API for Goals
// ============================================================================

/**
 * Gets all goals
 * @returns {Promise<IGoal[]>} The goals or empty array if not found
 */
export const getGoals = async (): Promise<IGoal[]> => {
  try {
    const goals = await loadData<IGoal[]>(STORAGE_KEYS.GOALS);
    return goals || [];
  } catch (error) {
    console.error('Error getting goals:', error);
    return []; // Return empty array on error
  }
};

/**
 * Saves all goals
 * @param {IGoal[]} goals - The goals to save
 * @returns {Promise<void>}
 */
export const saveGoals = async (goals: IGoal[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.GOALS, goals);
  } catch (error) {
    console.error('Error saving goals:', error);
    throw error;
  }
};

/**
 * Adds a new goal
 * @param {Omit<IGoal, 'id'>} goal - The goal data without ID
 * @returns {Promise<IGoal>} The created goal with generated ID
 */
export const addGoal = async (goal: Omit<IGoal, 'id'>): Promise<IGoal> => {
  try {
    const goals = await getGoals();
    
    const newGoal: IGoal = {
      ...goal,
      id: generateId(),
    };
    
    goals.push(newGoal);
    await saveGoals(goals);
    
    return newGoal;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

/**
 * Updates an existing goal
 * @param {IGoal} goal - The goal data with ID
 * @returns {Promise<IGoal>} The updated goal
 */
export const updateGoal = async (goal: IGoal): Promise<IGoal> => {
  try {
    const goals = await getGoals();
    
    const index = goals.findIndex(g => g.id === goal.id);
    if (index === -1) {
      throw new Error(`Goal with ID ${goal.id} not found`);
    }
    
    goals[index] = goal;
    await saveGoals(goals);
    
    return goal;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Deletes a goal
 * @param {string} goalId - The ID of the goal to delete
 * @returns {Promise<void>}
 */
export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    const goals = await getGoals();
    
    const index = goals.findIndex(g => g.id === goalId);
    if (index === -1) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    
    goals.splice(index, 1);
    await saveGoals(goals);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

/**
 * Gets a goal by ID
 * @param {string} goalId - The ID of the goal to get
 * @returns {Promise<IGoal|null>} The goal or null if not found
 */
export const getGoalById = async (goalId: string): Promise<IGoal|null> => {
  try {
    const goals = await getGoals();
    return goals.find(g => g.id === goalId) || null;
  } catch (error) {
    console.error(`Error getting goal with ID ${goalId}:`, error);
    return null;
  }
};

/**
 * Resets all app data by clearing everything from AsyncStorage
 * @returns {Promise<void>}
 */
export const resetAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('All app data has been reset successfully');
  } catch (error) {
    console.error('Error resetting app data:', error);
    throw error;
  }
}; 