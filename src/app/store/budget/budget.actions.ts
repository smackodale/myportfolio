import { BudgetEntry, StandardEntry } from '../../models/budget.model';

export class LoadBudgets {
  static readonly type = '[Budget] Load Budgets';
  constructor(public showPast: boolean = false) {}
}

export class LoadStandardEntries {
  static readonly type = '[Budget] Load Standard Entries';
}

export class AddStandardEntry {
  static readonly type = '[Budget] Add Standard Entry';
  constructor(public payload: Omit<StandardEntry, 'id'>) {}
}

export class UpdateStandardEntry {
  static readonly type = '[Budget] Update Standard Entry';
  constructor(
    public id: string,
    public payload: Partial<StandardEntry>,
  ) {}
}

export class DeleteStandardEntry {
  static readonly type = '[Budget] Delete Standard Entry';
  constructor(public id: string) {}
}

export class UpdateBudgetEntry {
  static readonly type = '[Budget] Update Budget Entry';
  constructor(
    public weekId: string,
    public entryId: string,
    public payload: Partial<BudgetEntry>,
  ) {}
}

export class AddBudgetEntry {
  static readonly type = '[Budget] Add Budget Entry';
  constructor(
    public weekId: string,
    public payload: Omit<BudgetEntry, 'id'>,
  ) {}
}

export class DeleteBudgetEntry {
  static readonly type = '[Budget] Delete Budget Entry';
  constructor(
    public weekId: string,
    public entryId: string,
  ) {}
}

export class ResetBudgetToStandard {
  static readonly type = '[Budget] Reset Budget To Standard';
  constructor(public weekId: string) {}
}

export class TogglePastBudgets {
  static readonly type = '[Budget] Toggle Past Budgets';
  constructor(public showPast: boolean) {}
}

export class AddNextBudget {
  static readonly type = '[Budget] Add Next Budget';
}
