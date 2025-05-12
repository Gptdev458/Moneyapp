// src/types/index.ts
import { lightThemeColors, spacing, typography } from '../theme';

export type TransactionEnumType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string; // UUID
  type: TransactionEnumType;
  date: string; // ISO string (e.g., "2025-05-07T22:23:00.000Z")
  amount: number; // Always positive. Sign determined by type or context.
  accountId: string; // ID of the primary account involved
  fromAccountId?: string; // For transfers: source account ID
  toAccountId?: string; // For transfers: destination account ID
  categoryId?: string; // Optional for transfers, usually required for income/expense
  category?: string; // The category name or type, like 'food', 'nicotine', etc.
  description: string; // Main user-entered description/name (e.g. "Groceries")
  note?: string; // Optional additional notes
  pictureUri?: string; // Optional local URI for an attached picture
  isRecurring?: boolean; // Default false
  recurrenceRule?: string; // e.g., rrule string for recurrence
  tags?: string[];
}

export type AccountType = 'cash' | 'bank' | 'savings' | 'investment' | 'debt' | 'other';

export interface Account {
  id: string; // UUID
  name: string;
  type: AccountType;
  subtype?: string; // Optional field for account subtype (e.g., "Wallet", "Zekuci racun", etc.)
  initialBalance: number;
  currency: string; // e.g., "EUR"
  icon?: string; // Name of an icon from react-native-vector-icons
  color?: string; // Hex color for UI representation
  includeInNetWorth?: boolean; // Default true
  isArchived?: boolean; // Soft delete, default false
}

export interface Category {
  id: string; // UUID
  name: string;
  type: 'income' | 'expense'; // Categories are specific to income or expense
  parentId?: string; // For sub-categories
  icon?: string; // Name of an icon from react-native-vector-icons
  color?: string; // Hex color for UI representation
  isArchived?: boolean; // Soft delete, default false
}

export interface Budget {
  id: string;
  categoryId: string;
  periodType: 'monthly' | 'yearly' | 'custom';
  startDate: string; // ISO Date string (YYYY-MM-DD)
  endDate?: string; // ISO Date string (YYYY-MM-DD) (for custom period)
  amount: number;
  alertThreshold?: number; // e.g., 0.8 for 80% (optional)
}

// --- Navigation Param Lists ---
// These define the routes and any parameters they can receive.

// For the main stack navigator that wraps the BottomTabNavigator and includes modals
export type RootStackParamList = {
  MainAppTabs: { screen?: keyof BottomTabParamList } | undefined; // This route will render the BottomTabNavigator
  AddTransaction: { accountId?: string; transactionId?: string; type?: TransactionEnumType }; // Optional params
  AddBudget: { budgetId?: string }; // Add route for adding/editing budgets
  CategoryDetailStats: { categoryId?: string; periodLabel?: string; startDate?: string; endDate?: string; type?: 'income' | 'expense' };
  AccountDetail: { accountId: string };
  EditAccount: { accountId: string };
  AllTransactions: undefined; // Screen showing all transactions
  Configuration: undefined;
  BackupRestore: undefined;
  PasscodeSettings: undefined;
  // Settings screens
  AccountSettings: undefined;
  CategorySettings: undefined;
  // Add other full-screen or modal routes here as they are created
  // Example: EditCategory: { categoryId: string };
};

// For the Bottom Tab Navigator
export type BottomTabParamList = {
  TransactionsTab: undefined; // Tab for transactions (previously HomeTab)
  BudgetTab: undefined; // Tab for budget goals
  StatsTab: undefined;
  AccountsTab: undefined;
  MoreTab: undefined;
};

// You might also want to define specific stack param lists if tabs themselves contain stacks
// For example, if AccountsTab is a stack:
export type AccountsStackParamList = {
  AccountsList: undefined; // The main screen for the AccountsTab
  AccountDetail: { accountId: string }; // Navigated to from AccountsList
  EditAccount: { accountId: string }; // Navigated to from AccountDetail
};

export type StatsStackParamList = {
    StatsOverview: undefined;
    CategoryDetailStats: { categoryId: string; periodLabel: string; startDate: string; endDate: string; type: 'income' | 'expense' };
};


// General type for navigation prop used in screens
// import { StackNavigationProp } from '@react-navigation/stack';
// Example: export type MyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyScreenRouteName'>;

// import { RouteProp } from '@react-navigation/native';
// Example: export type MyScreenRouteProp = RouteProp<RootStackParamList, 'MyScreenRouteName'>;

export type AppThemeColors = typeof lightThemeColors;
export interface AppTheme {
  colors: AppThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  isDark: boolean;
}