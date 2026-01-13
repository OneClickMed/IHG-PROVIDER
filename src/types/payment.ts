// src/types/payment.ts

export interface Transaction {
  withdrawal: number | null;
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
  id: number;
  provider: number;
  provider_name: string;
  amount: number;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
  payment_count: number;
  metadata: Record<string, any>;
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

export interface PaymentMethod {
  method: string;
  count: number;
  total_amount: number;
}

export interface PaymentPeriod {
  start: string;
  end: string;
  days: number;
}

export interface PaymentAnalytics {
  // Summary stats
  current_wallet_balance: number;
  total_income: number;
  total_withdrawals: number;
  pending_amount: number;

  // Transaction counts
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_transactions: number;

  // Customer stats
  total_customers: number;
  average_transaction: number;

  // Time-series data
  daily_finance: DailyFinance[];

  // Transaction lists
  recent_transactions: Transaction[];
  withdrawal_history: Withdrawal[];

  // Analytics
  finance_analytics: FinanceAnalytics;

  // Additional insights
  payment_methods: PaymentMethod[];
  top_services: TopService[];

  // Metadata
  period: PaymentPeriod;
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
  payment_ids?: number[];
  notes?: string;
}

export interface WithdrawalResponse {
  message: string;
  withdrawal: Withdrawal;
}

export interface WithdrawalListResponse {
  withdrawals: Withdrawal[];
  summary: {
    total_requested: number;
    total_completed: number;
    pending_amount: number;
    count: number;
  };
}

export interface WithdrawalDetailsResponse {
  withdrawal: Withdrawal;
  payments: PaymentIntent[];
}

export interface AvailableBalance {
  available_balance: number;
  pending_balance: number;
  completed_balance: number;
  total_payments: number;
}

export interface PaymentIntent {
  id: number;
  reference: string;
  service: number;
  service_name: string;
  customer_name: string;
  customer_email: string;
  date: string;
  start_time: string;
  end_time: string;
  original_price: number;
  discount_percentage: number;
  discount_amount: number;
  amount: number;
  had_discount: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paid_out: boolean;
  paid_out_at: string | null;
  withdrawal: number | null;
  created_at: string;
}

export interface AvailablePaymentsResponse {
  available_payments: PaymentIntent[];
  total_available: number;
  count: number;
}

export interface CartItem {
  service_id: number;
  service_name: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  discount_amount: number;
  had_discount: boolean;
  date: string;
  start_time: string;
  end_time: string;
}

export interface PaymentCheckoutResponse {
  payment_reference: string;
  checkout_url: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  description: string;
  cart_items: CartItem[];
}
