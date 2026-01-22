import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import {
  InvestmentProperty,
  PropertySummary,
  CreatePropertyDto,
  UpdatePropertyDto,
} from '../../models/investment-property.model';
import { InvestmentPropertiesState } from '../../store/investment-properties/investment-properties.state';
import {
  LoadProperties,
  AddProperty,
  UpdateProperty,
  DeleteProperty,
} from '../../store/investment-properties/investment-properties.actions';
import { PropertyCardComponent } from './components/property-card/property-card.component';
import { PropertyFormComponent } from './components/property-form/property-form.component';
import { PropertySummaryComponent } from './components/property-summary/property-summary.component';

@Component({
  selector: 'app-investment-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzModalModule,
    NzGridModule,
    NzAlertModule,
    NzSpinModule,
    NzInputModule,
    PropertyCardComponent,
    PropertyFormComponent,
    PropertySummaryComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Investment Properties</h1>
        <button nz-button nzType="primary" (click)="showAddModal()">Add Property</button>
      </div>

      @if (error$ | async; as error) {
        <nz-alert nzType="error" [nzMessage]="error" nzCloseable class="error-alert"></nz-alert>
      }

      <nz-spin [nzSpinning]="loading$ | async" nzTip="Loading...">
        <!-- Actual Properties Summary -->
        <app-property-summary
          title="Actual Properties Summary"
          [summary]="actualSummary$ | async"
          [isPlanned]="false"
        ></app-property-summary>

        <!-- Actual Properties Grid -->
        <div class="properties-section">
          <h2>Actual Properties</h2>
          <div nz-row [nzGutter]="[16, 16]">
            @for (property of actualProperties$ | async; track property.id) {
              <div nz-col [nzXs]="24" [nzSm]="24" [nzMd]="12" [nzLg]="8">
                <app-property-card
                  [property]="property"
                  (edit)="showEditModal($event)"
                  (delete)="showDeleteConfirm($event)"
                ></app-property-card>
              </div>
            }
          </div>
          @if ((actualProperties$ | async)?.length === 0) {
            <div class="empty-state">
              <p>No actual properties added yet. Click "Add Property" to get started.</p>
            </div>
          }
        </div>

        <!-- Planned Properties Summary -->
        <app-property-summary
          title="Planned Properties Summary"
          [summary]="plannedSummary$ | async"
          [isPlanned]="true"
        ></app-property-summary>

        <!-- Planned Properties Grid -->
        <div class="properties-section planned">
          <h2>Planned Properties</h2>
          <div nz-row [nzGutter]="[16, 16]">
            @for (property of plannedProperties$ | async; track property.id) {
              <div nz-col [nzXs]="24" [nzSm]="24" [nzMd]="12" [nzLg]="8">
                <app-property-card
                  [property]="property"
                  (edit)="showEditModal($event)"
                  (delete)="showDeleteConfirm($event)"
                ></app-property-card>
              </div>
            }
          </div>
          @if ((plannedProperties$ | async)?.length === 0) {
            <div class="empty-state">
              <p>No planned properties yet.</p>
            </div>
          }
        </div>
      </nz-spin>

      <!-- Add/Edit Property Modal -->
      <nz-modal
        [(nzVisible)]="isModalVisible"
        [nzTitle]="modalTitle"
        [nzFooter]="null"
        (nzOnCancel)="handleModalCancel()"
        nzWidth="700px"
        nzCentered
      >
        <div *nzModalContent>
          <app-property-form
            [property]="selectedProperty"
            (submit)="handleFormSubmit($event)"
            (cancel)="handleModalCancel()"
          ></app-property-form>
        </div>
      </nz-modal>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      .error-alert {
        margin-bottom: 16px;
      }

      .properties-section {
        margin-bottom: 32px;
      }

      .properties-section.planned {
        margin-top: 24px;
      }

      .properties-section h2 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #262626;
      }

      .properties-section.planned h2 {
        color: #595959;
      }

      .empty-state {
        text-align: center;
        padding: 48px 24px;
        background: #fafafa;
        border-radius: 4px;
        color: #8c8c8c;
      }
    `,
  ],
})
export class InvestmentPropertiesComponent implements OnInit, OnDestroy {
  // Use store.select() instead of @Select decorator
  actualProperties$: Observable<InvestmentProperty[]>;
  plannedProperties$: Observable<InvestmentProperty[]>;
  actualSummary$: Observable<PropertySummary>;
  plannedSummary$: Observable<PropertySummary>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  isModalVisible = false;
  modalTitle = 'Add Property';
  selectedProperty?: InvestmentProperty;

  constructor(
    private store: Store,
    private modal: NzModalService,
  ) {
    // Initialize observables using store.select()
    this.actualProperties$ = this.store.select(InvestmentPropertiesState.actualProperties);
    this.plannedProperties$ = this.store.select(InvestmentPropertiesState.plannedProperties);
    this.actualSummary$ = this.store.select(InvestmentPropertiesState.actualSummary);
    this.plannedSummary$ = this.store.select(InvestmentPropertiesState.plannedSummary);
    this.loading$ = this.store.select(InvestmentPropertiesState.isLoading);
    this.error$ = this.store.select(InvestmentPropertiesState.getError);
  }

  ngOnInit(): void {
    // Load properties on init
    this.store.dispatch(new LoadProperties());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showAddModal(): void {
    this.selectedProperty = undefined;
    this.modalTitle = 'Add Property';
    this.isModalVisible = true;
  }

  showEditModal(property: InvestmentProperty): void {
    this.selectedProperty = property;
    this.modalTitle = 'Edit Property';
    this.isModalVisible = true;
  }

  handleFormSubmit(formValue: CreatePropertyDto | UpdatePropertyDto): void {
    if (this.selectedProperty) {
      // Update existing property
      this.store.dispatch(
        new UpdateProperty(this.selectedProperty.id, formValue as UpdatePropertyDto),
      );
    } else {
      // Add new property
      this.store.dispatch(new AddProperty(formValue as CreatePropertyDto));
    }
    this.isModalVisible = false;
  }

  handleModalCancel(): void {
    this.isModalVisible = false;
    this.selectedProperty = undefined;
  }

  showDeleteConfirm(property: InvestmentProperty): void {
    let confirmName = '';

    this.modal.confirm({
      nzTitle: 'Delete Property',
      nzContent: `
        <p>Are you sure you want to delete <strong>${property.name}</strong>?</p>
        <p style="margin-top: 16px; margin-bottom: 8px;">Please type the property name to confirm:</p>
        <input
          id="delete-confirm-input"
          type="text"
          class="ant-input"
          placeholder="Enter property name"
        />
      `,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        const input = document.getElementById('delete-confirm-input') as HTMLInputElement;
        confirmName = input?.value || '';

        if (confirmName === property.name) {
          this.store.dispatch(new DeleteProperty(property.id));
          return Promise.resolve();
        } else {
          this.modal.error({
            nzTitle: 'Name Mismatch',
            nzContent: 'The property name you entered does not match. Deletion cancelled.',
          });
          return Promise.reject();
        }
      },
    });
  }
}
