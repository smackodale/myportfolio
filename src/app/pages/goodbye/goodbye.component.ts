import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-goodbye',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1>Goodbye</h1>
      <p>Thanks for stopping bye!</p>
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
export class GoodbyeComponent {}
