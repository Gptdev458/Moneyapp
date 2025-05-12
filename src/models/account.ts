export type AccountType = 'cash' | 'bank' | 'savings' | 'investment' | 'debt' | 'other';

export interface IAccount {
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