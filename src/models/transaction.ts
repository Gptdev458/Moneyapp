export type TransactionEnumType = 'income' | 'expense' | 'transfer';

export interface ITransaction {
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