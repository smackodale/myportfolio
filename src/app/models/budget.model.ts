export enum Frequency {
  Weekly = 'Weekly',
  Biweekly = 'Biweekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  TwicePerYear = 'Twice Per Year',
  ThreeTimesPerYear = '3 Times Per Year',
  Yearly = 'Yearly',
}

export type EntryType = 'Income' | 'Expense';

export interface StandardEntry {
  name: string;
  amount: number;
  type: EntryType;
  frequency: Frequency;
  firstOccurrence?: string | Date; // Date string or Date object
}

export interface BudgetEntry {
  id: string;
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

/**
 * DTO for creating a new standard entry
 */
export interface CreateStandardEntryDto {
  name: string;
  amount: number;
  type: EntryType;
  frequency: Frequency;
  firstOccurrence?: string | Date;
}

/**
 * DTO for updating a standard entry (all fields optional)
 */
export interface UpdateStandardEntryDto {
  name?: string;
  amount?: number;
  type?: EntryType;
  frequency?: Frequency;
  firstOccurrence?: string | Date;
}

/**
 * DTO for creating a new budget
 */
export interface CreateBudgetDto {
  weekId: string;
  fyWeekLabel: string;
  startDate: string;
  endDate: string;
  entries: BudgetEntry[];
  totalIncome: number;
  totalExpenses: number;
  weekTotal: number;
}

/**
 * DTO for updating a budget (all fields optional)
 */
export interface UpdateBudgetDto {
  entries?: BudgetEntry[];
  totalIncome?: number;
  totalExpenses?: number;
  weekTotal?: number;
}
