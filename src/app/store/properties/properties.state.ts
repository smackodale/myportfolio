import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Property, PropertySummary, PropertyType } from '../../models/property.model';
import { PropertiesApiService } from '../../services/properties-api.service';
import { PropertyCalculationsService } from '../../services/property-calculations.service';
import {
  AddProperty,
  AddPropertyFailure,
  AddPropertySuccess,
  DeleteProperty,
  DeletePropertyFailure,
  DeletePropertySuccess,
  LoadProperties,
  LoadPropertiesFailure,
  LoadPropertiesSuccess,
  UpdateProperty,
  UpdatePropertyFailure,
  UpdatePropertySuccess,
} from './properties.actions';

/**
 * State model for properties
 */
export interface PropertiesStateModel {
  properties: Property[];
  loading: boolean;
  error: string | null;
}

/**
 * NgXs State for managing properties
 */
@State<PropertiesStateModel>({
  name: 'properties',
  defaults: {
    properties: [],
    loading: false,
    error: null,
  },
})
@Injectable()
export class PropertiesState {
  private static calculationsService = new PropertyCalculationsService();

  constructor(private apiService: PropertiesApiService) {}

  // ========== SELECTORS ==========

  /**
   * Get all properties
   */
  @Selector()
  static getProperties(state: PropertiesStateModel): Property[] {
    return state.properties.map((property) => {
      const mortgages = property.mortgages || [];
      return {
        ...property,
        totalOriginalLoan: this.calculationsService.calculateTotalOriginalLoan(mortgages),
        totalOutstandingBalance:
          this.calculationsService.calculateTotalOutstandingBalance(mortgages),
        totalRepaymentAmount: this.calculationsService.calculateTotalRepayment(mortgages),
        equity: this.calculationsService.calculateEquity(property),
        accessibleEquity: this.calculationsService.calculateAccessibleEquity(property),
      };
    });
  }

  /**
   * Get only actual properties
   */
  @Selector([PropertiesState.getProperties])
  static actualProperties(properties: Property[]): Property[] {
    return properties.filter((p) => p.propertyType === PropertyType.Actual);
  }

  /**
   * Get only planned properties
   */
  @Selector([PropertiesState.getProperties])
  static plannedProperties(properties: Property[]): Property[] {
    return properties.filter((p) => p.propertyType === PropertyType.Planned);
  }

  /**
   * Get summary for actual properties
   */
  @Selector([PropertiesState.actualProperties])
  static actualSummary(properties: Property[]): PropertySummary {
    return this.calculationsService.calculateSummary(properties);
  }

  /**
   * Get summary for planned properties
   */
  @Selector([PropertiesState.plannedProperties])
  static plannedSummary(properties: Property[]): PropertySummary {
    return this.calculationsService.calculateSummary(properties);
  }

  /**
   * Get property by ID
   */
  @Selector([PropertiesState.getProperties])
  static getPropertyById(properties: Property[]) {
    return (id: string) => properties.find((p) => p.id === id);
  }

  /**
   * Get loading state
   */
  @Selector()
  static isLoading(state: PropertiesStateModel): boolean {
    return state.loading;
  }

  /**
   * Get error state
   */
  @Selector()
  static getError(state: PropertiesStateModel): string | null {
    return state.error;
  }

  // ========== ACTION HANDLERS ==========

  /**
   * Load all properties
   */
  @Action(LoadProperties)
  loadProperties(ctx: StateContext<PropertiesStateModel>) {
    ctx.patchState({ loading: true, error: null });

    return this.apiService.getProperties().pipe(
      map((properties) => ctx.dispatch(new LoadPropertiesSuccess(properties))),
      catchError((error) => {
        const errorMessage = error.error?.message || error.message || 'Failed to load properties';
        return of(ctx.dispatch(new LoadPropertiesFailure(errorMessage)));
      }),
    );
  }

  @Action(LoadPropertiesSuccess)
  loadPropertiesSuccess(ctx: StateContext<PropertiesStateModel>, action: LoadPropertiesSuccess) {
    ctx.patchState({
      properties: action.properties,
      loading: false,
      error: null,
    });
  }

  @Action(LoadPropertiesFailure)
  loadPropertiesFailure(ctx: StateContext<PropertiesStateModel>, action: LoadPropertiesFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  /**
   * Add a new property
   */
  @Action(AddProperty)
  addProperty(ctx: StateContext<PropertiesStateModel>, action: AddProperty) {
    ctx.patchState({ loading: true, error: null });

    return this.apiService.createProperty(action.property).pipe(
      map((property) => ctx.dispatch(new AddPropertySuccess(property))),
      catchError((error) => {
        const errorMessage = error.error?.message || error.message || 'Failed to add property';
        return of(ctx.dispatch(new AddPropertyFailure(errorMessage)));
      }),
    );
  }

  @Action(AddPropertySuccess)
  addPropertySuccess(ctx: StateContext<PropertiesStateModel>, action: AddPropertySuccess) {
    const state = ctx.getState();
    ctx.patchState({
      properties: [...state.properties, action.property],
      loading: false,
      error: null,
    });
  }

  @Action(AddPropertyFailure)
  addPropertyFailure(ctx: StateContext<PropertiesStateModel>, action: AddPropertyFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  /**
   * Update an existing property
   */
  @Action(UpdateProperty)
  updateProperty(ctx: StateContext<PropertiesStateModel>, action: UpdateProperty) {
    ctx.patchState({ loading: true, error: null });

    return this.apiService.updateProperty(action.id, action.property).pipe(
      map((property) => ctx.dispatch(new UpdatePropertySuccess(property))),
      catchError((error) => {
        const errorMessage = error.error?.message || error.message || 'Failed to update property';
        return of(ctx.dispatch(new UpdatePropertyFailure(errorMessage)));
      }),
    );
  }

  @Action(UpdatePropertySuccess)
  updatePropertySuccess(ctx: StateContext<PropertiesStateModel>, action: UpdatePropertySuccess) {
    const state = ctx.getState();
    const properties = state.properties.map((p) =>
      p.id === action.property.id ? action.property : p,
    );
    ctx.patchState({
      properties,
      loading: false,
      error: null,
    });
  }

  @Action(UpdatePropertyFailure)
  updatePropertyFailure(ctx: StateContext<PropertiesStateModel>, action: UpdatePropertyFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  /**
   * Delete a property
   */
  @Action(DeleteProperty)
  deleteProperty(ctx: StateContext<PropertiesStateModel>, action: DeleteProperty) {
    ctx.patchState({ loading: true, error: null });

    return this.apiService.deleteProperty(action.id).pipe(
      map(() => ctx.dispatch(new DeletePropertySuccess(action.id))),
      catchError((error) => {
        const errorMessage = error.error?.message || error.message || 'Failed to delete property';
        return of(ctx.dispatch(new DeletePropertyFailure(errorMessage)));
      }),
    );
  }

  @Action(DeletePropertySuccess)
  deletePropertySuccess(ctx: StateContext<PropertiesStateModel>, action: DeletePropertySuccess) {
    const state = ctx.getState();
    const properties = state.properties.filter((p) => p.id !== action.id);
    ctx.patchState({
      properties,
      loading: false,
      error: null,
    });
  }

  @Action(DeletePropertyFailure)
  deletePropertyFailure(ctx: StateContext<PropertiesStateModel>, action: DeletePropertyFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }
}
