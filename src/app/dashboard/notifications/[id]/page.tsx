// src/pages/NotificationDetailPage.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useMarkAsRead } from '@/hooks/useNotifications';
import {
  ChevronLeft,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Tag,
  FileText
} from 'lucide-react';
import PageSkeleton from '@/components/ui/PageSkeleton';

interface NotificationDetail {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export default function NotificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const notificationId = params?.id as string;
  const markAsReadMutation = useMarkAsRead();

  // Fetch single notification
  const { data: notification, isLoading, error } = useQuery({
    queryKey: ['notification', notificationId],
    queryFn: async (): Promise<NotificationDetail> => {
      const { data } = await apiClient.get(`/notifications/${notificationId}/`);
      return data;
    },
    enabled: !!notificationId,
  });

  // Mark as read when viewing
  useEffect(() => {
    if (notification && !notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  }, [notification?.id]);

  const formatFullDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getNotificationIcon = (type: string) => {
    return null
    switch (type) {
      case 'appointment':
        return <Calendar className="w-8 h-8 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return <Info className="w-8 h-8 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    return 'bg-gray-100 text-gray-800';
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <PageSkeleton type="detail" />;
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg  p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Notification Details</h1>
            </div>
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600">Failed to load notification. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-white   p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Notification Details</h1>
          </div>

          {/* Notification Card */}
          <div className={`border rounded-lg p-6 ${getNotificationColor(notification.notification_type)}`}>
            <div className="flex items-start gap-4 mb-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.notification_type)}
              </div>

              {/* Title and Status */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {notification.title}
                  </h2>

                </div>
                
                {/* Type Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(notification.notification_type)}`}>
                    {notification.notification_type.charAt(0).toUpperCase() + notification.notification_type.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 pl-12">
              <Clock className="w-4 h-4" />
              <span>{formatFullDateTime(notification.created_at)}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 my-6"></div>

            {/* Message */}
            <div className="pl-12">
              <div className="flex items-start gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <h3 className="text-lg font-medium text-gray-900">Message</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {/* Additional Data */}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <>
                <div className="border-t border-gray-300 my-6"></div>
                <div className="pl-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <dl className="space-y-3">
                      {Object.entries(notification.data).map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:gap-4">
                          <dt className="font-medium text-gray-700 min-w-[150px] capitalize">
                            {key.replace(/_/g, ' ')}:
                          </dt>
                          <dd className="text-gray-900 mt-1 sm:mt-0">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Notifications
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}