import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Budget, StandardEntry } from '../../models/budget.model';
import {
  LoadBudgets,
  LoadStandardEntries,
  AddStandardEntry,
  UpdateStandardEntry,
  DeleteStandardEntry,
  ResetBudgetToStandard,
  TogglePastBudgets,
  UpdateBudgetEntry,
  AddNextBudget,
} from './budget.actions';
import { BudgetApiService } from '../../services/budget-api.service';

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
  private budgetService = inject(BudgetApiService);

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
    const state = ctx.getState();
    ctx.patchState({ isLoading: true, error: null, showPast: action.showPast }); // sync toggle

    // Calculate Start Date
    const today = new Date();
    // If showing past, maybe go back 4 weeks?
    // If not showing past, start from current week (Monday)
    let startDate = new Date();
    if (action.showPast) {
      startDate.setDate(today.getDate() - 28); // 4 weeks ago
    } else {
      // Start of current week? Or today?
      // Service logic handles alignment to Monday, so passing today is fine.
      startDate = today;
    }

    // Calculate End Date
    // "View at least 6 weeks in advance"
    // Let's fetch 12 weeks to be safe and allow scrolling
    // const endDate = new Date(startDate);
    // endDate.setDate(startDate.getDate() + 12 * 7);

    return this.budgetService.getBudgets(startDate).pipe(
      tap((budgets) => {
        this.recalculateRunningSavingsAndPast(budgets);
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
    return this.budgetService.getStandardEntries().pipe(
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
    return this.budgetService.addStandardEntry(action.payload).pipe(
      tap((newEntry) => {
        const state = ctx.getState();
        ctx.patchState({ standardEntries: [...state.standardEntries, newEntry] });
      }),
    );
  }

  @Action(UpdateStandardEntry)
  updateStandardEntry(ctx: StateContext<BudgetStateModel>, action: UpdateStandardEntry) {
    return this.budgetService.updateStandardEntry(action.id, action.payload).pipe(
      tap((updated) => {
        const state = ctx.getState();
        const list = state.standardEntries.map((item) => (item.id === action.id ? updated : item));
        ctx.patchState({ standardEntries: list });
      }),
    );
  }

  @Action(DeleteStandardEntry)
  deleteStandardEntry(ctx: StateContext<BudgetStateModel>, action: DeleteStandardEntry) {
    return this.budgetService.deleteStandardEntry(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({
          standardEntries: state.standardEntries.filter((e) => e.id !== action.id),
        });
      }),
    );
  }

  @Action(ResetBudgetToStandard)
  resetBudget(ctx: StateContext<BudgetStateModel>, action: ResetBudgetToStandard) {
    return this.budgetService.resetBudget(action.weekId).pipe(
      tap((newBudget) => {
        const state = ctx.getState();
        const budgets = state.budgets.map((b) => (b.weekId === action.weekId ? newBudget : b));

        this.recalculateRunningSavingsAndPast(budgets);

        ctx.patchState({ budgets });
      }),
    );
  }

  @Action(AddNextBudget)
  addNextBudget(ctx: StateContext<BudgetStateModel>) {
    return this.budgetService.addNextBudget().pipe(
      tap((newBudget) => {
        const state = ctx.getState();
        const budgets = [...state.budgets, newBudget];

        this.recalculateRunningSavingsAndPast(budgets);

        ctx.patchState({ budgets });
      }),
    );
  }

  @Action(UpdateBudgetEntry)
  updateBudgetEntry(ctx: StateContext<BudgetStateModel>, action: UpdateBudgetEntry) {
    const state = ctx.getState();
    const budgetIndex = state.budgets.findIndex((b) => b.weekId === action.weekId);
    if (budgetIndex > -1) {
      const budget = { ...state.budgets[budgetIndex] };
      const entryIndex = budget.entries.findIndex((e) => e.id === action.entryId);
      if (entryIndex > -1) {
        const updatedEntry = { ...budget.entries[entryIndex], ...action.payload };
        const newEntries = [...budget.entries];
        newEntries[entryIndex] = updatedEntry;

        const totalIncome = newEntries
          .filter((e) => e.type === 'Income')
          .reduce((s, e) => s + e.amount, 0);
        const totalExpenses = newEntries
          .filter((e) => e.type === 'Expense')
          .reduce((s, e) => s + e.amount, 0);

        const newBudget = {
          ...budget,
          entries: newEntries,
          totalIncome,
          totalExpenses,
          weekTotal: totalIncome - totalExpenses,
        };

        this.budgetService.updateBudget(newBudget).subscribe();

        const newBudgets = [...state.budgets];
        newBudgets[budgetIndex] = newBudget;

        this.recalculateRunningSavingsAndPast(newBudgets);

        ctx.patchState({ budgets: newBudgets });
      }
    }
  }

  private recalculateRunningSavingsAndPast(budgets: Budget[]) {
    // We assume the budgets are sorted by date implicitly by generation
    // If not, we should sort them here:
    // budgets.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Sort just in case? Service returns generated order, so it should be fine.

    const now = new Date();

    budgets
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .reduce((running, b) => {
        // calc/update isPast
        const end = new Date(b.endDate);
        b.isPast = end < now;

        if (b.isPast) {
          b.runningSavings = 0;
        } else {
          b.runningSavings = running + b.weekTotal;
        }

        return b.runningSavings;
      }, 0);
  }
}
