import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-budget',
  imports: [CommonModule],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetComponent {}
