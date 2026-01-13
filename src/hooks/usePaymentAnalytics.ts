// src/hooks/usePaymentAnalytics.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  PaymentAnalytics,
  PaymentStats,
  PaymentAnalyticsParams,
  WithdrawalRequest,
  PaymentCheckoutResponse,
} from '@/types/payment';

const log = (label: string, data: any) => {
  // console.group(`💰 [Payment Analytics] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const paymentAnalyticsApi = {
  // Get comprehensive payment analytics
  getPaymentAnalytics: async (params?: PaymentAnalyticsParams): Promise<PaymentAnalytics> => {
    log('Get Payment Analytics Request', params);
    try {
      const { data } = await apiClient.get('/payments/analytics/', { params });
      log('Get Payment Analytics Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Payment Analytics Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get quick payment stats
  getPaymentStats: async (): Promise<PaymentStats> => {
    log('Get Payment Stats Request', {});
    try {
      const { data } = await apiClient.get('/payments/stats/');
      log('Get Payment Stats Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Payment Stats Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (withdrawalData: WithdrawalRequest): Promise<any> => {
    log('Request Withdrawal', withdrawalData);
    try {
      const { data } = await apiClient.post('/payments/withdraw/', withdrawalData);
      log('Request Withdrawal Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Request Withdrawal Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create payment checkout
  createPaymentCheckout: async (paymentIntents: any[]): Promise<PaymentCheckoutResponse> => {
    log('Create Payment Checkout', paymentIntents);
    try {
      const { data } = await apiClient.post('/payments/checkout/', { payment_intents: paymentIntents });
      log('Create Payment Checkout Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Create Payment Checkout Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

/**
 * Hook to get comprehensive payment analytics
 * @param params - Optional parameters for filtering analytics data
 * @returns Payment analytics data including transactions, withdrawals, and insights
 */
export const usePaymentAnalytics = (params?: PaymentAnalyticsParams) => {
  return useQuery({
    queryKey: ['paymentAnalytics', params],
    queryFn: () => paymentAnalyticsApi.getPaymentAnalytics(params),
    staleTime: 60000, // Consider data fresh for 1 minute
    retry: 2,
  });
};

/**
 * Hook to get quick payment statistics
 * @returns Today's, this week's, and this month's payment stats
 */
export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['paymentStats'],
    queryFn: () => paymentAnalyticsApi.getPaymentStats(),
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
  });
};

/**
 * Hook to request a withdrawal
 * @returns Mutation function to request withdrawal
 */
export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentAnalyticsApi.requestWithdrawal,
    onSuccess: (data) => {
      log('useRequestWithdrawal Success', data);
      // Invalidate analytics to refresh balance
      queryClient.invalidateQueries({ queryKey: ['paymentAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStats'] });
    },
    onError: (error) => {
      // console.error('❌ useRequestWithdrawal Error:', error);
    },
  });
};

/**
 * Hook to get payment analytics with auto-refresh
 * Useful for dashboard where you want real-time updates
 */
export const usePaymentAnalyticsLive = (
  params?: PaymentAnalyticsParams,
  refreshInterval: number = 30000 // 30 seconds default
) => {
  return useQuery({
    queryKey: ['paymentAnalyticsLive', params],
    queryFn: () => paymentAnalyticsApi.getPaymentAnalytics(params),
    staleTime: refreshInterval / 2,
    refetchInterval: refreshInterval,
    retry: 2,
  });
};

/**
 * Hook to create payment checkout
 * @returns Mutation function to create payment checkout
 */
export const useCreatePaymentCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentAnalyticsApi.createPaymentCheckout,
    onSuccess: (data) => {
      log('useCreatePaymentCheckout Success', data);
      // Invalidate analytics to refresh data
      queryClient.invalidateQueries({ queryKey: ['paymentAnalytics'] });
    },
    onError: (error) => {
      // console.error('❌ useCreatePaymentCheckout Error:', error);
    },
  });
};

// Export the API functions for direct use if needed
export { paymentAnalyticsApi };