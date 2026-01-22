import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <h1>Dashboard</h1>
      <p>Welcome to My Portfolio</p>
    </div>
  `,
    styles: [`
    .page-content { padding: 20px; }
  `]
})
export class DashboardComponent { }
