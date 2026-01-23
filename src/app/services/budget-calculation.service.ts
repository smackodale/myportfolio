import { Injectable } from '@angular/core';
import { Budget, BudgetEntry, Frequency, StandardEntry } from '../models/budget.model';

/**
 * Service for budget calculations and business logic
 * Handles frequency calculations, budget generation, and running totals
 */
@Injectable({
  providedIn: 'root',
})
export class BudgetCalculationService {
  /**
   * Generate a budget for a specific week based on standard entries
   */
  generateBudgetForWeek(weekStart: Date, weekEnd: Date, standardEntries: StandardEntry[]): Budget {
    const entries: BudgetEntry[] = [];

    standardEntries.forEach((std) => {
      if (this.shouldApplyToWeek(std, weekStart, weekEnd)) {
        entries.push({
          id: crypto.randomUUID(),
          name: std.name,
          amount: std.amount,
          type: std.type,
          isStandard: true,
        });
      }
    });

    const { totalIncome, totalExpenses, weekTotal } = this.calculateTotals(entries);

    return {
      weekId: this.getWeekId(weekStart),
      fyWeekLabel: this.getFyWeekLabel(weekStart),
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      entries,
      totalIncome,
      totalExpenses,
      weekTotal,
      runningSavings: 0, // Calculated later by recalculateRunningSavingsAndPast
    };
  }

  /**
   * Check if a standard entry should apply to a specific week
   */
  shouldApplyToWeek(entry: StandardEntry, weekStart: Date, weekEnd: Date): boolean {
    // Weekly entries always apply
    if (entry.frequency === Frequency.Weekly) return true;

    // Non-weekly entries need a firstOccurrence
    if (!entry.firstOccurrence) return false;

    const firstOcc = new Date(entry.firstOccurrence);
    firstOcc.setHours(0, 0, 0, 0);

    const wStart = new Date(weekStart);
    wStart.setHours(0, 0, 0, 0);

    const wEnd = new Date(weekEnd);
    wEnd.setHours(23, 59, 59, 999);

    // If first occurrence is after this week, it doesn't apply
    if (firstOcc > wEnd) return false;

    // Check if any occurrence of this entry falls within the week
    let current = new Date(firstOcc);
    const maxIterations = 1000; // Safety limit
    let iterations = 0;

    while (current <= wEnd && iterations < maxIterations) {
      if (current >= wStart && current <= wEnd) {
        return true;
      }
      current = this.addFrequency(current, entry.frequency);
      iterations++;
    }

    return false;
  }

  /**
   * Add frequency interval to a date
   */
  private addFrequency(date: Date, freq: Frequency): Date {
    const d = new Date(date);
    switch (freq) {
      case Frequency.Weekly:
        d.setDate(d.getDate() + 7);
        break;
      case Frequency.Biweekly:
        d.setDate(d.getDate() + 14);
        break;
      case Frequency.Monthly:
        d.setMonth(d.getMonth() + 1);
        break;
      case Frequency.Quarterly:
        d.setMonth(d.getMonth() + 3);
        break;
      case Frequency.TwicePerYear:
        d.setMonth(d.getMonth() + 6);
        break;
      case Frequency.Yearly:
        d.setFullYear(d.getFullYear() + 1);
        break;
      case Frequency.ThreeTimesPerYear:
        d.setMonth(d.getMonth() + 4);
        break;
      default:
        d.setDate(d.getDate() + 7); // Fallback to weekly
    }
    return d;
  }

  /**
   * Calculate totals from budget entries
   */
  calculateTotals(entries: BudgetEntry[]): {
    totalIncome: number;
    totalExpenses: number;
    weekTotal: number;
  } {
    const totalIncome = entries
      .filter((e) => e.type === 'Income')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = entries
      .filter((e) => e.type === 'Expense')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      weekTotal: totalIncome - totalExpenses,
    };
  }

  /**
   * Recalculate running savings and isPast flag for all budgets
   * Mutates the budgets array
   */
  recalculateRunningSavingsAndPast(budgets: Budget[]): void {
    const now = new Date();

    budgets
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .reduce((running, budget) => {
        const end = new Date(budget.endDate);
        budget.isPast = end < now;

        if (budget.isPast) {
          budget.runningSavings = 0;
        } else {
          budget.runningSavings = running + budget.weekTotal;
        }

        return budget.runningSavings;
      }, 0);
  }

  /**
   * Get week ID from date (e.g., "2025-W10")
   */
  getWeekId(date: Date): string {
    const year = date.getFullYear();
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7,
    );
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get Financial Year week label (e.g., "FY2025-WK10")
   * Australian FY starts July 1
   */
  getFyWeekLabel(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const fy = month >= 6 ? year + 1 : year;

    // FY Start: July 1 of (fy-1)
    const fyStart = new Date(fy - 1, 6, 1); // July 1
    const diffTime = Math.abs(date.getTime() - fyStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const wk = Math.ceil(diffDays / 7);

    return `FY${fy}-WK${wk}`;
  }

  /**
   * Get date from week ID
   * Simplified ISO week calculation
   */
  getDateFromWeek(year: number, week: number): Date {
    const d = new Date(year, 0, 1);
    const startOffset = d.getTime() + week * 7 * 24 * 60 * 60 * 1000;
    const approximate = new Date(startOffset);

    // Align to Monday
    const day = approximate.getDay();
    const toMon = approximate.getDate() - day + (day === 0 ? -6 : 1);
    approximate.setDate(toMon);
    approximate.setHours(0, 0, 0, 0);

    return approximate;
  }

  /**
   * Get Monday of the week containing the given date
   */
  getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
