import { Injectable } from '@angular/core';
import { InvestmentProperty, Mortgage, PropertySummary } from '../models/investment-property.model';

/**
 * Service for property-related calculations
 */
@Injectable({
  providedIn: 'root',
})
export class PropertyCalculationsService {
  /**
   * Calculate equity for a property
   * Equity = Property Value - Sum(Mortgage Outstanding Balances)
   */
  calculateEquity(propertyValue: number, totalOutstandingBalance: number): number;
  calculateEquity(property: InvestmentProperty): number;
  calculateEquity(
    propertyOrValue: InvestmentProperty | number,
    totalOutstandingBalance?: number,
  ): number {
    if (typeof propertyOrValue === 'number') {
      return propertyOrValue - (totalOutstandingBalance || 0);
    }
    const outstanding = this.calculateTotalOutstandingBalance(propertyOrValue.mortgages);
    return propertyOrValue.propertyValue - outstanding;
  }

  /**
   * Calculate accessible equity (assuming 20% minimum LVR)
   * Accessible Equity = (Property Value × 0.8) - Sum(Outstanding Balances)
   * Returns 0 if result is negative (no accessible equity)
   */
  calculateAccessibleEquity(propertyValue: number, totalOutstandingBalance: number): number;
  calculateAccessibleEquity(property: InvestmentProperty): number;
  calculateAccessibleEquity(
    propertyOrValue: InvestmentProperty | number,
    totalOutstandingBalance?: number,
  ): number {
    let value: number;
    let outstanding: number;

    if (typeof propertyOrValue === 'number') {
      value = propertyOrValue;
      outstanding = totalOutstandingBalance || 0;
    } else {
      value = propertyOrValue.propertyValue;
      outstanding = this.calculateTotalOutstandingBalance(propertyOrValue.mortgages);
    }

    const maxLoan = value * 0.8;
    const accessible = maxLoan - outstanding;
    return Math.max(0, accessible);
  }

  /**
   * Calculate total original loan amount from a list of mortgages
   */
  calculateTotalOriginalLoan(mortgages: Mortgage[]): number {
    if (!mortgages) return 0;
    return mortgages.reduce((sum, m) => sum + (m.originalAmount || 0), 0);
  }

  /**
   * Calculate total outstanding balance from a list of mortgages
   */
  calculateTotalOutstandingBalance(mortgages: Mortgage[]): number {
    if (!mortgages) return 0;
    return mortgages.reduce((sum, m) => sum + (m.outstandingBalance || 0), 0);
  }

  /**
   * Calculate total repayment amount from a list of mortgages
   */
  calculateTotalRepayment(mortgages: Mortgage[]): number {
    if (!mortgages) return 0;
    return mortgages.reduce((sum, m) => sum + (m.repaymentAmount || 0), 0);
  }

  /**
   * Calculate summary statistics for a set of properties
   */
  calculateSummary(properties: InvestmentProperty[]): PropertySummary {
    return properties.reduce(
      (summary, property) => {
        const equity = this.calculateEquity(property);
        const accessibleEquity = this.calculateAccessibleEquity(property);
        const outstanding = this.calculateTotalOutstandingBalance(property.mortgages);

        return {
          totalPropertyValue: summary.totalPropertyValue + property.propertyValue,
          totalFinancedAmount: summary.totalFinancedAmount + outstanding,
          totalEquity: summary.totalEquity + equity,
          totalUsableEquity: summary.totalUsableEquity + accessibleEquity,
        };
      },
      {
        totalPropertyValue: 0,
        totalFinancedAmount: 0,
        totalEquity: 0,
        totalUsableEquity: 0,
      },
    );
  }

  /**
   * Calculate monthly repayment amount for a single mortgage
   * Interest Only: (Original Amount * Rate) / 12
   * Principal & Interest: Standard amortization formula (assumed 30 years)
   */
  calculateMortgageRepayment(
    originalAmount: number,
    interestRate: number,
    loanType: string,
  ): number {
    if (!originalAmount || !interestRate) return 0;

    const rate = interestRate / 100;
    const monthlyRate = rate / 12;

    if (loanType === 'Interest Only') {
      return (originalAmount * rate) / 12;
    } else {
      // Principal and Interest - Assumed 30 years (360 months)
      const termMonths = 360;
      // Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
      const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
      return originalAmount * (numerator / denominator);
    }
  }
}
