// src/types/customer.ts

export interface CustomerAppointment {
  id: number;
  service_name: string;
  service_category: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM:SS format
}

export interface CustomerDetail {
  customer_id: string;
  customer_name: string;
  email: string;
  age_gender?: string;
  contact?: string;
  state?: string;
  emergency_contact?: string;
  appointments: CustomerAppointment[];
}

export interface CustomerListItem {
  customer_id: string;
  customer_name: string;
  email: string;
  total_appointments: number;
  last_appointment?: {
    date: string;
    time: string;
  };
}

export interface CustomerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerListItem[];
}
