import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1>Budget</h1>
      <p>Monitor your income sources.</p>
    </div>
  `,
  styles: [
    `
      .page-content {
        padding: 20px;
      }
    `,
  ],
})
export class BudgetComponent {}
