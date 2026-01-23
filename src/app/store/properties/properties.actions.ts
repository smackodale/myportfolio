import { CreatePropertyDto, Property, UpdatePropertyDto } from '../../models/property.model';

/**
 * Load all properties from the API
 */
export class LoadProperties {
  static readonly type = '[Properties] Load Properties';
}

export class LoadPropertiesSuccess {
  static readonly type = '[Properties] Load Properties Success';
  constructor(public properties: Property[]) {}
}

export class LoadPropertiesFailure {
  static readonly type = '[Properties] Load Properties Failure';
  constructor(public error: string) {}
}

/**
 * Add a new property
 */
export class AddProperty {
  static readonly type = '[Properties] Add Property';
  constructor(public property: CreatePropertyDto) {}
}

export class AddPropertySuccess {
  static readonly type = '[Properties] Add Property Success';
  constructor(public property: Property) {}
}

export class AddPropertyFailure {
  static readonly type = '[Properties] Add Property Failure';
  constructor(public error: string) {}
}

/**
 * Update an existing property
 */
export class UpdateProperty {
  static readonly type = '[Properties] Update Property';
  constructor(
    public id: string,
    public property: UpdatePropertyDto,
  ) {}
}

export class UpdatePropertySuccess {
  static readonly type = '[Properties] Update Property Success';
  constructor(public property: Property) {}
}

export class UpdatePropertyFailure {
  static readonly type = '[Properties] Update Property Failure';
  constructor(public error: string) {}
}

/**
 * Delete a property
 */
export class DeleteProperty {
  static readonly type = '[Properties] Delete Property';
  constructor(public id: string) {}
}

export class DeletePropertySuccess {
  static readonly type = '[Properties] Delete Property Success';
  constructor(public id: string) {}
}

export class DeletePropertyFailure {
  static readonly type = '[Properties] Delete Property Failure';
  constructor(public error: string) {}
}
