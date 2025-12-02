// src/hooks/useServices.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Service,
  ServiceFilters,
  ServiceListResponse,
  CreateServiceData,
  UpdateServiceData,
} from '@/types/service';

const log = (label: string, data: any) => {
  // console.group(`🔧 [Services] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const servicesApi = {
  // Get all services (with filters)
  getServices: async (filters?: ServiceFilters): Promise<ServiceListResponse> => {
    log('Get Services Request', filters);
    try {
      const { data } = await apiClient.get('/services/services/', { params: filters });
      log('Get Services Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Services Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current provider's services
  getProviderServices: async (providerId: string, filters?: ServiceFilters): Promise<ServiceListResponse> => {
    log('Get Provider Services Request', { providerId, filters });
    try {
      const { data } = await apiClient.get(`/services/services/provider/${providerId}/`, { params: filters });
      log('Get Provider Services Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Provider Services Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get single service details
  getServiceById: async (id: string): Promise<Service> => {
    log('Get Service By ID Request', { id });
    try {
      const { data } = await apiClient.get(`/services/services/${id}/`);
      log('Get Service By ID Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Service By ID Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create service (provider only)
  createService: async (serviceData: CreateServiceData): Promise<Service> => {
    log('Create Service Request', serviceData);
    try {
      const { data } = await apiClient.post('/services/services/', serviceData);
      log('Create Service Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Create Service Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update service (provider only)
  updateService: async (id: string, serviceData: UpdateServiceData): Promise<Service> => {
    log('Update Service Request', { id, serviceData });
    try {
      const { data } = await apiClient.patch(`/services/services/${id}/`, serviceData);
      log('Update Service Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Update Service Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete service (provider only)
  deleteService: async (id: string): Promise<void> => {
    log('Delete Service Request', { id });
    try {
      await apiClient.delete(`/services/services/${id}/`);
      log('Delete Service Response', 'Success');
    } catch (error: any) {
      // console.error('❌ Delete Service Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle service status (activate/deactivate)
  toggleServiceStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Service> => {
    log('Toggle Service Status Request', { id, status });
    try {
      const { data } = await apiClient.patch(`/services/services/${id}/`, { status });
      log('Toggle Service Status Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Toggle Service Status Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

// Get all services with filters
export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => servicesApi.getServices(filters),
  });
};

// Get current provider's services
export const useProviderServices = (providerId: string, filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['providerServices', providerId, filters],
    queryFn: () => servicesApi.getProviderServices(providerId, filters),
    enabled: !!providerId,
  });
};

// Get single service details
export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getServiceById(id),
    enabled: !!id,
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

// Get single service details (alternative name for clarity)
export const useServiceDetails = (id: string) => {
  return useQuery({
    queryKey: ['serviceDetails', id],
    queryFn: () => servicesApi.getServiceById(id),
    enabled: !!id,
    retry: 2,
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: servicesApi.createService,
    onSuccess: (data) => {
      log('useCreateService Success', data);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
    },
    onError: (error) => {
      // console.error('❌ useCreateService Error:', error);
    },
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceData }) =>
      servicesApi.updateService(id, data),
    onSuccess: (data) => {
      log('useUpdateService Success', data);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
      queryClient.invalidateQueries({ queryKey: ['service', data.id] });
      queryClient.invalidateQueries({ queryKey: ['serviceDetails', data.id] });
    },
    onError: (error) => {
      // console.error('❌ useUpdateService Error:', error);
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: servicesApi.deleteService,
    onSuccess: (_, id) => {
      log('useDeleteService Success', id);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
      queryClient.removeQueries({ queryKey: ['service', id] });
      queryClient.removeQueries({ queryKey: ['serviceDetails', id] });
    },
    onError: (error) => {
      // console.error('❌ useDeleteService Error:', error);
    },
  });
};

// Toggle service status
export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      servicesApi.toggleServiceStatus(id, status),
    onSuccess: (data, variables) => {
      log('useToggleServiceStatus Success', data);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['serviceDetails', variables.id] });
    },
    onError: (error) => {
      // console.error('❌ useToggleServiceStatus Error:', error);
    },
  });
};