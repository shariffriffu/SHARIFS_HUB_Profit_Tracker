export type UserRole = 'admin' | 'operator' | 'investor';

export interface User {
  userId: string;
  name: string;
  role: UserRole;
}

export interface ProfitDistribution {
  you: number;
  rahman: number;
  ajmal: number;
  truckOwner: number;
}

export interface Settings {
  reservePercentage: number;
  profitDistribution: ProfitDistribution;
}

export interface Investor {
  id: string;
  name: string;
  totalInvestment: number;
  remainingCapital: number;
  profitPercentage: number;
  postRecoveryPercentage: number;
  status: 'active' | 'inactive';
}

export interface DailyEntry {
  id?: string;
  date: string;
  sales: {
    iceCream: number;
    shakes: number;
    other: number;
  };
  expenses: {
    rawMaterials: number;
    fuel: number;
    iceElectric: number;
    misc: number;
  };
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  reserveAmount: number;
  remainingProfit: number;
  distribution: ProfitDistribution;
  investorShare: number;
  investorRemainingCapital: number;
  createdBy: string;
  approved: boolean;
}
