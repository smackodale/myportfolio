import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  TemplateRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import {
  CreatePropertyDto,
  Property,
  PropertyType,
  UpdatePropertyDto,
} from '../../models/property.model';
import {
  AddProperty,
  DeleteProperty,
  LoadProperties,
  UpdateProperty,
} from '../../store/properties/properties.actions';
import { PropertiesState } from '../../store/properties/properties.state';
import { PropertyCardComponent } from './components/property-card/property-card.component';
import { PropertyFormComponent } from './components/property-form/property-form.component';
import { PropertySummaryComponent } from './components/property-summary/property-summary.component';

@Component({
  selector: 'app-properties',
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
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly modal = inject(NzModalService);

  // States from Store converted to Signals
  readonly actualProperties = toSignal(this.store.select(PropertiesState.actualProperties), {
    initialValue: [] as Property[],
  });
  readonly plannedProperties = toSignal(this.store.select(PropertiesState.plannedProperties), {
    initialValue: [] as Property[],
  });
  readonly actualSummary = toSignal(this.store.select(PropertiesState.actualSummary));
  readonly plannedSummary = toSignal(this.store.select(PropertiesState.plannedSummary));
  readonly loading = toSignal(this.store.select(PropertiesState.isLoading), {
    initialValue: false,
  });
  readonly error = toSignal(this.store.select(PropertiesState.getError), {
    initialValue: null as string | null,
  });

  // Combined and sorted properties using computed signal
  readonly allProperties = computed(() => {
    const actual = this.actualProperties();
    const planned = this.plannedProperties();
    return [...actual, ...planned].sort((a, b) => {
      if (a.propertyType === b.propertyType) return 0;
      return a.propertyType === PropertyType.Actual ? -1 : 1;
    });
  });

  // Local component state using signals
  readonly isModalVisible = signal(false);
  readonly modalTitle = signal('Add Property');
  readonly selectedProperty = signal<Property | undefined>(undefined);
  readonly deletePropertyName = signal('');

  ngOnInit(): void {
    this.store.dispatch(new LoadProperties());
  }

  showAddModal(): void {
    this.selectedProperty.set(undefined);
    this.modalTitle.set('Add Property');
    this.isModalVisible.set(true);
  }

  showEditModal(property: Property): void {
    this.selectedProperty.set(property);
    this.modalTitle.set('Edit Property');
    this.isModalVisible.set(true);
  }

  handleFormSubmit(formValue: CreatePropertyDto | UpdatePropertyDto): void {
    const selected = this.selectedProperty();
    if (selected) {
      this.store.dispatch(new UpdateProperty(selected.id, formValue as UpdatePropertyDto));
    } else {
      this.store.dispatch(new AddProperty(formValue as CreatePropertyDto));
    }
    this.isModalVisible.set(false);
  }

  handleModalCancel(): void {
    this.isModalVisible.set(false);
    this.selectedProperty.set(undefined);
  }

  showDeleteConfirm(property: Property, deleteTemplate: TemplateRef<unknown>): void {
    this.selectedProperty.set(property);
    this.deletePropertyName.set('');

    this.modal.confirm({
      nzTitle: 'Delete Property',
      nzContent: deleteTemplate,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        if (this.deletePropertyName() === property.name) {
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
