// src/hooks/useTimeSlots.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface TimeSlot {
  id: string;
  service: string;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_active: boolean;
}

export interface CreateTimeSlotData {
  service: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface UpdateTimeSlotData {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

const log = (label: string, data: any) => {
  // console.group(`⏰ [TimeSlots] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const timeSlotsApi = {
  // Get time slots by service
  getTimeSlotsByService: async (serviceId: string): Promise<TimeSlot[]> => {
    log('Get Time Slots By Service Request', { serviceId });
    try {
      const { data } = await apiClient.get('/bookings/time-slots/by_service/', {
        params: { service_id: serviceId }
      });
      log('Get Time Slots By Service Response', data);
      // Ensure we return an array even if data is undefined or null
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      // console.error('❌ Get Time Slots By Service Error:', error.response?.data || error.message);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  // Get single time slot
  getTimeSlot: async (id: string): Promise<TimeSlot> => {
    log('Get Time Slot Request', { id });
    try {
      const { data } = await apiClient.get(`/bookings/time-slots/${id}/`);
      log('Get Time Slot Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Time Slot Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create time slot
  createTimeSlot: async (timeSlotData: CreateTimeSlotData): Promise<TimeSlot> => {
    log('Create Time Slot Request', timeSlotData);
    try {
      const { data } = await apiClient.post('/bookings/time-slots/', timeSlotData);
      log('Create Time Slot Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Create Time Slot Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update time slot
  updateTimeSlot: async (id: string, timeSlotData: UpdateTimeSlotData): Promise<TimeSlot> => {
    log('Update Time Slot Request', { id, timeSlotData });
    try {
      const { data } = await apiClient.patch(`/bookings/time-slots/${id}/`, timeSlotData);
      log('Update Time Slot Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Update Time Slot Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete time slot
  deleteTimeSlot: async (id: string): Promise<void> => {
    log('Delete Time Slot Request', { id });
    try {
      await apiClient.delete(`/bookings/time-slots/${id}/`);
      log('Delete Time Slot Response', 'Success');
    } catch (error: any) {
      // console.error('❌ Delete Time Slot Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

// Get time slots by service
export const useTimeSlotsByService = (serviceId: string) => {
  return useQuery({
    queryKey: ['timeSlots', 'service', serviceId],
    queryFn: () => timeSlotsApi.getTimeSlotsByService(serviceId),
    enabled: !!serviceId,
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once on failure
  });
};

// Get single time slot
export const useTimeSlot = (id: string) => {
  return useQuery({
    queryKey: ['timeSlot', id],
    queryFn: () => timeSlotsApi.getTimeSlot(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create time slot
export const useCreateTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeSlotsApi.createTimeSlot,
    onSuccess: (data) => {
      log('useCreateTimeSlot Success', data);
      queryClient.invalidateQueries({ queryKey: ['timeSlots', 'service', data.service] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    },
    onError: (error) => {
      // console.error('❌ useCreateTimeSlot Error:', error);
    },
  });
};

// Update time slot
export const useUpdateTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeSlotData }) =>
      timeSlotsApi.updateTimeSlot(id, data),
    onSuccess: (data) => {
      log('useUpdateTimeSlot Success', data);
      queryClient.invalidateQueries({ queryKey: ['timeSlots', 'service', data.service] });
      queryClient.invalidateQueries({ queryKey: ['timeSlot', data.id] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    },
    onError: (error) => {
      // console.error('❌ useUpdateTimeSlot Error:', error);
    },
  });
};

// Delete time slot
export const useDeleteTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timeSlotsApi.deleteTimeSlot,
    onSuccess: (_, id) => {
      log('useDeleteTimeSlot Success', id);
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.removeQueries({ queryKey: ['timeSlot', id] });
    },
    onError: (error) => {
      // console.error('❌ useDeleteTimeSlot Error:', error);
    },
  });
};