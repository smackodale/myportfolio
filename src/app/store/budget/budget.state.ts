import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Budget, BudgetEntry, StandardEntry } from '../../models/budget.model';
import { BudgetApiService } from '../../services/budget-api.service';
import { BudgetCalculationService } from '../../services/budget-calculation.service';
import {
  AddNextBudget,
  AddStandardEntry,
  DeleteStandardEntry,
  LoadBudgets,
  LoadStandardEntries,
  ResetBudgetToStandard,
  UpdateBudgetEntry,
  UpdateStandardEntry,
} from './budget.actions';

export interface BudgetStateModel {
  budgets: Budget[];
  standardEntries: StandardEntry[];
  showPast: boolean;
  isLoading: boolean;
  error: string | null;
}

@State<BudgetStateModel>({
  name: 'budget',
  defaults: {
    budgets: [],
    standardEntries: [],
    showPast: false,
    isLoading: false,
    error: null,
  },
})
@Injectable()
export class BudgetState {
  private apiService = inject(BudgetApiService);
  private calculationService = inject(BudgetCalculationService);

  @Selector()
  static budgets(state: BudgetStateModel): Budget[] {
    return state.budgets;
  }

  @Selector()
  static standardEntries(state: BudgetStateModel): StandardEntry[] {
    return state.standardEntries;
  }

  @Selector()
  static isLoading(state: BudgetStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static currentSettings(state: BudgetStateModel): { showPast: boolean } {
    return { showPast: state.showPast };
  }

  @Action(LoadBudgets)
  loadBudgets(ctx: StateContext<BudgetStateModel>, action: LoadBudgets) {
    ctx.patchState({ isLoading: true, error: null, showPast: action.showPast });

    return this.apiService.getBudgets().pipe(
      tap((budgets) => {
        this.calculationService.recalculateRunningSavingsAndPast(budgets);
        ctx.patchState({ budgets, isLoading: false });
      }),
      catchError((err) => {
        ctx.patchState({ isLoading: false, error: err.message });
        return throwError(() => err);
      }),
    );
  }

  @Action(LoadStandardEntries)
  loadStandardEntries(ctx: StateContext<BudgetStateModel>) {
    ctx.patchState({ isLoading: true });
    return this.apiService.getStandardEntries().pipe(
      tap((standardEntries) => {
        ctx.patchState({ standardEntries, isLoading: false });
      }),
      catchError((err) => {
        ctx.patchState({ isLoading: false, error: err.message });
        return throwError(() => err);
      }),
    );
  }

  @Action(AddStandardEntry)
  addStandardEntry(ctx: StateContext<BudgetStateModel>, action: AddStandardEntry) {
    return this.apiService.createStandardEntry(action.payload).pipe(
      tap((newEntry) => {
        const state = ctx.getState();
        ctx.patchState({ standardEntries: [...state.standardEntries, newEntry] });
      }),
    );
  }

  @Action(UpdateStandardEntry)
  updateStandardEntry(ctx: StateContext<BudgetStateModel>, action: UpdateStandardEntry) {
    return this.apiService.updateStandardEntry(action.id, action.payload).pipe(
      tap((updated) => {
        const state = ctx.getState();
        const list = state.standardEntries.map((item) =>
          item.name === action.id ? updated : item,
        );
        ctx.patchState({ standardEntries: list });
      }),
    );
  }

  @Action(DeleteStandardEntry)
  deleteStandardEntry(ctx: StateContext<BudgetStateModel>, action: DeleteStandardEntry) {
    return this.apiService.deleteStandardEntry(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({
          standardEntries: state.standardEntries.filter((e) => e.name !== action.id),
        });
      }),
    );
  }

  @Action(ResetBudgetToStandard)
  resetBudget(ctx: StateContext<BudgetStateModel>, action: ResetBudgetToStandard) {
    const state = ctx.getState();
    const budget = state.budgets.find((b) => b.weekId === action.weekId);

    if (!budget) {
      return throwError(() => new Error('Budget not found'));
    }

    // Keep only manual entries
    const manualEntries = budget.entries.filter((entry) => !entry.isStandard);

    // Parse weekId to get dates
    const [yearStr, weekStr] = action.weekId.split('-W');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    const weekStart = this.calculationService.getDateFromWeek(year, week);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Generate new standard entries for this week
    const standardEntries = state.standardEntries;
    const newStandardEntries = standardEntries
      .filter((std) => this.calculationService.shouldApplyToWeek(std, weekStart, weekEnd))
      .map((std) => ({
        id: crypto.randomUUID(),
        name: std.name,
        amount: std.amount,
        type: std.type,
        isStandard: true,
      }));

    // Merge entries
    const mergedEntries = [...manualEntries, ...newStandardEntries];

    // Recalculate totals
    const { totalIncome, totalExpenses, weekTotal } =
      this.calculationService.calculateTotals(mergedEntries);

    // Update via API
    return this.apiService
      .updateBudget(action.weekId, {
        entries: mergedEntries,
        totalIncome,
        totalExpenses,
        weekTotal,
      })
      .pipe(
        tap((updatedBudget) => {
          const budgets = state.budgets.map((b) =>
            b.weekId === action.weekId ? updatedBudget : b,
          );
          this.calculationService.recalculateRunningSavingsAndPast(budgets);
          ctx.patchState({ budgets });
        }),
      );
  }

  @Action(AddNextBudget)
  addNextBudget(ctx: StateContext<BudgetStateModel>) {
    const state = ctx.getState();

    // Find latest budget date
    let maxStoredDate: Date | null = null;
    state.budgets.forEach((b) => {
      const d = new Date(b.startDate);
      if (!maxStoredDate || d > maxStoredDate) {
        maxStoredDate = d;
      }
    });

    // Calculate next week start
    let nextStart: Date;
    if (maxStoredDate) {
      nextStart = new Date(maxStoredDate);
      nextStart.setDate(nextStart.getDate() + 7);
    } else {
      // Start of current week if nothing exists
      nextStart = this.calculationService.getMondayOfWeek(new Date());
    }

    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + 6);
    nextEnd.setHours(23, 59, 59, 999);

    // Generate budget using calculation service
    const newBudget = this.calculationService.generateBudgetForWeek(
      nextStart,
      nextEnd,
      state.standardEntries,
    );

    // Create via API
    return this.apiService.createBudget(newBudget).pipe(
      tap((createdBudget) => {
        const budgets = [...state.budgets, createdBudget];
        this.calculationService.recalculateRunningSavingsAndPast(budgets);
        ctx.patchState({ budgets });
      }),
    );
  }

  @Action(UpdateBudgetEntry)
  updateBudgetEntry(ctx: StateContext<BudgetStateModel>, action: UpdateBudgetEntry) {
    const state = ctx.getState();
    const budget = state.budgets.find((b) => b.weekId === action.weekId);

    if (!budget) {
      return throwError(() => new Error('Budget not found'));
    }

    const entryIndex = budget.entries.findIndex((e) => e.id === action.entryId);
    let updatedEntries: BudgetEntry[];

    if (entryIndex === -1) {
      // Entry doesn't exist - add new entry
      const newEntry: BudgetEntry = {
        id: action.entryId,
        name: action.payload.name || '',
        amount: action.payload.amount || 0,
        type: action.payload.type || 'Expense',
        isStandard: action.payload.isStandard ?? false,
      };
      updatedEntries = [...budget.entries, newEntry];
    } else {
      // Entry exists - update it
      updatedEntries = [...budget.entries];
      updatedEntries[entryIndex] = { ...updatedEntries[entryIndex], ...action.payload };
    }

    // Recalculate totals
    const { totalIncome, totalExpenses, weekTotal } =
      this.calculationService.calculateTotals(updatedEntries);

    // Update via API
    return this.apiService
      .updateBudget(action.weekId, {
        entries: updatedEntries,
        totalIncome,
        totalExpenses,
        weekTotal,
      })
      .pipe(
        tap((updatedBudget) => {
          const budgets = state.budgets.map((b) =>
            b.weekId === action.weekId ? updatedBudget : b,
          );
          this.calculationService.recalculateRunningSavingsAndPast(budgets);
          ctx.patchState({ budgets });
        }),
      );
  }
}
