import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  CreatePropertyDto,
  Property,
  LoanType,
  Mortgage,
  PropertyType,
  UpdatePropertyDto,
} from '../../../../models/property.model';
import { PropertyCalculationsService } from '../../../../services/property-calculations.service';

@Component({
  selector: 'app-property-form',
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
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly calculations = inject(PropertyCalculationsService);

  readonly property = input<Property | undefined>();
  readonly formSubmit = output<CreatePropertyDto | UpdatePropertyDto>({ alias: 'submit' });
  readonly formCancel = output<void>({ alias: 'cancel' });

  propertyForm!: FormGroup;
  readonly isEditMode = signal(false);

  readonly PropertyType = PropertyType;
  readonly LoanType = LoanType;

  readonly calculatedEquity = signal<number | null>(null);
  readonly calculatedAccessibleEquity = signal<number | null>(null);

  // Aggregate display values
  readonly totalOriginalLoan = signal(0);
  readonly totalOutstandingRequest = signal(0);
  readonly totalRepayment = signal(0);

  currencyFormatter = (value: number | string): string =>
    value !== null && value !== undefined
      ? `$ ${Math.round(Number(value))}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : '';
  currencyParser = (value: string): number => Math.round(Number(value.replace(/\$\s?|(,*)/g, '')));

  ngOnInit(): void {
    const prop = this.property();
    this.isEditMode.set(!!prop);
    this.initForm(prop);
    this.subscribeToValueChanges();
    // Initial calculation
    this.calculateTotals();
  }

  get mortgages(): FormArray {
    return this.propertyForm.get('mortgages') as FormArray;
  }

  private initForm(property?: Property | null): void {
    this.propertyForm = this.fb.group({
      name: [property?.name || '', Validators.required],
      imageUrl: [property?.imageUrl || ''],
      address: [property?.address || '', Validators.required],
      propertyValue: [property?.propertyValue || 0, [Validators.required, Validators.min(0)]],
      propertyType: [property?.propertyType || PropertyType.Actual, Validators.required],
      mortgages: this.fb.array([]),
    });

    if (property?.mortgages) {
      property.mortgages.forEach((m) => this.addMortgage(m));
    } else if (!this.isEditMode()) {
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
    const outstandingBalance = group.get('outstandingBalance')?.value || 0;
    const interestRate = group.get('interestRate')?.value || 0;
    const loanType = group.get('loanType')?.value;

    if (originalAmount && loanType) {
      const repayment = this.calculations.calculateMortgageRepayment(
        originalAmount,
        outstandingBalance,
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
    this.totalOriginalLoan.set(mortgages.reduce((sum, m) => sum + (m.originalAmount || 0), 0));
    const totalOutstanding = this.calculations.calculateTotalOutstandingBalance(mortgages);
    this.totalOutstandingRequest.set(totalOutstanding);

    // For repayment, we need to sum up what's in the form
    this.totalRepayment.set(
      this.mortgages.controls.reduce((sum, control) => {
        return sum + (control.get('repaymentAmount')?.value || 0);
      }, 0),
    );

    this.calculatedEquity.set(this.calculations.calculateEquity(propertyValue, totalOutstanding));
    this.calculatedAccessibleEquity.set(
      this.calculations.calculateAccessibleEquity(propertyValue, totalOutstanding),
    );
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      const formValue = this.propertyForm.getRawValue(); // use getRawValue to include disabled repayment fields
      this.formSubmit.emit(formValue);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
