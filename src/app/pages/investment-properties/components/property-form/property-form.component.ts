import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import {
  CreatePropertyDto,
  InvestmentProperty,
  LoanType,
  Mortgage,
  PropertyType,
  UpdatePropertyDto,
} from '../../../../models/investment-property.model';
import { PropertyCalculationsService } from '../../../../services/property-calculations.service';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzInputNumberModule,
    NzGridModule,
    NzIconModule,
    NzCardModule,
    NzDividerModule,
    NzEmptyModule,
  ],
  template: `
    <form nz-form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="property-form">
      <div class="form-body">
        <nz-card nzTitle="Property Details">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Property Name</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Please enter property name">
              <input nz-input formControlName="name" placeholder="e.g., 123 Main Street" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24">Property Image URL</nz-form-label>
            <nz-form-control [nzSpan]="24">
              <input
                nz-input
                formControlName="imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Address</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Please enter address">
              <textarea
                nz-input
                formControlName="address"
                [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                placeholder="123 Main Street, Suburb, State, Postcode"
              ></textarea>
            </nz-form-control>
          </nz-form-item>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24" nzRequired>Property Value (AUD)</nz-form-label>
                <nz-form-control [nzSpan]="24" nzErrorTip="Please enter property value">
                  <nz-input-number
                    formControlName="propertyValue"
                    [nzMin]="0"
                    [nzStep]="1000"
                    [nzFormatter]="currencyFormatter"
                    [nzParser]="currencyParser"
                    style="width: 100%"
                  ></nz-input-number>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24" nzRequired>Property Type</nz-form-label>
                <nz-form-control [nzSpan]="24" nzErrorTip="Please select property type">
                  <nz-select formControlName="propertyType" nzPlaceHolder="Select property type">
                    <nz-option
                      [nzValue]="PropertyType.Actual"
                      [nzLabel]="PropertyType.Actual"
                    ></nz-option>
                    <nz-option
                      [nzValue]="PropertyType.Planned"
                      [nzLabel]="PropertyType.Planned"
                    ></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </nz-card>

        <nz-card nzTitle="Mortgages" [nzExtra]="addMortgageTemplate" style="margin-top: 16px;">
          <ng-container formArrayName="mortgages">
            <div
              *ngFor="let mortgage of mortgages.controls; let i = index"
              [formGroupName]="i"
              class="mortgage-item"
            >
              <div class="mortgage-header">
                <span class="mortgage-title">Mortgage #{{ i + 1 }}</span>
                <button nz-button nzType="text" nzDanger (click)="removeMortgage(i)" type="button">
                  <span nz-icon nzType="delete"></span>
                </button>
              </div>

              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="24" nzRequired>Original Loan Amount</nz-form-label>
                    <nz-form-control [nzSpan]="24" nzErrorTip="Required">
                      <nz-input-number
                        formControlName="originalAmount"
                        [nzMin]="0"
                        [nzStep]="1000"
                        [nzFormatter]="currencyFormatter"
                        [nzParser]="currencyParser"
                        style="width: 100%"
                      ></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="24" nzRequired>Outstanding Balance</nz-form-label>
                    <nz-form-control [nzSpan]="24" nzErrorTip="Required">
                      <nz-input-number
                        formControlName="outstandingBalance"
                        [nzMin]="0"
                        [nzStep]="1000"
                        [nzFormatter]="currencyFormatter"
                        [nzParser]="currencyParser"
                        style="width: 100%"
                      ></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="24" nzRequired>Interest Rate (%)</nz-form-label>
                    <nz-form-control [nzSpan]="24" nzErrorTip="Required">
                      <nz-input-number
                        formControlName="interestRate"
                        [nzMin]="0"
                        [nzMax]="100"
                        [nzStep]="0.1"
                        [nzPrecision]="2"
                        style="width: 100%"
                      ></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col [nzSpan]="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="24" nzRequired>Loan Type</nz-form-label>
                    <nz-form-control [nzSpan]="24" nzErrorTip="Required">
                      <nz-select formControlName="loanType">
                        <nz-option
                          [nzValue]="LoanType.PrincipalAndInterest"
                          [nzLabel]="LoanType.PrincipalAndInterest"
                        ></nz-option>
                        <nz-option
                          [nzValue]="LoanType.InterestOnly"
                          [nzLabel]="LoanType.InterestOnly"
                        ></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col [nzSpan]="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="24">Repayment</nz-form-label>
                    <nz-form-control [nzSpan]="24">
                      <nz-input-number
                        formControlName="repaymentAmount"
                        [nzFormatter]="currencyFormatter"
                        [nzParser]="currencyParser"
                        [nzDisabled]="true"
                        style="width: 100%"
                      ></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>
              <nz-divider *ngIf="i < mortgages.controls.length - 1"></nz-divider>
            </div>

            <div *ngIf="mortgages.controls.length === 0" class="empty-mortgages">
              <nz-empty nzNotFoundContent="No mortgages added"></nz-empty>
            </div>
          </ng-container>
        </nz-card>

        <ng-template #addMortgageTemplate>
          <button nz-button nzType="primary" nzSize="small" (click)="addMortgage()" type="button">
            <span nz-icon nzType="plus"></span> Add Mortgage
          </button>
        </ng-template>

        @if (calculatedEquity !== null) {
          <div class="calculated-values">
            <div nz-row [nzGutter]="16">
              <div nz-col [nzSpan]="12">
                <div class="calculated-row">
                  <span class="label">Total Original Loan:</span>
                  <span class="value">{{
                    totalOriginalLoan | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
                  }}</span>
                </div>
                <div class="calculated-row">
                  <span class="label">Total Outstanding:</span>
                  <span class="value">{{
                    totalOutstandingRequest | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
                  }}</span>
                </div>
                <div class="calculated-row">
                  <span class="label">Total Repayment:</span>
                  <span class="value">{{
                    totalRepayment | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
                  }}</span>
                </div>
              </div>
              <div nz-col [nzSpan]="12">
                <div class="calculated-row">
                  <span class="label">Calculated Equity:</span>
                  <span class="value">{{
                    calculatedEquity | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
                  }}</span>
                </div>
                <div class="calculated-row">
                  <span class="label">Calculated Accessible Equity:</span>
                  <span class="value">{{
                    calculatedAccessibleEquity | currency: 'AUD' : 'symbol-narrow' : '1.0-0'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="form-footer">
        <nz-form-item>
          <nz-form-control>
            <button nz-button nzType="primary" [disabled]="!propertyForm.valid" type="submit">
              {{ isEditMode ? 'Update Property' : 'Add Property' }}
            </button>
            <button nz-button type="button" (click)="onCancel()" style="margin-left: 8px">
              Cancel
            </button>
          </nz-form-control>
        </nz-form-item>
      </div>
    </form>
  `,
  styles: [
    `
      .form-body {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 8px;
        margin-bottom: 16px;
      }

      .form-footer {
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
      }

      .calculated-values {
        background: #e6f7ff;
        padding: 16px;
        margin-top: 16px;
        border-radius: 4px;
        border: 1px solid #91d5ff;
      }

      .calculated-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
      }

      .calculated-row .label {
        font-weight: 500;
        color: #0050b3;
      }

      .calculated-row .value {
        font-weight: 600;
        color: #003a8c;
        font-size: 16px;
      }

      .mortgage-item {
        background: #fafafa;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #f0f0f0;
      }

      .mortgage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        border-bottom: 1px solid #e8e8e8;
        padding-bottom: 8px;
      }

      .mortgage-title {
        font-weight: 600;
        color: #595959;
      }

      .empty-mortgages {
        padding: 24px;
        background: #fafafa;
        border-radius: 4px;
      }
    `,
  ],
})
export class PropertyFormComponent implements OnInit {
  @Input() property?: InvestmentProperty;
  @Output() submit = new EventEmitter<CreatePropertyDto | UpdatePropertyDto>();
  @Output() cancel = new EventEmitter<void>();

  propertyForm!: FormGroup;
  isEditMode = false;

  PropertyType = PropertyType;
  LoanType = LoanType;

  calculatedEquity: number | null = null;
  calculatedAccessibleEquity: number | null = null;

  // Aggregate display values
  totalOriginalLoan = 0;
  totalOutstandingRequest = 0;
  totalRepayment = 0;

  currencyFormatter = (value: number): string => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  currencyParser = (value: string): number => Number(value.replace(/\$\s?|(,*)/g, ''));

  constructor(
    private fb: FormBuilder,
    private calculations: PropertyCalculationsService,
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.property;
    this.initForm();
    this.subscribeToValueChanges();
    // Initial calculation
    this.calculateTotals();
  }

  get mortgages(): FormArray {
    return this.propertyForm.get('mortgages') as FormArray;
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      name: [this.property?.name || '', Validators.required],
      imageUrl: [this.property?.imageUrl || ''],
      address: [this.property?.address || '', Validators.required],
      propertyValue: [this.property?.propertyValue || 0, [Validators.required, Validators.min(0)]],
      propertyType: [this.property?.propertyType || PropertyType.Actual, Validators.required],
      mortgages: this.fb.array([]),
    });

    if (this.property?.mortgages) {
      this.property.mortgages.forEach((m) => this.addMortgage(m));
    } else if (!this.isEditMode) {
      // Add one empty mortgage by default for new properties
      this.addMortgage();
    }
  }

  addMortgage(mortgage?: Mortgage): void {
    const mortgageGroup = this.fb.group({
      originalAmount: [mortgage?.originalAmount || 0, [Validators.required, Validators.min(0)]],
      outstandingBalance: [
        mortgage?.outstandingBalance || 0,
        [Validators.required, Validators.min(0)],
      ],
      interestRate: [mortgage?.interestRate || 0, [Validators.required, Validators.min(0)]],
      loanType: [mortgage?.loanType || LoanType.PrincipalAndInterest, Validators.required],
      repaymentAmount: [{ value: mortgage?.repaymentAmount || 0, disabled: true }],
    });

    // Subscribe to changes within this mortgage group
    this.subscribeToMortgageChanges(mortgageGroup);

    this.mortgages.push(mortgageGroup);
    this.calculateTotals();
  }

  removeMortgage(index: number): void {
    this.mortgages.removeAt(index);
    this.calculateTotals();
  }

  private subscribeToValueChanges(): void {
    // Recalculate equity when property value changes
    this.propertyForm.get('propertyValue')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  private subscribeToMortgageChanges(group: FormGroup): void {
    const triggers = ['originalAmount', 'interestRate', 'loanType'];
    triggers.forEach((key) => {
      group.get(key)?.valueChanges.subscribe(() => {
        this.calculateMortgageRepayment(group);
        this.calculateTotals();
      });
    });

    group.get('outstandingBalance')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  private calculateMortgageRepayment(group: FormGroup): void {
    const originalAmount = group.get('originalAmount')?.value || 0;
    const interestRate = group.get('interestRate')?.value || 0;
    const loanType = group.get('loanType')?.value;

    if (originalAmount && loanType) {
      const repayment = this.calculations.calculateMortgageRepayment(
        originalAmount,
        interestRate,
        loanType,
      );
      group.patchValue({ repaymentAmount: repayment }, { emitEvent: false });
    } else {
      group.patchValue({ repaymentAmount: 0 }, { emitEvent: false });
    }
  }

  private calculateTotals(): void {
    const propertyValue = this.propertyForm.get('propertyValue')?.value || 0;
    const mortgages = this.propertyForm.value.mortgages as Mortgage[];

    // Calculate aggregates
    this.totalOriginalLoan = mortgages.reduce((sum, m) => sum + (m.originalAmount || 0), 0);
    this.totalOutstandingRequest = this.calculations.calculateTotalOutstandingBalance(mortgages);

    // For repayment, we need to sum up what's in the form, as the raw value might not include disabled fields in some contexts,
    // but here we are accessing value which should include it.
    // However, it is safer to sum the repaymentAmount from the controls directly to ensure we get the calculated value.
    this.totalRepayment = this.mortgages.controls.reduce((sum, control) => {
      return sum + (control.get('repaymentAmount')?.value || 0);
    }, 0);

    this.calculatedEquity = this.calculations.calculateEquity(
      propertyValue,
      this.totalOutstandingRequest,
    );
    this.calculatedAccessibleEquity = this.calculations.calculateAccessibleEquity(
      propertyValue,
      this.totalOutstandingRequest,
    );
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      const formValue = this.propertyForm.getRawValue(); // use getRawValue to include disabled repayment fields
      this.submit.emit(formValue);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
