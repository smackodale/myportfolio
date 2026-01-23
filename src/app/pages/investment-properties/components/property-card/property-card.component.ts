import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  InvestmentProperty,
  LoanType,
  PropertyType,
} from '../../../../models/investment-property.model';
import { PropertyCalculationsService } from '../../../../services/property-calculations.service';

@Component({
  selector: 'app-property-card',
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzDividerModule,
    NzTooltipModule,
  ],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyCardComponent {
  private readonly calculations = inject(PropertyCalculationsService);

  readonly property = input.required<InvestmentProperty>();
  readonly edit = output<InvestmentProperty>();
  readonly delete = output<InvestmentProperty>();

  readonly PropertyType = PropertyType;
  readonly LoanType = LoanType;

  // Calculated values using computed signals
  readonly totalOutstanding = computed(() => {
    return this.calculations.calculateTotalOutstandingBalance(this.property().mortgages || []);
  });

  readonly totalRepayment = computed(() => {
    return this.calculations.calculateTotalRepayment(this.property().mortgages || []);
  });

  readonly equity = computed(() => {
    return this.calculations.calculateEquity(this.property());
  });

  readonly accessibleEquity = computed(() => {
    return this.calculations.calculateAccessibleEquity(this.property());
  });

  onEdit(): void {
    this.edit.emit(this.property());
  }

  onDelete(): void {
    this.delete.emit(this.property());
  }
}
