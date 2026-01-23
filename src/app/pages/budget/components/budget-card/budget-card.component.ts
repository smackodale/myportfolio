import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Budget } from '../../../../models/budget.model';

@Component({
  selector: 'app-budget-card',

  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule],
  templateUrl: './budget-card.component.html',
  styleUrl: './budget-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetCardComponent {
  readonly budget = input.required<Budget>();
  readonly reset = output<string>();

  onReset() {
    this.reset.emit(this.budget().weekId);
  }
}
