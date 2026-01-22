import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-other-investments',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <h1>Other Investments</h1>
      <p>Stocks, Bonds, and other assets.</p>
    </div>
  `,
    styles: [`
    .page-content { padding: 20px; }
  `]
})
export class OtherInvestmentsComponent { }
