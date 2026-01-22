import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzDividerModule,
    NzTooltipModule,
  ],
  template: `
    <nz-card
      [nzCover]="coverTemplate"
      [nzActions]="[actionEdit, actionDelete]"
      [class.planned-property]="property.propertyType === PropertyType.Planned"
      class="property-card"
    >
      <nz-card-meta [nzTitle]="property.name" [nzDescription]="property.address"> </nz-card-meta>

      <div class="property-badge">
        <nz-tag [nzColor]="property.propertyType === PropertyType.Actual ? 'blue' : 'default'">
          {{ property.propertyType }}
        </nz-tag>
      </div>

      <div class="property-details">
        <div class="detail-row">
          <span class="label">Property Value:</span>
          <span class="value">{{
            property.propertyValue | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
          }}</span>
        </div>

        <div class="detail-row">
          <span class="label">Total Loan:</span>
          <span class="value">{{
            totalOutstanding | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
          }}</span>
        </div>

        <div class="detail-row">
          <span class="label">Total Repayment:</span>
          <span class="value"
            >{{ totalRepayment | currency: 'AUD' : 'symbol-narrow' : '1.0-0' }}/mo</span
          >
        </div>

        <div class="mortgages-section" *ngIf="property.mortgages.length">
          <nz-divider
            nzText="Mortgages"
            nzOrientation="left"
            style="margin: 12px 0 8px"
          ></nz-divider>
          <div *ngFor="let mortgage of property.mortgages" class="mortgage-row">
            <span class="mortgage-info">
              <span nz-tooltip [nzTooltipTitle]="mortgage.loanType">{{
                mortgage.loanType === LoanType.InterestOnly ? 'IO' : 'P&I'
              }}</span>
              @ {{ mortgage.interestRate }}%
            </span>
            <span class="mortgage-value">
              {{ mortgage.outstandingBalance | currency: 'AUD' : 'symbol-narrow' : '1.0-0' }}
            </span>
          </div>
        </div>
        <div *ngIf="!property.mortgages.length" class="no-mortgages">
          <span class="label">No mortgages recorded</span>
        </div>

        <div class="detail-row highlight" style="margin-top: 12px;">
          <span class="label">Equity:</span>
          <span class="value">{{ equity | currency: 'AUD' : 'symbol-narrow' : '1.0-0' }}</span>
        </div>
        <div class="detail-row highlight">
          <span class="label">Accessible Equity:</span>
          <span class="value">{{
            accessibleEquity | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
          }}</span>
        </div>
      </div>
    </nz-card>

    <ng-template #coverTemplate>
      @if (property.imageUrl) {
        <img [src]="property.imageUrl" [alt]="property.name" class="property-image" />
      } @else {
        <div class="property-image-placeholder">
          <span nz-icon nzType="home" nzTheme="outline"></span>
        </div>
      }
    </ng-template>

    <ng-template #actionEdit>
      <span nz-icon nzType="edit" (click)="onEdit()"></span>
    </ng-template>

    <ng-template #actionDelete>
      <span nz-icon nzType="delete" (click)="onDelete()"></span>
    </ng-template>
  `,
  styles: [
    `
      .property-card {
        height: 100%;
        transition: all 0.3s;
      }

      .planned-property {
        background: #fafafa;
        border: 1px dashed #d9d9d9;
      }

      .property-image {
        height: 200px;
        object-fit: cover;
        width: 100%;
      }

      .property-image-placeholder {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        font-size: 48px;
        color: #bfbfbf;
      }

      .property-badge {
        margin-top: 12px;
      }

      .property-details {
        margin-top: 16px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .detail-row.highlight {
        background: #f0f7ff;
        padding: 8px 12px;
        margin: 4px -12px;
        font-weight: 500;
      }

      .detail-row .label {
        color: #595959;
        font-size: 13px;
      }

      .detail-row .value {
        color: #262626;
        font-weight: 500;
      }

      .mortgages-section {
        margin-bottom: 8px;
      }

      .mortgage-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 12px;
        color: #8c8c8c;
      }

      .mortgage-value {
        color: #595959;
      }

      .no-mortgages {
        padding: 8px 0;
        font-style: italic;
        color: #bfbfbf;
        font-size: 12px;
      }

      :host ::ng-deep .ant-card-actions > li {
        margin: 12px 0;
      }

      :host ::ng-deep .ant-card-actions > li > span {
        cursor: pointer;
        font-size: 18px;
        transition: color 0.3s;
      }

      :host ::ng-deep .ant-card-actions > li:first-child > span:hover {
        color: #1890ff;
      }

      :host ::ng-deep .ant-card-actions > li:last-child > span:hover {
        color: #ff4d4f;
      }
    `,
  ],
})
export class PropertyCardComponent implements OnChanges {
  @Input() property!: InvestmentProperty;
  @Output() edit = new EventEmitter<InvestmentProperty>();
  @Output() delete = new EventEmitter<InvestmentProperty>();

  PropertyType = PropertyType;
  LoanType = LoanType;

  // Calculated values
  equity = 0;
  accessibleEquity = 0;
  totalOutstanding = 0;
  totalRepayment = 0;

  constructor(private calculations: PropertyCalculationsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.calculateValues();
    }
  }

  private calculateValues(): void {
    const mortgages = this.property.mortgages || [];
    this.totalOutstanding = this.calculations.calculateTotalOutstandingBalance(mortgages);
    this.totalRepayment = this.calculations.calculateTotalRepayment(mortgages);

    this.equity = this.calculations.calculateEquity(this.property);
    this.accessibleEquity = this.calculations.calculateAccessibleEquity(this.property);
  }

  onEdit(): void {
    this.edit.emit(this.property);
  }

  onDelete(): void {
    this.delete.emit(this.property);
  }
}
