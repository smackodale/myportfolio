import {
  CreatePropertyDto,
  InvestmentProperty,
  UpdatePropertyDto,
} from '../../models/investment-property.model';

/**
 * Load all properties from the API
 */
export class LoadProperties {
  static readonly type = '[InvestmentProperties] Load Properties';
}

export class LoadPropertiesSuccess {
  static readonly type = '[InvestmentProperties] Load Properties Success';
  constructor(public properties: InvestmentProperty[]) {}
}

export class LoadPropertiesFailure {
  static readonly type = '[InvestmentProperties] Load Properties Failure';
  constructor(public error: string) {}
}

/**
 * Add a new property
 */
export class AddProperty {
  static readonly type = '[InvestmentProperties] Add Property';
  constructor(public property: CreatePropertyDto) {}
}

export class AddPropertySuccess {
  static readonly type = '[InvestmentProperties] Add Property Success';
  constructor(public property: InvestmentProperty) {}
}

export class AddPropertyFailure {
  static readonly type = '[InvestmentProperties] Add Property Failure';
  constructor(public error: string) {}
}

/**
 * Update an existing property
 */
export class UpdateProperty {
  static readonly type = '[InvestmentProperties] Update Property';
  constructor(
    public id: string,
    public property: UpdatePropertyDto,
  ) {}
}

export class UpdatePropertySuccess {
  static readonly type = '[InvestmentProperties] Update Property Success';
  constructor(public property: InvestmentProperty) {}
}

export class UpdatePropertyFailure {
  static readonly type = '[InvestmentProperties] Update Property Failure';
  constructor(public error: string) {}
}

/**
 * Delete a property
 */
export class DeleteProperty {
  static readonly type = '[InvestmentProperties] Delete Property';
  constructor(public id: string) {}
}

export class DeletePropertySuccess {
  static readonly type = '[InvestmentProperties] Delete Property Success';
  constructor(public id: string) {}
}

export class DeletePropertyFailure {
  static readonly type = '[InvestmentProperties] Delete Property Failure';
  constructor(public error: string) {}
}
