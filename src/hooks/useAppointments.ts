// src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Appointment,
  AppointmentFilters,
  AppointmentListResponse,
  CreateAppointmentData,
  UpdateAppointmentData,
  AvailableSlot,
  AvailableSlotsResponse,
} from '@/types/appointment';

const log = (label: string, data: any) => {
  // console.group(`📅 [Appointments] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const appointmentsApi = {
  // Get all appointments (with filters)
  getAppointments: async (filters?: AppointmentFilters): Promise<AppointmentListResponse> => {
    log('Get Appointments Request', filters);
    try {
      const { data } = await apiClient.get('/bookings/appointments/', { params: filters });
      log('Get Appointments Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Appointments Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get my appointments (current user)
  getMyAppointments: async (filters?: AppointmentFilters): Promise<AppointmentListResponse> => {
    log('Get My Appointments Request', filters);
    try {
      const { data } = await apiClient.get('/bookings/appointments/my_appointments/', { params: filters });
      log('Get My Appointments Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get My Appointments Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    log('Get Upcoming Appointments Request', {});
    try {
      const { data } = await apiClient.get('/bookings/appointments/upcoming/');
      log('Get Upcoming Appointments Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Upcoming Appointments Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get appointments by service and date
  getAppointmentsByServiceDate: async (serviceId: string, date: string): Promise<Appointment[]> => {
    log('Get Appointments By Service Date Request', { serviceId, date });
    try {
      const { data } = await apiClient.get('/bookings/appointments/by_service_date/', {
        params: { service_id: serviceId, date }
      });
      log('Get Appointments By Service Date Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Appointments By Service Date Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get appointments by provider and date
  getAppointmentsByProviderDate: async (providerId: string, date: string): Promise<Appointment[]> => {
    log('Get Appointments By Provider Date Request', { providerId, date });
    try {
      const { data } = await apiClient.get('/bookings/appointments/by_provider_date/', {
        params: { provider_id: providerId, date }
      });
      log('Get Appointments By Provider Date Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Appointments By Provider Date Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get single appointment details
  getAppointmentById: async (id: string): Promise<Appointment> => {
    log('Get Appointment By ID Request', { id });
    try {
      const { data } = await apiClient.get(`/bookings/appointments/${id}/`);
      log('Get Appointment By ID Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Appointment By ID Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available slots for a service on a specific date
  getAvailableSlots: async (serviceId: string, date: string): Promise<AvailableSlotsResponse> => {
    log('Get Available Slots Request', { serviceId, date });
    try {
      const { data } = await apiClient.get('/appointments/time-slots/available_slots/', {
        params: { service_id: serviceId, date }
      });
      log('Get Available Slots Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Available Slots Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create appointment
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    log('Create Appointment Request', appointmentData);
    try {
      const { data } = await apiClient.post('/bookings/appointments/', appointmentData);
      log('Create Appointment Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Create Appointment Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    log('Update Appointment Request', { id, appointmentData });
    try {
      const { data } = await apiClient.patch(`/bookings/appointments/${id}/`, appointmentData);
      log('Update Appointment Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Update Appointment Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete appointment
  deleteAppointment: async (id: string): Promise<void> => {
    log('Delete Appointment Request', { id });
    try {
      await apiClient.delete(`/bookings/appointments/${id}/`);
      log('Delete Appointment Response', 'Success');
    } catch (error: any) {
      // console.error('❌ Delete Appointment Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (id: string): Promise<Appointment> => {
    log('Cancel Appointment Request', { id });
    try {
      const { data } = await apiClient.post(`/bookings/appointments/${id}/cancel/`);
      log('Cancel Appointment Response', data);
      return data.appointment;
    } catch (error: any) {
      // console.error('❌ Cancel Appointment Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Confirm appointment (provider only)
  confirmAppointment: async (id: string): Promise<Appointment> => {
    log('Confirm Appointment Request', { id });
    try {
      const { data } = await apiClient.post(`/bookings/appointments/${id}/confirm/`);
      log('Confirm Appointment Response', data);
      return data.appointment;
    } catch (error: any) {
      // console.error('❌ Confirm Appointment Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Complete appointment (provider only)
  completeAppointment: async (id: string): Promise<Appointment> => {
    log('Complete Appointment Request', { id });
    try {
      const { data } = await apiClient.post(`/bookings/appointments/${id}/complete/`);
      log('Complete Appointment Response', data);
      return data.appointment;
    } catch (error: any) {
      // console.error('❌ Complete Appointment Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark appointment as no-show (provider only)
  markNoShow: async (id: string): Promise<Appointment> => {
    log('Mark No Show Request', { id });
    try {
      const { data } = await apiClient.post(`/bookings/appointments/${id}/no_show/`);
      log('Mark No Show Response', data);
      return data.appointment;
    } catch (error: any) {
      // console.error('❌ Mark No Show Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

// Get all appointments with filters
export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentsApi.getAppointments(filters),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

// Get my appointments (current user)
export const useMyAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['myAppointments', filters],
    queryFn: () => appointmentsApi.getMyAppointments(filters),
    staleTime: 30000,
  });
};

// Get upcoming appointments
export const useUpcomingAppointments = () => {
  return useQuery({
    queryKey: ['upcomingAppointments'],
    queryFn: () => appointmentsApi.getUpcomingAppointments(),
    staleTime: 60000, // 1 minute
  });
};

// Get appointments by service and date
export const useAppointmentsByServiceDate = (serviceId: string, date: string) => {
  return useQuery({
    queryKey: ['appointmentsByServiceDate', serviceId, date],
    queryFn: () => appointmentsApi.getAppointmentsByServiceDate(serviceId, date),
    enabled: !!serviceId && !!date,
    staleTime: 30000,
  });
};

// Get appointments by provider and date
export const useAppointmentsByProviderDate = (providerId: string, date: string) => {
  return useQuery({
    queryKey: ['appointmentsByProviderDate', providerId, date],
    queryFn: () => appointmentsApi.getAppointmentsByProviderDate(providerId, date),
    enabled: !!providerId && !!date,
    staleTime: 30000,
  });
};

// Get single appointment details
export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.getAppointmentById(id),
    enabled: !!id,
    retry: 2,
    staleTime: 30000,
  });
};

// Get available slots
export const useAvailableSlots = (serviceId: string, date: string) => {
  return useQuery({
    queryKey: ['availableSlots', serviceId, date],
    queryFn: () => appointmentsApi.getAvailableSlots(serviceId, date),
    enabled: !!serviceId && !!date,
    staleTime: 60000, // 1 minute
  });
};

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.createAppointment,
    onSuccess: (data) => {
      log('useCreateAppointment Success', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    },
    onError: (error) => {
      // console.error('❌ useCreateAppointment Error:', error);
    },
  });
};

// Update appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) =>
      appointmentsApi.updateAppointment(id, data),
    onSuccess: (data) => {
      log('useUpdateAppointment Success', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
    },
    onError: (error) => {
      // console.error('❌ useUpdateAppointment Error:', error);
    },
  });
};

// Delete appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.deleteAppointment,
    onSuccess: (_, id) => {
      log('useDeleteAppointment Success', id);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
      queryClient.removeQueries({ queryKey: ['appointment', id] });
    },
    onError: (error) => {
      // console.error('❌ useDeleteAppointment Error:', error);
    },
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.cancelAppointment,
    onSuccess: (data) => {
      log('useCancelAppointment Success', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    },
    onError: (error) => {
      // console.error('❌ useCancelAppointment Error:', error);
    },
  });
};

// Confirm appointment
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.confirmAppointment,
    onSuccess: (data) => {
      log('useConfirmAppointment Success', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
    },
    onError: (error) => {
      // console.error('❌ useConfirmAppointment Error:', error);
    },
  });
};

// Complete appointment
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.completeAppointment,
    onSuccess: (data) => {
      log('useCompleteAppointment Success', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
    },
    onError: (error) => {
      // console.error('❌ useCompleteAppointment Error:', error);
    },
  });
};

// Mark as no-show
export const useMarkNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.markNoShow,
    onSuccess: (data) => {
      log('useMarkNoShow Success', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByServiceDate'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentsByProviderDate'] });
    },
    onError: (error) => {
      // console.error('❌ useMarkNoShow Error:', error);
    },
  });
};