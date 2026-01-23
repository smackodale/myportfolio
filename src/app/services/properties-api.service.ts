import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CreatePropertyDto, Property, UpdatePropertyDto } from '../models/property.model';

/**
 * MOCK API Service for Properties
 * Uses localStorage for persistence for testing purposes
 */
@Injectable({
  providedIn: 'root',
})
export class PropertiesApiService {
  private readonly STORAGE_KEY = 'mock_properties';
  private properties: Property[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        this.properties = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse mock data', e);
        this.properties = [];
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.properties));
  }

  /**
   * Get all properties
   */
  getProperties(): Observable<Property[]> {
    return of([...this.properties]).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Get a single property by ID
   */
  getProperty(id: string): Observable<Property> {
    const property = this.properties.find((p) => p.id === id);
    if (property) {
      return of({ ...property }).pipe(delay(300));
    }
    return throwError(() => new Error('Property not found')).pipe(delay(300));
  }

  /**
   * Create a new property
   */
  createProperty(dto: CreatePropertyDto): Observable<Property> {
    const newProperty: Property = {
      ...dto,
      id: this.generateId(),
    };

    this.properties.push(newProperty);
    this.saveToStorage();

    return of(newProperty).pipe(delay(500));
  }

  /**
   * Update an existing property
   */
  updateProperty(id: string, dto: UpdatePropertyDto): Observable<Property> {
    const index = this.properties.findIndex((p) => p.id === id);

    if (index !== -1) {
      const updatedProperty = {
        ...this.properties[index],
        ...dto,
      };
      this.properties[index] = updatedProperty;
      this.saveToStorage();
      return of(updatedProperty).pipe(delay(500));
    }

    return throwError(() => new Error('Property not found')).pipe(delay(500));
  }

  /**
   * Delete a property
   */
  deleteProperty(id: string): Observable<void> {
    const index = this.properties.findIndex((p) => p.id === id);

    if (index !== -1) {
      this.properties.splice(index, 1);
      this.saveToStorage();
      return of(void 0).pipe(delay(500));
    }

    return throwError(() => new Error('Property not found')).pipe(delay(500));
  }

  private generateId(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
  }
}
