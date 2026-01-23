export enum Frequency {
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  TwicePerYear = 'Twice Per Year',
  ThreeTimesPerYear = '3 Times Per Year',
  Yearly = 'Yearly',
}

export type EntryType = 'Income' | 'Expense';

export interface StandardEntry {
  id: string;
  name: string;
  amount: number;
  type: EntryType;
  frequency: Frequency;
  nextOccurrence?: string | Date; // Date string or Date object
}

export interface BudgetEntry {
  id: string;
  standardEntryId?: string; // Link back to standard entry if applicable
  name: string;
  amount: number;
  type: EntryType;
  isStandard: boolean;
}

export interface Budget {
  weekId: string; // e.g., "2025-W10"
  fyWeekLabel: string; // e.g., "FY2025-WK10"
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  entries: BudgetEntry[];
  totalIncome: number;
  totalExpenses: number;
  weekTotal: number;
  runningSavings: number; // Calculated field based on previous weeks
  isPast?: boolean;
}
