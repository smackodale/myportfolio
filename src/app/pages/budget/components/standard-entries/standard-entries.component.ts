import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { RouterModule } from '@angular/router';
import {
  LoadStandardEntries,
  AddStandardEntry,
  UpdateStandardEntry,
  DeleteStandardEntry,
} from '../../../../store/budget/budget.actions';
import { BudgetState } from '../../../../store/budget/budget.state';
import { EntryType, Frequency, StandardEntry } from '../../../../models/budget.model';

@Component({
  selector: 'app-standard-entries',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzIconModule,
    NzPopconfirmModule,
    NzDividerModule,
    RouterModule,
  ],
  templateUrl: './standard-entries.component.html',
  styleUrl: './standard-entries.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandardEntriesComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly modalService = inject(NzModalService);
  private readonly fb = inject(FormBuilder);

  readonly entries = toSignal(this.store.select(BudgetState.standardEntries), {
    initialValue: [] as StandardEntry[],
  });
  readonly isLoading = toSignal(this.store.select(BudgetState.isLoading), { initialValue: false });

  readonly entryTypes: EntryType[] = ['Income', 'Expense'];
  readonly frequencies = Object.values(Frequency);

  entryForm!: FormGroup;
  isModalVisible = signal(false);
  isEditMode = signal(false);
  currentEntryId: string | null = null;

  // Helpers for NextOccurrence visibility
  readonly showNextOccurrence = signal(true);

  constructor() {
    this.entryForm = this.fb.group({
      name: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['Expense', [Validators.required]],
      frequency: [Frequency.Monthly, [Validators.required]],
      nextOccurrence: [null],
    });

    // Watch frequency changes to toggle validation/visibility of NextOccurrence
    this.entryForm.get('frequency')?.valueChanges.subscribe((val) => {
      if (val === Frequency.Weekly) {
        this.entryForm.get('nextOccurrence')?.clearValidators();
        this.entryForm.get('nextOccurrence')?.setValue(null);
        this.showNextOccurrence.set(false);
      } else {
        this.entryForm.get('nextOccurrence')?.setValidators(Validators.required);
        this.showNextOccurrence.set(true);
      }
      this.entryForm.get('nextOccurrence')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.store.dispatch(new LoadStandardEntries());
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.currentEntryId = null;
    this.entryForm.reset({ type: 'Expense', frequency: Frequency.Monthly, amount: 0 });
    this.isModalVisible.set(true);
  }

  openEditModal(entry: StandardEntry) {
    this.isEditMode.set(true);
    this.currentEntryId = entry.id;
    this.entryForm.patchValue({
      name: entry.name,
      amount: entry.amount,
      type: entry.type,
      frequency: entry.frequency,
      nextOccurrence: entry.nextOccurrence ? new Date(entry.nextOccurrence) : null,
    });
    this.isModalVisible.set(true);
  }

  handleCancel() {
    this.isModalVisible.set(false);
  }

  handleOk() {
    if (this.entryForm.valid) {
      const formVal = this.entryForm.value;
      const payload: Omit<StandardEntry, 'id'> = {
        name: formVal.name,
        amount: formVal.amount,
        type: formVal.type,
        frequency: formVal.frequency,
      };

      if (formVal.frequency !== Frequency.Weekly && formVal.nextOccurrence) {
        payload.nextOccurrence = formVal.nextOccurrence.toISOString();
      }

      if (this.isEditMode() && this.currentEntryId) {
        this.store.dispatch(new UpdateStandardEntry(this.currentEntryId, payload));
      } else {
        this.store.dispatch(new AddStandardEntry(payload));
      }
      this.isModalVisible.set(false);
    } else {
      Object.values(this.entryForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  deleteEntry(id: string) {
    this.store.dispatch(new DeleteStandardEntry(id));
  }
}
