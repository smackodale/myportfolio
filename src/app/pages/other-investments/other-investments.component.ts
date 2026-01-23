import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-other-investments',
  imports: [CommonModule],
  templateUrl: './other-investments.component.html',
  styleUrl: './other-investments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherInvestmentsComponent {}
