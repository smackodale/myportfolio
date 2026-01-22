import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-superannuation',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <h1>Superannuation</h1>
      <p>Track your retirement savings.</p>
    </div>
  `,
    styles: [`
    .page-content { padding: 20px; }
  `]
})
export class SuperannuationComponent { }
