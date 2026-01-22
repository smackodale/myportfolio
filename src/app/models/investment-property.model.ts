/**
 * Investment Property Models and Types
 */

/**
 * Type of property classification
 */
export enum PropertyType {
  Actual = 'Actual',
  Planned = 'Planned',
}

/**
 * Loan repayment structure
 */
export enum LoanType {
  PrincipalAndInterest = 'Principal and Interest',
  InterestOnly = 'Interest Only',
}

/**
 * Mortgage Entity
 */
export interface Mortgage {
  originalAmount: number; // AUD - The initial loan amount
  outstandingBalance: number; // AUD - current amount owing
  interestRate: number; // Percentage (e.g., 5.5 for 5.5%)
  loanType: LoanType;
  repaymentAmount: number; // AUD per month/period - Calculated
}

/**
 * Investment Property entity
 */
export interface InvestmentProperty {
  id: string;
  name: string;
  imageUrl?: string;
  address: string;
  propertyValue: number; // AUD
  propertyType: PropertyType;
  mortgages: Mortgage[];

  // Calculated aggregates
  totalOriginalLoan?: number; // Calculated: Sum of mortgage original amounts
  totalOutstandingBalance?: number; // Calculated: Sum of mortgage outstanding balances
  totalRepaymentAmount?: number; // Calculated: Sum of mortgage repayments
  equity?: number; // Calculated: propertyValue - totalOutstandingBalance
  accessibleEquity?: number; // Calculated: (propertyValue * 0.8) - totalOutstandingBalance
}

/**
 * DTO for creating a new property (no ID)
 */
export interface CreatePropertyDto {
  name: string;
  imageUrl?: string;
  address: string;
  propertyValue: number;
  propertyType: PropertyType;
  mortgages: Mortgage[];
}

/**
 * DTO for updating a property (all fields optional except what you want to change)
 */
export interface UpdatePropertyDto {
  name?: string;
  imageUrl?: string;
  address?: string;
  propertyValue?: number;
  propertyType?: PropertyType;
  mortgages?: Mortgage[];
}

/**
 * Summary statistics for a set of properties
 */
export interface PropertySummary {
  totalPropertyValue: number;
  totalFinancedAmount: number;
  totalEquity: number;
  totalUsableEquity: number;
}
