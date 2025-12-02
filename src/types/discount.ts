// src/types/discount.ts

export interface Discount {
  id: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  value: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  is_currently_active?: boolean;
}

export interface CreateDiscountData {
  discount_type: 'PERCENTAGE' | 'FIXED';
  value: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface UpdateDiscountData {
  discount_type?: 'PERCENTAGE' | 'FIXED';
  value?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface DiscountValidationError {
  discount_type?: string[];
  value?: string[];
  start_date?: string[];
  end_date?: string[];
  is_active?: string[];
  non_field_errors?: string[];
  error?: string;
}