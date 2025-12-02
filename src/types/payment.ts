// src/types/payment.ts

export interface Transaction {
  id: string;
  customer: string;
  service: string;
  amount: number;
  date: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
  reference: string;
}

export interface Withdrawal {
  id: string;
  bank: string;
  date: string;
  time: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface DailyFinance {
  day: string;
  income: number;
  withdrawals: number;
}

export interface TopService {
  service_id: string;
  service_name: string;
  bookings: number;
  revenue: number;
}

export interface FinanceAnalytics {
  income_percentage: number;
  withdrawal_percentage: number;
  growth_rate: number;
  month_over_month: number;
}

export interface PaymentAnalytics {
  current_wallet_balance: number;
  total_income: number;
  total_withdrawals: number;
  successful_transactions: number;
  pending_amount: number;
  failed_transactions: number;
  total_customers: number;
  total_transactions: number;
  average_transaction: number;
  daily_finance: DailyFinance[];
  recent_transactions: Transaction[];
  withdrawal_history: Withdrawal[];
  top_services: TopService[];
  finance_analytics: FinanceAnalytics;
}

export interface PaymentStats {
  today: {
    income: number;
    transactions: number;
  };
  this_week: {
    income: number;
    transactions: number;
  };
  this_month: {
    income: number;
    transactions: number;
  };
}

export interface PaymentAnalyticsParams {
  days?: number;
  start_date?: string;
  end_date?: string;
}

export interface WithdrawalRequest {
  amount: number;
  bank_account_id?: string;
  notes?: string;
}