// src/hooks/useCustomers.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { CustomerListResponse, CustomerDetail } from '@/types/customer';

const log = (label: string, data: any) => {
  // console.group(`👥 [Customers] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const customersApi = {
  // Get all customers for the provider
  getProviderCustomers: async (search?: string): Promise<CustomerListResponse> => {
    log('Get Provider Customers Request', { search });
    try {
      const { data } = await apiClient.get('/bookings/provider-customers/', {
        params: search ? { search } : undefined
      });
      log('Get Provider Customers Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Provider Customers Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get single customer details
  getCustomerDetail: async (customerId: string): Promise<CustomerDetail> => {
    log('Get Customer Detail Request', { customerId });
    try {
      const { data } = await apiClient.get(`/bookings/provider-customers/${customerId}/`);
      log('Get Customer Detail Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Customer Detail Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

// Get all customers for provider
export const useProviderCustomers = (search?: string) => {
  return useQuery({
    queryKey: ['providerCustomers', search],
    queryFn: () => customersApi.getProviderCustomers(search),
    staleTime: 60000, // 1 minute
  });
};

// Get single customer details
export const useCustomerDetail = (customerId: string) => {
  return useQuery({
    queryKey: ['customerDetail', customerId],
    queryFn: () => customersApi.getCustomerDetail(customerId),
    enabled: !!customerId,
    staleTime: 30000,
  });
};