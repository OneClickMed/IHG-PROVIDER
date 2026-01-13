import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface CompletedServiceData {
  month?: string;
  month_number?: number;
  date?: string;
  day?: number;
  service_id: number;
  service_name: string;
  count: number;
}

export interface CompletedServiceAnalytics {
  year: number;
  month?: number;
  month_name?: string;
  view: 'yearly' | 'daily';
  data: CompletedServiceData[];
}

export interface CompletedServiceFilters {
  year?: number;
  month?: number;
  view?: 'yearly' | 'daily';
}

const fetchCompletedServiceAnalytics = async (
  filters: CompletedServiceFilters
): Promise<CompletedServiceAnalytics> => {
  // console.log('📊 [Completed Services] Fetching with filters:', filters);
  try {
    const { data } = await apiClient.get('/accounts/provider/analytics/completed-services/', {
      params: filters,
    });
    // console.log('✅ [Completed Services] Response:', data);
    return data;
  } catch (error: any) {
    // console.error('❌ [Completed Services] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const useCompletedServiceAnalytics = (
  filters: CompletedServiceFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['completedServiceAnalytics', filters],
    queryFn: () => fetchCompletedServiceAnalytics(filters),
    staleTime: 60000,
    enabled: options?.enabled !== false,
  });
};
