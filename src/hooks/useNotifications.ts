// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// Types
export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export interface NotificationListResponse {
  count: number;
  next: boolean;
  offset: number;
  page_size: number;
  results: Notification[];
}

export interface UnreadCountResponse {
  unread_count: number;
}

const log = (label: string, data: any) => {
  // console.group(`🔔 [Notifications] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const notificationsApi = {
  // Get all notifications with pagination
  getNotifications: async (params?: {
    offset?: number;
    page_size?: number;
    notification_type?: string;
    is_read?: boolean;
  }): Promise<NotificationListResponse> => {
    log('Get Notifications Request', params);
    try {
      const { data } = await apiClient.get('/notifications/', {
        params
      });
      log('Get Notifications Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Notifications Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    log('Get Unread Count Request', {});
    try {
      const { data } = await apiClient.get('/notifications/unread_count/');
      log('Get Unread Count Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Unread Count Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get notifications by type
  getNotificationsByType: async (params: {
    type: string;
    offset?: number;
    page_size?: number;
  }): Promise<NotificationListResponse> => {
    log('Get Notifications By Type Request', params);
    try {
      const { data } = await apiClient.get('/notifications/by_type/', {
        params
      });
      log('Get Notifications By Type Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Notifications By Type Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    log('Mark As Read Request', { notificationId });
    try {
      const { data } = await apiClient.patch(`/notifications/${notificationId}/mark_as_read/`);
      log('Mark As Read Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Mark As Read Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    log('Mark All As Read Request', {});
    try {
      const { data } = await apiClient.patch('/notifications/mark_all_as_read/');
      log('Mark All As Read Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Mark All As Read Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks

// Get all notifications with optional filters
export const useNotifications = (params?: {
  offset?: number;
  page_size?: number;
  notification_type?: string;
  is_read?: boolean;
}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 30000, // 30 seconds
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notificationsUnreadCount'],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get notifications by type
export const useNotificationsByType = (type: string, params?: {
  offset?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: ['notificationsByType', type, params],
    queryFn: () => notificationsApi.getNotificationsByType({ type, ...params }),
    enabled: !!type,
    staleTime: 30000,
  });
};

// Mark single notification as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      // Invalidate provider profile to update notification count in header
      queryClient.invalidateQueries({ queryKey: ['providerProfile'] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      // Invalidate provider profile to update notification count in header
      queryClient.invalidateQueries({ queryKey: ['providerProfile'] });
    },
  });
};