// src/hooks/useDiscounts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Discount, CreateDiscountData, UpdateDiscountData } from '@/types/discount';

const log = (label: string, data: any) => {
  // console.group(`🎁 [Discounts] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const discountsApi = {
  // Get all discounts for a service
  getDiscounts: async (serviceId: string): Promise<Discount[]> => {
    log('Get Discounts Request', { serviceId });
    try {
      const { data } = await apiClient.get(`/services/services/${serviceId}/discounts/`);
      log('Get Discounts Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Discounts Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get single discount details
  getDiscountById: async (serviceId: string, discountId: string): Promise<Discount> => {
    log('Get Discount By ID Request', { serviceId, discountId });
    try {
      const { data } = await apiClient.get(`/services/services/${serviceId}/discounts/${discountId}/`);
      log('Get Discount By ID Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Discount By ID Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create discount
  createDiscount: async (serviceId: string, discountData: CreateDiscountData): Promise<Discount> => {
    log('Create Discount Request', { serviceId, discountData });
    try {
      const { data } = await apiClient.post(`/services/services/${serviceId}/discounts/`, discountData);
      log('Create Discount Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Create Discount Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update discount
  updateDiscount: async (
    serviceId: string,
    discountId: string,
    discountData: UpdateDiscountData
  ): Promise<Discount> => {
    log('Update Discount Request', { serviceId, discountId, discountData });
    try {
      const { data } = await apiClient.patch(
        `/services/services/${serviceId}/discounts/${discountId}/`,
        discountData
      );
      log('Update Discount Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Update Discount Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete discount
  deleteDiscount: async (serviceId: string, discountId: string): Promise<void> => {
    log('Delete Discount Request', { serviceId, discountId });
    try {
      await apiClient.delete(`/services/services/${serviceId}/discounts/${discountId}/`);
      log('Delete Discount Response', 'Success');
    } catch (error: any) {
      // console.error('❌ Delete Discount Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

// Get all discounts for a service
export const useDiscounts = (serviceId: string) => {
  return useQuery({
    queryKey: ['discounts', serviceId],
    queryFn: () => discountsApi.getDiscounts(serviceId),
    enabled: !!serviceId,
  });
};

// Get single discount details
export const useDiscount = (serviceId: string, discountId: string) => {
  return useQuery({
    queryKey: ['discount', serviceId, discountId],
    queryFn: () => discountsApi.getDiscountById(serviceId, discountId),
    enabled: !!serviceId && !!discountId,
  });
};

// Create discount
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: CreateDiscountData }) =>
      discountsApi.createDiscount(serviceId, data),
    onSuccess: (data, variables) => {
      log('useCreateDiscount Success', data);
      queryClient.invalidateQueries({ queryKey: ['discounts', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      // console.error('❌ useCreateDiscount Error:', error);
    },
  });
};

// Update discount
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      discountId,
      data,
    }: {
      serviceId: string;
      discountId: string;
      data: UpdateDiscountData;
    }) => discountsApi.updateDiscount(serviceId, discountId, data),
    onSuccess: (data, variables) => {
      log('useUpdateDiscount Success', data);
      queryClient.invalidateQueries({ queryKey: ['discounts', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.serviceId, variables.discountId] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      // console.error('❌ useUpdateDiscount Error:', error);
    },
  });
};

// Delete discount
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, discountId }: { serviceId: string; discountId: string }) =>
      discountsApi.deleteDiscount(serviceId, discountId),
    onSuccess: (_, variables) => {
      log('useDeleteDiscount Success', variables);
      queryClient.invalidateQueries({ queryKey: ['discounts', variables.serviceId] });
      queryClient.removeQueries({ queryKey: ['discount', variables.serviceId, variables.discountId] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      // console.error('❌ useDeleteDiscount Error:', error);
    },
  });
};