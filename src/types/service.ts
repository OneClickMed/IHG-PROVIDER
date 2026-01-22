// src/types/service.ts
export interface ServiceReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Service {
  id: number;
  provider: {
    id: number;
    organization_name: string;
    specialty: string;
    bio: string;
    phone: string;
    verified: boolean;
    type: 'INDIVIDUAL' | 'INSTITUTION';
    location: string;
  };
  title: string;
  description: string;
  category: ServiceCategory;
  price: string;
  discounted_price: number;
  has_active_discount: boolean;
  average_rating: number;
  rating_count: number;
  discount_percentage_display: number;
  active_discount: Discount | null;
  availability_set?: boolean;
  available: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  appointment_duration: number;
  reviews?: ServiceReview[];
  is_virtual?: boolean;
}

export type ServiceCategory =
  | 'CONSULTATION'
  | 'DIAGNOSTICS_LAB'
  | 'RADIOLOGY'
  | 'ULTRA_SOUND'
  | 'PHARMACY_MEDIC'
  | 'WELLNESS'
  | 'CRITICAL_CARE'
  | 'TELEHEALTH'
  | 'SUPPORTIVE'
  | 'REFERRALS'
  | 'OTHERS';

export interface Discount {
  id: number;
  discount_type: 'PERCENTAGE' | 'FIXED';
  value: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface ServiceFilters {
  category?: ServiceCategory | string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
  has_discount?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ServiceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Service[];
}

export interface CreateServiceData {
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  appointment_duration: number;
  available?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  status?: 'ACTIVE' | 'INACTIVE';
}
