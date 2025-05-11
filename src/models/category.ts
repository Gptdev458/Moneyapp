export interface ICategory {
  id: string; // UUID
  name: string;
  type: 'income' | 'expense'; // Categories are specific to income or expense
  parentId?: string; // For sub-categories
  icon?: string; // Name of an icon from react-native-vector-icons
  color?: string; // Hex color for UI representation
  isArchived?: boolean; // Soft delete, default false
} 