export interface IGoal {
  id: string; // UUID
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // ISO Date string (YYYY-MM-DD)
  targetDate?: string; // ISO Date string (YYYY-MM-DD), optional end date
  description?: string;
  icon?: string; // Name of an icon from react-native-vector-icons
  color?: string; // Hex color for UI representation
  isCompleted: boolean;
  isArchived?: boolean; // Soft delete, default false
  linkedAccountId?: string; // Optional account to track progress from
} 