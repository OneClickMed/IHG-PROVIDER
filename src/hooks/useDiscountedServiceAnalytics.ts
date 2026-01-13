import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface DiscountGroup {
  group: string;
  discount_range: string;
  total_appointments: number;
  total_revenue: number;
}

export interface DetailedService {
  service_id: number;
  service_name: string;
  discount_percentage: number;
  discount_start: string;
  discount_end: string;
  completed_appointments: number;
  revenue: number;
}

export interface DiscountedServiceAnalytics {
  start_date: string;
  end_date: string;
  summary_by_discount_group: DiscountGroup[];
  detailed_services: DetailedService[];
  total_discounted_services: number;
}

export interface DiscountedServiceFilters {
  year?: number;
  start_date?: string;
  end_date?: string;
}

const fetchDiscountedServiceAnalytics = async (
  filters: DiscountedServiceFilters
): Promise<DiscountedServiceAnalytics> => {
  // console.log('📊 [Discounted Services] Fetching with filters:', filters);
  try {
    const { data } = await apiClient.get('/accounts/provider/analytics/discounted-services/', {
      params: filters,
    });
    // console.log('✅ [Discounted Services] Response:', data);
    return data;
  } catch (error: any) {
    // console.error('❌ [Discounted Services] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const useDiscountedServiceAnalytics = (filters: DiscountedServiceFilters) => {
  return useQuery({
    queryKey: ['discountedServiceAnalytics', filters],
    queryFn: () => fetchDiscountedServiceAnalytics(filters),
    staleTime: 60000,
  });
};
