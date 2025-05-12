// src/services/balanceService.ts
// Service for updating account balances when transactions are added, updated, or deleted

import { Account, Transaction } from '../types';
import { getAccounts, saveAccounts } from './storageService';

// Use type aliases for backward compatibility during transition
type IAccount = Account;
type ITransaction = Transaction;

/**
 * Updates account balances when a transaction is added, updated, or deleted
 * 
 * This is the main function that handles all account balance updates related to transactions.
 * It can:
 * 1. Add a new transaction's effect on balances
 * 2. Update balances when a transaction is modified (revert old, apply new)
 * 3. Remove a transaction's effect on balances when deleted
 * 
 * @param {ITransaction} transaction - The new or updated transaction
 * @param {ITransaction|undefined} oldTransaction - The previous version of the transaction (if updating)
 * @returns {Promise<void>}
 */
export const updateBalancesForTransaction = async (
  transaction: ITransaction,
  oldTransaction?: ITransaction
): Promise<void> => {
  try {
    // Get all accounts to update them
    const accounts = await getAccounts();
    
    // If we have an old transaction, first revert its effects
    if (oldTransaction) {
      revertTransactionBalances(accounts, oldTransaction);
    }
    
    // If this is not a delete operation, apply the new transaction effects
    if (transaction) {
      applyTransactionBalances(accounts, transaction);
    }
    
    // Save the updated accounts
    await saveAccounts(accounts);
  } catch (error) {
    console.error('Error updating account balances:', error);
    throw error;
  }
};

/**
 * Applies a transaction's effect to account balances
 * @param {IAccount[]} accounts - The accounts array to modify
 * @param {ITransaction} transaction - The transaction to apply
 */
const applyTransactionBalances = (accounts: IAccount[], transaction: ITransaction): void => {
  switch (transaction.type) {
    case 'income':
      // Income: Add to the receiving account
      const incomeAccount = accounts.find(a => a.id === transaction.accountId);
      if (incomeAccount) {
        incomeAccount.initialBalance += transaction.amount;
      }
      break;
      
    case 'expense':
      // Expense: Subtract from the source account
      const expenseAccount = accounts.find(a => a.id === transaction.accountId);
      if (expenseAccount) {
        expenseAccount.initialBalance -= transaction.amount;
      }
      break;
      
    case 'transfer':
      // Transfer: Subtract from the source account and add to the destination account
      const fromAccount = accounts.find(a => a.id === transaction.fromAccountId);
      const toAccount = accounts.find(a => a.id === transaction.toAccountId);
      
      if (fromAccount) {
        fromAccount.initialBalance -= transaction.amount;
      }
      
      if (toAccount) {
        toAccount.initialBalance += transaction.amount;
      }
      break;
  }
};

/**
 * Reverts a transaction's effect from account balances (opposite of apply)
 * @param {IAccount[]} accounts - The accounts array to modify
 * @param {ITransaction} transaction - The transaction to revert
 */
const revertTransactionBalances = (accounts: IAccount[], transaction: ITransaction): void => {
  switch (transaction.type) {
    case 'income':
      // Income: Subtract from the receiving account
      const incomeAccount = accounts.find(a => a.id === transaction.accountId);
      if (incomeAccount) {
        incomeAccount.initialBalance -= transaction.amount;
      }
      break;
      
    case 'expense':
      // Expense: Add back to the source account
      const expenseAccount = accounts.find(a => a.id === transaction.accountId);
      if (expenseAccount) {
        expenseAccount.initialBalance += transaction.amount;
      }
      break;
      
    case 'transfer':
      // Transfer: Add back to source account and subtract from destination
      const fromAccount = accounts.find(a => a.id === transaction.fromAccountId);
      const toAccount = accounts.find(a => a.id === transaction.toAccountId);
      
      if (fromAccount) {
        fromAccount.initialBalance += transaction.amount;
      }
      
      if (toAccount) {
        toAccount.initialBalance -= transaction.amount;
      }
      break;
  }
};

/**
 * Recalculates all account balances based on all transactions
 * This is a heavy operation and should be used only for repair/recovery
 * @returns {Promise<void>}
 */
export const recalculateAllAccountBalances = async (): Promise<void> => {
  // TODO: Implement full recalculation logic using all transactions
  // This would be useful if account balances ever get out of sync with transactions
}; 