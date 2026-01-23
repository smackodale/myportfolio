import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income-tracking',
  imports: [CommonModule],
  templateUrl: './income-tracking.component.html',
  styleUrl: './income-tracking.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeTrackingComponent {}
