import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BudgetComponent } from './pages/budget/budget.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GoodbyeComponent } from './pages/goodbye/goodbye.component';
import { IncomeTrackingComponent } from './pages/income-tracking/income-tracking.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { OtherInvestmentsComponent } from './pages/other-investments/other-investments.component';
import { SuperannuationComponent } from './pages/superannuation/superannuation.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'properties',
    component: PropertiesComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'other-investments',
    component: OtherInvestmentsComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'superannuation',
    component: SuperannuationComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'income-tracking',
    component: IncomeTrackingComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'budget',
    component: BudgetComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/budget/components/budget-view/budget-view.component').then(
            (m) => m.BudgetViewComponent,
          ),
      },
      {
        path: 'standard',
        loadComponent: () =>
          import('./pages/budget/components/standard-entries/standard-entries.component').then(
            (m) => m.StandardEntriesComponent,
          ),
      },
    ],
  },
  {
    path: 'goodbye',
    component: GoodbyeComponent,
    canActivate: [MsalGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
