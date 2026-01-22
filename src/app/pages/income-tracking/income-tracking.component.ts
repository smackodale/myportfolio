import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-income-tracking',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <h1>Income Tracking</h1>
      <p>Monitor your income sources.</p>
    </div>
  `,
    styles: [`
    .page-content { padding: 20px; }
  `]
})
export class IncomeTrackingComponent { }
