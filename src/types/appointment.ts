// src/types/appointment.ts

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ServiceTimeSlot {
  id: string;
  service: string;
  day_of_week: DayOfWeek;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  is_active: boolean;
}

// Updated to match your actual backend response
export interface Appointment {
  id: number;
  service: {
    id: number;
    provider: {
      id: number;
      organization_name: string;
      specialty: string;
      bio?: string;
      phone: string;
      verified: boolean;
      type: string;
      location?: string;
    };
    title: string;
    description?: string;
    price: string;
    discounted_price?: number;
    has_active_discount: boolean;
    average_rating: number;
    rating_count: number;
    discount_percentage_display: number;
    active_discount?: any;
    available: boolean;
    created_at: string;
    appointment_duration: number;
    status: string;
    category: string;
    is_virtual?: boolean;
  };
  provider: {
    id: number;
    organization_name: string;
    specialty: string;
    phone: string;
    verified: boolean;
  };
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_profile_picture?: string;
  customer_age?: number;
  customer_gender?: string;
  customer_phone?: string;
  customer_emergency_contact?: string;
  rating: any;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  ordering?: string; // e.g., 'date', '-date', 'start_time'
  page?: number;
  page_size?: number;
}

export interface CreateAppointmentData {
  service: string;
  customer: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  notes?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AvailableSlot {
  id: string;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  day_of_week: DayOfWeek;
}

export interface AvailableSlotsResponse {
  date: string;
  day_of_week: DayOfWeek;
  service_id: string;
  slots: AvailableSlot[];
}

// Helper types for calendar view
export interface CalendarAppointment {
  id: string;
  title: string;
  customerName: string;
  customerId: string;
  patientId?: string;
  service: string;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface CalendarDay {
  date: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isCurrentMonth: boolean;
  appointments: CalendarAppointment[];
}