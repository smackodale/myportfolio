import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Budget,
  CreateBudgetDto,
  CreateStandardEntryDto,
  StandardEntry,
  UpdateBudgetDto,
  UpdateStandardEntryDto,
} from '../models/budget.model';

/**
 * MOCK API Service for Budget Management
 * Uses localStorage for persistence for testing purposes
 * Simple CRUD operations only - no business logic
 */
@Injectable({
  providedIn: 'root',
})
export class BudgetApiService {
  private readonly STORAGE_KEYS = {
    STANDARD_ENTRIES: 'budget_standard_entries',
    BUDGETS: 'budget_budgets',
  };

  private standardEntries: StandardEntry[] = [];
  private budgets: Budget[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Load standard entries
    const entriesData = localStorage.getItem(this.STORAGE_KEYS.STANDARD_ENTRIES);
    if (entriesData) {
      try {
        this.standardEntries = JSON.parse(entriesData);
      } catch (e) {
        console.error('Failed to parse standard entries', e);
        this.standardEntries = [];
      }
    }

    // Load budgets
    const budgetsData = localStorage.getItem(this.STORAGE_KEYS.BUDGETS);
    if (budgetsData) {
      try {
        this.budgets = JSON.parse(budgetsData);
      } catch (e) {
        console.error('Failed to parse budgets', e);
        this.budgets = [];
      }
    }
  }

  private saveStandardEntriesToStorage(): void {
    localStorage.setItem(this.STORAGE_KEYS.STANDARD_ENTRIES, JSON.stringify(this.standardEntries));
  }

  private saveBudgetsToStorage(): void {
    localStorage.setItem(this.STORAGE_KEYS.BUDGETS, JSON.stringify(this.budgets));
  }

  // ========== STANDARD ENTRIES CRUD ==========

  /**
   * Get all standard entries
   */
  getStandardEntries(): Observable<StandardEntry[]> {
    return of([...this.standardEntries]).pipe(delay(500));
  }

  /**
   * Get a single standard entry by name
   */
  getStandardEntryByName(name: string): Observable<StandardEntry> {
    const entry = this.standardEntries.find((e) => e.name === name);
    if (entry) {
      return of({ ...entry }).pipe(delay(300));
    }
    return throwError(() => new Error('Standard entry not found')).pipe(delay(300));
  }

  /**
   * Create a new standard entry
   */
  createStandardEntry(dto: CreateStandardEntryDto): Observable<StandardEntry> {
    // Check if entry with same name already exists
    if (this.standardEntries.some((e) => e.name === dto.name)) {
      return throwError(() => new Error('Standard entry with this name already exists')).pipe(
        delay(300),
      );
    }

    const newEntry: StandardEntry = { ...dto };
    this.standardEntries.push(newEntry);
    this.saveStandardEntriesToStorage();

    return of(newEntry).pipe(delay(500));
  }

  /**
   * Update an existing standard entry
   */
  updateStandardEntry(name: string, dto: UpdateStandardEntryDto): Observable<StandardEntry> {
    const index = this.standardEntries.findIndex((e) => e.name === name);

    if (index !== -1) {
      const updatedEntry = {
        ...this.standardEntries[index],
        ...dto,
      };
      this.standardEntries[index] = updatedEntry;
      this.saveStandardEntriesToStorage();
      return of(updatedEntry).pipe(delay(500));
    }

    return throwError(() => new Error('Standard entry not found')).pipe(delay(500));
  }

  /**
   * Delete a standard entry
   */
  deleteStandardEntry(name: string): Observable<void> {
    const index = this.standardEntries.findIndex((e) => e.name === name);

    if (index !== -1) {
      this.standardEntries.splice(index, 1);
      this.saveStandardEntriesToStorage();
      return of(void 0).pipe(delay(500));
    }

    return throwError(() => new Error('Standard entry not found')).pipe(delay(500));
  }

  // ========== BUDGETS CRUD ==========

  /**
   * Get all budgets
   */
  getBudgets(): Observable<Budget[]> {
    return of([...this.budgets]).pipe(delay(500));
  }

  /**
   * Get a single budget by weekId
   */
  getBudgetById(weekId: string): Observable<Budget> {
    const budget = this.budgets.find((b) => b.weekId === weekId);
    if (budget) {
      return of({ ...budget }).pipe(delay(300));
    }
    return throwError(() => new Error('Budget not found')).pipe(delay(300));
  }

  /**
   * Create a new budget
   */
  createBudget(dto: CreateBudgetDto): Observable<Budget> {
    // Check if budget with same weekId already exists
    if (this.budgets.some((b) => b.weekId === dto.weekId)) {
      return throwError(() => new Error('Budget for this week already exists')).pipe(delay(300));
    }

    const newBudget: Budget = {
      ...dto,
      runningSavings: 0, // Will be calculated by state
      isPast: false, // Will be calculated by state
    };

    this.budgets.push(newBudget);
    this.saveBudgetsToStorage();

    return of(newBudget).pipe(delay(500));
  }

  /**
   * Update an existing budget
   */
  updateBudget(weekId: string, dto: UpdateBudgetDto): Observable<Budget> {
    const index = this.budgets.findIndex((b) => b.weekId === weekId);

    if (index !== -1) {
      const updatedBudget = {
        ...this.budgets[index],
        ...dto,
      };
      this.budgets[index] = updatedBudget;
      this.saveBudgetsToStorage();
      return of(updatedBudget).pipe(delay(500));
    }

    return throwError(() => new Error('Budget not found')).pipe(delay(500));
  }

  /**
   * Delete a budget
   */
  deleteBudget(weekId: string): Observable<void> {
    const index = this.budgets.findIndex((b) => b.weekId === weekId);

    if (index !== -1) {
      this.budgets.splice(index, 1);
      this.saveBudgetsToStorage();
      return of(void 0).pipe(delay(500));
    }

    return throwError(() => new Error('Budget not found')).pipe(delay(500));
  }
}
