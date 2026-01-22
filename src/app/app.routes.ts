import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BudgetComponent } from './pages/budget/budget.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GoodbyeComponent } from './pages/goodbye/goodbye.component';
import { IncomeTrackingComponent } from './pages/income-tracking/income-tracking.component';
import { InvestmentPropertiesComponent } from './pages/investment-properties/investment-properties.component';
import { OtherInvestmentsComponent } from './pages/other-investments/other-investments.component';
import { SuperannuationComponent } from './pages/superannuation/superannuation.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'investment-properties',
    component: InvestmentPropertiesComponent,
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
  },
  {
    path: 'goodbye',
    component: GoodbyeComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
