import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Budget, BudgetEntry, EntryType, Frequency, StandardEntry } from '../models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetApiService {
  // Mock Database
  private standardEntries: StandardEntry[] = [
    {
      id: '1',
      name: 'Salary',
      amount: 2500,
      type: 'Income',
      frequency: Frequency.Weekly,
    },
    {
      id: '2',
      name: 'Mortgage',
      amount: 1800,
      type: 'Expense',
      frequency: Frequency.Monthly,
      nextOccurrence: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
    },
    {
      id: '3',
      name: 'Electricity',
      amount: 300,
      type: 'Expense',
      frequency: Frequency.Quarterly,
      nextOccurrence: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        20,
      ).toISOString(),
    },
  ];

  private readonly STORAGE_KEYS = {
    STANDARD_ENTRIES: 'budget_standard_entries',
    BUDGET_PREFIX: 'budget_week_',
  };

  // Cache
  private modifiedBudgets: Map<string, Budget> = new Map();

  constructor() {
    this.loadStandardEntries();
    this.loadModifiedBudgets();
  }

  private loadStandardEntries() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.STANDARD_ENTRIES);
    if (stored) {
      try {
        this.standardEntries = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse standard entries', e);
      }
    }
  }

  private saveStandardEntries() {
    localStorage.setItem(this.STORAGE_KEYS.STANDARD_ENTRIES, JSON.stringify(this.standardEntries));
  }

  private loadModifiedBudgets() {
    // Load all keys starting with prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEYS.BUDGET_PREFIX)) {
        try {
          const budget = JSON.parse(localStorage.getItem(key)!);
          this.modifiedBudgets.set(budget.weekId, budget);
        } catch (e) {
          console.error('Failed to parse budget', key, e);
        }
      }
    }
  }

  private saveBudgetToStorage(budget: Budget) {
    this.modifiedBudgets.set(budget.weekId, budget);
    localStorage.setItem(
      `${this.STORAGE_KEYS.BUDGET_PREFIX}${budget.weekId}`,
      JSON.stringify(budget),
    );
  }

  public getStandardEntries(): Observable<StandardEntry[]> {
    return of([...this.standardEntries]).pipe(delay(500));
  }

  public getStandardEntryById(id: string): Observable<StandardEntry> {
    const entry = this.standardEntries.find((e) => e.id === id);
    if (!entry) throw new Error('Standard Entry not found');
    return of(entry).pipe(delay(200));
  }

  public updateStandardEntry(id: string, entry: Partial<StandardEntry>): Observable<StandardEntry> {
    const index = this.standardEntries.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.standardEntries[index] = { ...this.standardEntries[index], ...entry };
      this.saveStandardEntries();
      return of(this.standardEntries[index]).pipe(delay(500));
    }
    throw new Error('Entry not found');
  }

  public addStandardEntry(entry: Omit<StandardEntry, 'id'>): Observable<StandardEntry> {
    const newEntry: StandardEntry = { ...entry, id: crypto.randomUUID() };
    this.standardEntries.push(newEntry);
    this.saveStandardEntries();
    return of(newEntry).pipe(delay(500));
  }

  public deleteStandardEntry(id: string): Observable<void> {
    this.standardEntries = this.standardEntries.filter((e) => e.id !== id);
    this.saveStandardEntries();
    return of(void 0).pipe(delay(500));
  }

  /**
   * Generates budgets starting from a given date.
   * Retrieves any stored budgets from LocalStorage (via cache).
   * Ensures at least 12 weeks are returned, or up to the last stored budget if further out.
   */
  public getBudgets(startDate: Date): Observable<Budget[]> {
    const budgets: Budget[] = [];

    // Align start date to the preceding Monday
    const start = new Date(startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    // Determine end date: Max of (Start + 12 weeks) OR (Last Stored Budget Date)
    // Find latest stored budget date
    let maxStoredDate = new Date(start);
    this.modifiedBudgets.forEach((b) => {
      const d = new Date(b.startDate);
      if (d > maxStoredDate) maxStoredDate = d;
    });

    const minEndDate = new Date(start);
    minEndDate.setDate(minEndDate.getDate() + 12 * 7); // Min 12 weeks

    const endDate = maxStoredDate > minEndDate ? maxStoredDate : minEndDate;
    // Align end date to end of that week
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    let current = new Date(start);
    while (current <= endDate) {
      const weekStart = new Date(current);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekId = this.getWeekId(weekStart);

      if (this.modifiedBudgets.has(weekId)) {
        budgets.push(this.modifiedBudgets.get(weekId)!);
      } else {
        const newBudget = this.generateBudgetForWeek(weekStart, weekEnd, weekId);
        this.saveBudgetToStorage(newBudget);
        budgets.push(newBudget);
      }

      current.setDate(current.getDate() + 7);
    }

    return of(budgets).pipe(delay(500));
  }

  // --- Budget CRUD ---

  public getBudgetById(weekId: string): Observable<Budget> {
    if (this.modifiedBudgets.has(weekId)) {
      return of(this.modifiedBudgets.get(weekId)!).pipe(delay(200));
    }
    // If not found in cache/storage, technically it doesn't exist yet as a DTO?
    // Or we should generate it?
    // Given the prompt "Stored DTO", if it's not stored, maybe it doesn't exist.
    // However, for this app valid weeks can be generated on the fly.
    // For a strict CRUD GetById, we usually expect 404 if not found.
    // But let's assume if it's missing we just throw or return null.
    // Safe option: throw.
    throw new Error('Budget not found');
  }

  public createBudget(budget: Budget): Observable<Budget> {
    // Check if exists?
    if (this.modifiedBudgets.has(budget.weekId)) {
      throw new Error('Budget already exists');
    }
    this.saveBudgetToStorage(budget);
    return of(budget).pipe(delay(200));
  }

  public updateBudget(budget: Budget): Observable<Budget> {
    if (!this.modifiedBudgets.has(budget.weekId)) {
      throw new Error('Budget does not exist');
    }
    this.saveBudgetToStorage(budget);
    return of(budget).pipe(delay(200));
  }

  public deleteBudget(weekId: string): Observable<void> {
    if (this.modifiedBudgets.has(weekId)) {
      this.modifiedBudgets.delete(weekId);
      localStorage.removeItem(`${this.STORAGE_KEYS.BUDGET_PREFIX}${weekId}`);
      return of(void 0).pipe(delay(200));
    }
    // If not found, considered already deleted?
    return of(void 0);
  }

  public resetBudget(weekId: string): Observable<Budget> {
    this.modifiedBudgets.delete(weekId);
    localStorage.removeItem(`${this.STORAGE_KEYS.BUDGET_PREFIX}${weekId}`);

    // Regenerate
    const year = parseInt(weekId.split('-W')[0]);
    const week = parseInt(weekId.split('-W')[1]);
    const simpleDate = this.getDateFromWeek(year, week);
    const weekStart = simpleDate;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return of(this.generateBudgetForWeek(weekStart, weekEnd, weekId)).pipe(delay(300));
  }

  public addNextBudget(): Observable<Budget> {
    // Determine the start date for the next budget
    // Find latest stored budget date
    let maxStoredDate: Date | null = null;

    // Check cache first as it should be sync with storage
    this.modifiedBudgets.forEach((b) => {
      const d = new Date(b.startDate);
      if (!maxStoredDate || d > maxStoredDate) {
        maxStoredDate = d;
      }
    });

    let nextStart: Date;
    if (maxStoredDate) {
      // Latest + 1 week
      const d = new Date(maxStoredDate);
      d.setDate(d.getDate() + 7);
      nextStart = d;
    } else {
      // Start of current week if nothing exists
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      nextStart = new Date(now);
      nextStart.setDate(diff);
      nextStart.setHours(0, 0, 0, 0);
    }

    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + 6);
    nextEnd.setHours(23, 59, 59, 999);

    const weekId = this.getWeekId(nextStart);

    // If it already exists (which shouldn't happen if max logic is correct, unless holes exist),
    // we might overwrite or return existing.
    // "create the next one in the chain" implies extending the end.

    const newBudget = this.generateBudgetForWeek(nextStart, nextEnd, weekId);
    this.saveBudgetToStorage(newBudget);

    return of(newBudget).pipe(delay(300));
  }

  private generateBudgetForWeek(start: Date, end: Date, weekId: string): Budget {
    const entries: BudgetEntry[] = [];

    this.standardEntries.forEach((std) => {
      if (this.shouldApplyToWeek(std, start, end)) {
        entries.push({
          id: crypto.randomUUID(),
          standardEntryId: std.id,
          name: std.name,
          amount: std.amount,
          type: std.type,
          isStandard: true,
        });
      }
    });

    const totalIncome = entries
      .filter((e) => e.type === 'Income')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = entries
      .filter((e) => e.type === 'Expense')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      weekId,
      fyWeekLabel: this.getFyWeekLabel(start),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      entries,
      totalIncome,
      totalExpenses,
      weekTotal: totalIncome - totalExpenses,
      runningSavings: 0, // Calculated later
    };
  }

  private shouldApplyToWeek(entry: StandardEntry, weekStart: Date, weekEnd: Date): boolean {
    if (entry.frequency === Frequency.Weekly) return true;

    if (!entry.nextOccurrence) return false;

    const nextOcc = new Date(entry.nextOccurrence);
    // Reset time to ensure clean date comparison
    nextOcc.setHours(0, 0, 0, 0);
    const wStart = new Date(weekStart);
    wStart.setHours(0, 0, 0, 0);
    const wEnd = new Date(weekEnd);
    wEnd.setHours(23, 59, 59, 999);

    // Iteratively project occurrence forward until we pass the week
    // Optimization: Start near the week year
    let current = new Date(nextOcc);

    // Safety break
    let limit = 1000;
    while (current <= wEnd && limit > 0) {
      if (current >= wStart && current <= wEnd) {
        return true;
      }
      current = this.addFrequency(current, entry.frequency);
      limit--;
    }

    return false;
  }

  private addFrequency(date: Date, freq: Frequency): Date {
    const d = new Date(date);
    switch (freq) {
      case Frequency.Weekly:
        d.setDate(d.getDate() + 7);
        break;
      case Frequency.Monthly:
        d.setMonth(d.getMonth() + 1);
        break;
      case Frequency.Quarterly:
        d.setMonth(d.getMonth() + 3);
        break;
      case Frequency.TwicePerYear:
        d.setMonth(d.getMonth() + 6);
        break;
      case Frequency.Yearly:
        d.setFullYear(d.getFullYear() + 1);
        break;
      case Frequency.ThreeTimesPerYear:
        d.setMonth(d.getMonth() + 4);
        break;
      default:
        d.setDate(d.getDate() + 7); // Fallback
    }
    return d;
  }

  private getWeekId(date: Date): string {
    const year = date.getFullYear();
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7,
    );
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  // Simplified ISO week calculation reverser
  private getDateFromWeek(year: number, week: number): Date {
    const d = new Date(year, 0, 1);
    const dayNum = d.getDay();
    const diff = --week * 7;

    // If 1 Jan is Friday to Sunday, it's part of previous year's week 52/53
    // But specific ISO logic is complex.
    // Simplified:
    // This is a rough estimation suitable for the mock.
    const startOffset = d.getTime() + week * 7 * 24 * 60 * 60 * 1000;
    // Correct to Monday?
    const approximate = new Date(startOffset);
    const day = approximate.getDay();
    const toMon = approximate.getDate() - day + (day === 0 ? -6 : 1);
    approximate.setDate(toMon);
    return approximate;
  }

  private getFyWeekLabel(date: Date): string {
    // Australian FY starts July 1.
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const fy = month >= 6 ? year + 1 : year;

    // Calculate week of FY
    // FY Start: July 1 of (fy-1)
    const fyStart = new Date(fy - 1, 6, 1); // July 1
    const diffTime = Math.abs(date.getTime() - fyStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const wk = Math.ceil(diffDays / 7);

    return `FY${fy}-WK${wk}`;
  }
}
