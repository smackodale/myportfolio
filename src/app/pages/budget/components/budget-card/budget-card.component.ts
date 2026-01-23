import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Budget, BudgetEntry, EntryType } from '../../../../models/budget.model';
import { UpdateBudgetEntry } from '../../../../store/budget/budget.actions';

@Component({
  selector: 'app-budget-card',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzInputNumberModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
  ],
  templateUrl: './budget-card.component.html',
  styleUrl: './budget-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetCardComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly budget = input.required<Budget>();
  readonly reset = output<string>();

  // Editing state
  readonly editingEntryId = signal<string | null>(null);
  readonly editAmount = signal<number>(0);
  readonly isAddingEntry = signal(false);

  // New entry form
  readonly newEntryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['Expense' as EntryType, Validators.required],
  });

  // Sorted entries
  readonly incomeEntries = computed(
    () =>
      this.budget()
        ?.entries.filter((e) => e.type === 'Income')
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
  );

  readonly expenseEntries = computed(
    () =>
      this.budget()
        ?.entries.filter((e) => e.type === 'Expense')
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
  );

  readonly entryTypes: EntryType[] = ['Income', 'Expense'];

  onReset() {
    this.reset.emit(this.budget().weekId);
  }

  startEdit(entry: BudgetEntry) {
    this.editingEntryId.set(entry.id);
    this.editAmount.set(entry.amount);
  }

  saveEdit(entry: BudgetEntry) {
    const newAmount = this.editAmount();
    if (newAmount > 0 && newAmount !== entry.amount) {
      this.store.dispatch(
        new UpdateBudgetEntry(this.budget().weekId, entry.id, { amount: newAmount }),
      );
    }
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingEntryId.set(null);
    this.editAmount.set(0);
  }

  deleteEntry(entry: BudgetEntry) {
    if (entry.isStandard) {
      alert('Cannot delete standard entries. Use "Reset to Standard" to restore defaults.');
      return;
    }

    // Remove the entry by updating the budget without it
    const updatedEntries = this.budget().entries.filter((e) => e.id !== entry.id);
    const { totalIncome, totalExpenses, weekTotal } = {
      totalIncome: updatedEntries
        .filter((e) => e.type === 'Income')
        .reduce((sum, e) => sum + e.amount, 0),
      totalExpenses: updatedEntries
        .filter((e) => e.type === 'Expense')
        .reduce((sum, e) => sum + e.amount, 0),
      weekTotal: 0,
    };

    // Create a temporary budget update
    this.store.dispatch(
      new UpdateBudgetEntry(this.budget().weekId, entry.id, {
        amount: 0,
        name: '',
        type: entry.type,
        isStandard: false,
      }),
    );
  }

  showAddEntryForm() {
    this.isAddingEntry.set(true);
    this.newEntryForm.reset({ type: 'Expense', amount: 0 });
  }

  cancelAddEntry() {
    this.isAddingEntry.set(false);
    this.newEntryForm.reset();
  }

  addEntry() {
    if (this.newEntryForm.valid) {
      const formValue = this.newEntryForm.value;
      const existingNames = this.budget().entries.map((e) => e.name.toLowerCase());

      // Validate unique name
      if (existingNames.includes(formValue.name.toLowerCase())) {
        alert('An entry with this name already exists. Please use a unique name.');
        return;
      }

      // Dispatch action to add entry
      this.store.dispatch(
        new UpdateBudgetEntry(this.budget().weekId, crypto.randomUUID(), {
          name: formValue.name,
          amount: formValue.amount,
          type: formValue.type,
          isStandard: false,
        }),
      );

      this.cancelAddEntry();
    }
  }
}
