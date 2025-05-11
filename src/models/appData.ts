import { IAccount } from './account';
import { IBudget } from './budget';
import { ICategory } from './category';
import { IGoal } from './goal';
import { ISettings } from './settings';
import { ITransaction } from './transaction';

export interface IAppData {
  settings: ISettings;
  accounts: IAccount[];
  categories: ICategory[];
  transactions: ITransaction[];
  budgets: IBudget[];
  goals: IGoal[];
  version: string; // App data schema version for migration handling
  lastBackupDate?: string; // ISO Date string of last backup
} 