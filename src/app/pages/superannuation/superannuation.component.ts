import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-superannuation',
  imports: [CommonModule],
  templateUrl: './superannuation.component.html',
  styleUrl: './superannuation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperannuationComponent {}
