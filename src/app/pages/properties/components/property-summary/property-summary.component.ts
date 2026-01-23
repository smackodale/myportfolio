import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { PropertySummary } from '../../../../models/property.model';

@Component({
  selector: 'app-property-summary',
  imports: [CommonModule, NzCardModule, NzGridModule, NzStatisticModule, NzDividerModule],
  templateUrl: './property-summary.component.html',
  styleUrl: './property-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertySummaryComponent {
  readonly actualSummary = input<PropertySummary | undefined>();
  readonly plannedSummary = input<PropertySummary | undefined>();
}
