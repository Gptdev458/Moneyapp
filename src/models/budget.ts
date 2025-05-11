export interface IBudget {
  id: string;
  categoryId: string;
  periodType: 'monthly' | 'yearly' | 'custom';
  startDate: string; // ISO Date string (YYYY-MM-DD)
  endDate?: string; // ISO Date string (YYYY-MM-DD) (for custom period)
  amount: number;
  alertThreshold?: number; // e.g., 0.8 for 80% (optional)
} 