// src/hooks/useWithdrawals.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Withdrawal,
  WithdrawalRequest,
  WithdrawalResponse,
  WithdrawalListResponse,
  WithdrawalDetailsResponse,
  AvailableBalance,
  AvailablePaymentsResponse,
  PaymentIntent,
} from '@/types/payment';

// API Functions
const withdrawalApi = {
  // Get available balance
  getBalance: async (): Promise<AvailableBalance> => {
    try {
      const { data } = await apiClient.get('/payments/balance/');
      return data;
    } catch (error: any) {
      // console.error('❌ Get Balance Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available payments for withdrawal
  getAvailablePayments: async (params?: { status?: string; paid_out?: boolean }): Promise<PaymentIntent[]> => {
    try {
      const { data } = await apiClient.get('/payments/available-for-withdrawal/', { params });
      // Handle different response formats
      if (data.payments) return data.payments;
      if (data.available_payments) return data.available_payments;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error: any) {
      // console.error('❌ Get Available Payments Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all withdrawals
  getWithdrawals: async (status?: string): Promise<WithdrawalListResponse> => {
    try {
      const { data } = await apiClient.get('/payments/withdrawals/', {
        params: status ? { status } : undefined,
      });
      return data;
    } catch (error: any) {
      // console.error('❌ Get Withdrawals Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get withdrawal details
  getWithdrawalDetails: async (id: number): Promise<WithdrawalDetailsResponse> => {
    try {
      const { data } = await apiClient.get(`/payments/withdrawals/${id}/`);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Withdrawal Details Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
    try {
      const { data } = await apiClient.post('/payments/withdrawals/request/', request);
      return data;
    } catch (error: any) {
      // console.error('❌ Request Withdrawal Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancel withdrawal
  cancelWithdrawal: async (id: number): Promise<{ message: string; withdrawal: Withdrawal }> => {
    try {
      const { data } = await apiClient.post(`/payments/withdrawals/${id}/cancel/`);
      return data;
    } catch (error: any) {
      // console.error('❌ Cancel Withdrawal Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

/**
 * Hook to get available balance
 */
export const useAvailableBalance = () => {
  return useQuery({
    queryKey: ['availableBalance'],
    queryFn: () => withdrawalApi.getBalance(),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
};

/**
 * Hook to get available payments for withdrawal
 * @param params - Optional filters (status, paid_out)
 */
export const useAvailablePayments = (params?: { status?: string; paid_out?: boolean }) => {
  // Default to SUCCESS payments that haven't been paid out
  const queryParams = params || { status: 'SUCCESS', paid_out: false };


    return useQuery({
    queryKey: ['available-for-withdrawals', queryParams],
    queryFn: () => withdrawalApi.getAvailablePayments(queryParams),
    staleTime: 0, // Always consider data stale - refetch on mount
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2,
  });
};

/**
 * Hook to get withdrawals list
 * @param status - Optional status filter
 */
export const useWithdrawals = (status?: string) => {
  return useQuery({
    queryKey: ['withdrawals', status],
    queryFn: () => withdrawalApi.getWithdrawals(status),
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

/**
 * Hook to get withdrawal details
 * @param id - Withdrawal ID
 */
export const useWithdrawalDetails = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['withdrawal', id],
    queryFn: () => withdrawalApi.getWithdrawalDetails(id),
    enabled,
    staleTime: 60000,
    retry: 2,
  });
};

/**
 * Hook to request withdrawal
 */
export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawalApi.requestWithdrawal,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['availableBalance'] });
      queryClient.invalidateQueries({ queryKey: ['availablePayments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentAnalytics'] });
    },
  });
};

/**
 * Hook to cancel withdrawal
 */
export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawalApi.cancelWithdrawal,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['availableBalance'] });
    },
  });
};

// Export API functions
export { withdrawalApi };
