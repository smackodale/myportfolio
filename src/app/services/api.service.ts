import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { protectedResources } from '../auth-config';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = protectedResources.functionApi.endpoint;

  constructor(private http: HttpClient) {}

  getProperties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/properties`);
  }

  getInvestments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/investments`);
  }

  getSuperannuation(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/superannuation`);
  }

  getIncome(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/income`);
  }

  getFinances(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/finances`);
  }
}
