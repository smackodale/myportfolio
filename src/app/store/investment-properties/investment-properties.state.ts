import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  InvestmentProperty,
  PropertySummary,
  PropertyType,
} from '../../models/investment-property.model';
import { InvestmentPropertiesApiService } from '../../services/investment-properties-api.service';
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
} from './investment-properties.actions';

/**
 * State model for investment properties
 */
export interface InvestmentPropertiesStateModel {
  properties: InvestmentProperty[];
  loading: boolean;
  error: string | null;
}

/**
 * NgXs State for managing investment properties
 */
@State<InvestmentPropertiesStateModel>({
  name: 'investmentProperties',
  defaults: {
    properties: [],
    loading: false,
    error: null,
  },
})
@Injectable()
export class InvestmentPropertiesState {
  private static calculationsService = new PropertyCalculationsService();

  constructor(private apiService: InvestmentPropertiesApiService) {}

  // ========== SELECTORS ==========

  /**
   * Get all properties
   */
  @Selector()
  static getProperties(state: InvestmentPropertiesStateModel): InvestmentProperty[] {
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
  @Selector([InvestmentPropertiesState.getProperties])
  static actualProperties(properties: InvestmentProperty[]): InvestmentProperty[] {
    return properties.filter((p) => p.propertyType === PropertyType.Actual);
  }

  /**
   * Get only planned properties
   */
  @Selector([InvestmentPropertiesState.getProperties])
  static plannedProperties(properties: InvestmentProperty[]): InvestmentProperty[] {
    return properties.filter((p) => p.propertyType === PropertyType.Planned);
  }

  /**
   * Get summary for actual properties
   */
  @Selector([InvestmentPropertiesState.actualProperties])
  static actualSummary(properties: InvestmentProperty[]): PropertySummary {
    return this.calculationsService.calculateSummary(properties);
  }

  /**
   * Get summary for planned properties
   */
  @Selector([InvestmentPropertiesState.plannedProperties])
  static plannedSummary(properties: InvestmentProperty[]): PropertySummary {
    return this.calculationsService.calculateSummary(properties);
  }

  /**
   * Get property by ID
   */
  @Selector([InvestmentPropertiesState.getProperties])
  static getPropertyById(properties: InvestmentProperty[]) {
    return (id: string) => properties.find((p) => p.id === id);
  }

  /**
   * Get loading state
   */
  @Selector()
  static isLoading(state: InvestmentPropertiesStateModel): boolean {
    return state.loading;
  }

  /**
   * Get error state
   */
  @Selector()
  static getError(state: InvestmentPropertiesStateModel): string | null {
    return state.error;
  }

  // ========== ACTION HANDLERS ==========

  /**
   * Load all properties
   */
  @Action(LoadProperties)
  loadProperties(ctx: StateContext<InvestmentPropertiesStateModel>) {
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
  loadPropertiesSuccess(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: LoadPropertiesSuccess,
  ) {
    ctx.patchState({
      properties: action.properties,
      loading: false,
      error: null,
    });
  }

  @Action(LoadPropertiesFailure)
  loadPropertiesFailure(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: LoadPropertiesFailure,
  ) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  /**
   * Add a new property
   */
  @Action(AddProperty)
  addProperty(ctx: StateContext<InvestmentPropertiesStateModel>, action: AddProperty) {
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
  addPropertySuccess(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: AddPropertySuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      properties: [...state.properties, action.property],
      loading: false,
      error: null,
    });
  }

  @Action(AddPropertyFailure)
  addPropertyFailure(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: AddPropertyFailure,
  ) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  /**
   * Update an existing property
   */
  @Action(UpdateProperty)
  updateProperty(ctx: StateContext<InvestmentPropertiesStateModel>, action: UpdateProperty) {
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
  updatePropertySuccess(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: UpdatePropertySuccess,
  ) {
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
  updatePropertyFailure(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: UpdatePropertyFailure,
  ) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  /**
   * Delete a property
   */
  @Action(DeleteProperty)
  deleteProperty(ctx: StateContext<InvestmentPropertiesStateModel>, action: DeleteProperty) {
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
  deletePropertySuccess(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: DeletePropertySuccess,
  ) {
    const state = ctx.getState();
    const properties = state.properties.filter((p) => p.id !== action.id);
    ctx.patchState({
      properties,
      loading: false,
      error: null,
    });
  }

  @Action(DeletePropertyFailure)
  deletePropertyFailure(
    ctx: StateContext<InvestmentPropertiesStateModel>,
    action: DeletePropertyFailure,
  ) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }
}
