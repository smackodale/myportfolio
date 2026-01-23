import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-goodbye',
  imports: [CommonModule],
  templateUrl: './goodbye.component.html',
  styleUrl: './goodbye.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodbyeComponent {}
