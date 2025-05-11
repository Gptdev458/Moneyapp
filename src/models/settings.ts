export interface ISettings {
  currency: string; // e.g., "EUR", "USD"
  startDayOfMonth: number; // 1-31, for monthly budgeting cycle
  theme: 'light' | 'dark' | 'system'; // Theme preference
  passcodeEnabled: boolean; // Whether app is protected by passcode
  biometricEnabled?: boolean; // Whether biometric authentication is enabled
  defaultAccount?: string; // Default account ID for new transactions
  hideNetWorth?: boolean; // Option to hide net worth for privacy
  notificationsEnabled?: boolean; // Whether push notifications are enabled
  backupRemindDays?: number; // Remind user to backup data every X days
} 