import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BudgetState } from '../../../../store/budget/budget.state';
import {
  LoadBudgets,
  TogglePastBudgets,
  ResetBudgetToStandard,
  AddNextBudget,
} from '../../../../store/budget/budget.actions';
import { Budget } from '../../../../models/budget.model';
import { BudgetCardComponent } from '../budget-card/budget-card.component';

@Component({
  selector: 'app-budget-view',

  imports: [
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzSpinModule,
    NzSwitchModule,
    FormsModule,
    RouterModule,
    BudgetCardComponent,
  ],
  templateUrl: './budget-view.component.html',
  styleUrl: './budget-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetViewComponent implements OnInit {
  private readonly store = inject(Store);

  readonly budgets = toSignal(this.store.select(BudgetState.budgets), {
    initialValue: [] as Budget[],
  });
  readonly isLoading = toSignal(this.store.select(BudgetState.isLoading), { initialValue: false });
  readonly showPast = toSignal(
    this.store.select(BudgetState.currentSettings).pipe(map((x) => x.showPast)),
    { initialValue: false },
  );

  ngOnInit() {
    this.store.dispatch(new LoadBudgets(false));
  }

  onShowPastChange(show: boolean) {
    this.store.dispatch(new TogglePastBudgets(show));
    this.store.dispatch(new LoadBudgets(show));
  }

  onResetBudget(weekId: string) {
    this.store.dispatch(new ResetBudgetToStandard(weekId));
  }

  onAddNextBudget() {
    this.store.dispatch(new AddNextBudget());
  }
}
