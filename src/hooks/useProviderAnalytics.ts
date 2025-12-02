// src/hooks/useProviderAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface BookingRequest {
  id: number;
  customer_name: string;
  patient_id: string;
  booking_date: string;
  service: string;
  booking_detail: string;
}

export interface ServicePerformance {
  month: string;
  service_name: string;
  count: number;
}

export interface DiscountedService {
  id: number;
  title: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
}

export interface RevenueDistribution {
  service_name: string;
  revenue: string;
  color: string;
}

export interface GeneralStats {
  virtual: number;
  physical: number;
  cancelled: number;
}

export interface DiscountGroup {
  range: [number, number];
  count: number;
}

export interface ProviderAnalytics {
  total_services: number;
  total_bookings: number;
  total_revenue: string;
  booking_requests: BookingRequest[];
  completed_service_performance: ServicePerformance[];
  discounted_service_performance: Record<string, DiscountGroup>;
  discounted_services: DiscountedService[];
  revenue_distribution: RevenueDistribution[];
  general_stats: GeneralStats;
}

export interface AnalyticsFilters {
  year?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
}

const log = (label: string, data: any) => {
  // console.group(`📊 [Provider Analytics] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Function
const providerAnalyticsApi = {
  getAnalytics: async (filters?: AnalyticsFilters): Promise<ProviderAnalytics> => {
    log('Get Analytics Request', filters);
    try {
      const { data } = await apiClient.get('/accounts/provider/analytics/', {
        params: filters,
      });
      log('Get Analytics Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Analytics Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hook
export const useProviderAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['providerAnalytics', filters],
    queryFn: () => providerAnalyticsApi.getAnalytics(filters),
    staleTime: 60000, // 1 minute - adjust based on how often data changes
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};