export type TransactionType = 'earning' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  km?: number;
  description?: string;
}

export type CarType = 'rented' | 'financed' | 'owned';

export interface CalculatorSettings {
  carType: CarType;
  daysPerWeek: number;
  hoursPerDay: number;
  dailyKmGoal: number;
  monthlyRental: number;
  monthlyInstallment: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  fuelPrice: number;
  consumption: number;
  monthlyNetProfitGoal: number;
}
