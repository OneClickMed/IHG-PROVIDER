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
  revenue_distribution: RevenueDistribution[];
  general_stats: GeneralStats;
}

export interface AnalyticsFilters {
  year?: number;
  start_date?: string;
  end_date?: string;
}

export interface RevenueDistributionFilters {
  year?: number;
  limit?: number;
}

// API Function
const providerAnalyticsApi = {
  getAnalytics: async (filters?: AnalyticsFilters): Promise<ProviderAnalytics> => {
    try {
      const { data } = await apiClient.get('/accounts/provider/analytics/', {
        params: filters,
      });
      return data;
    } catch (error: any) {
      // console.error('❌ Get Analytics Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getGeneralStats: async (filters?: AnalyticsFilters): Promise<GeneralStats> => {
    try {
      const { data } = await apiClient.get('/accounts/provider/analytics/general-stats/', {
        params: filters,
      });
      return data;
    } catch (error: any) {
      // console.error('❌ Get General Stats Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getRevenueDistribution: async (filters?: RevenueDistributionFilters): Promise<RevenueDistribution[]> => {
    try {
      const { data } = await apiClient.get('/accounts/provider/analytics/revenue-distribution/', {
        params: filters,
      });
      return data;
    } catch (error: any) {
      // console.error('❌ Get Revenue Distribution Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hook
export const useProviderAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['providerAnalytics', filters],
    queryFn: async () => {
      // console.log('📊 Fetching analytics with filters:', filters);
      try {
        const result = await providerAnalyticsApi.getAnalytics(filters);
        // console.log('✅ Analytics response:', result);
        return result;
      } catch (error) {
        // console.error('❌ Analytics error:', error);
        throw error;
      }
    },
    staleTime: 60000,
    refetchInterval: 300000,
  });
};

// General Stats Hook
export const useGeneralStats = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['generalStats', filters],
    queryFn: async () => {
      // console.log('📊 Fetching general stats with filters:', filters);
      const result = await providerAnalyticsApi.getGeneralStats(filters);
      // console.log('✅ General Stats response:', result);
      return result;
    },
    staleTime: 60000,
    refetchInterval: 300000,
  });
};

// Revenue Distribution Hook
export const useRevenueDistribution = (filters?: RevenueDistributionFilters) => {
  return useQuery({
    queryKey: ['revenueDistribution', filters],
    queryFn: async () => {
      // console.log('📊 Fetching revenue distribution with filters:', filters);
      const result = await providerAnalyticsApi.getRevenueDistribution(filters);
      // console.log('✅ Revenue Distribution response:', result);
      return result;
    },
    staleTime: 60000,
    refetchInterval: 300000,
  });
};