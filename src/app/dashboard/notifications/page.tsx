// src/pages/NotificationsPage.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead 
} from '@/hooks/useNotifications';
import { 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CheckCheck,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function NotificationsPage() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);

  const { data, isLoading, error } = useNotifications({
    offset,
    page_size: pageSize,
    ...(filterType && { notification_type: filterType }),
    ...(filterRead !== undefined && { is_read: filterRead }),
  });

  const { data: unreadData } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      // console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      // console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNextPage = () => {
    if (data && offset + pageSize < data.count) {
      setOffset(offset + pageSize);
    }
  };

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - pageSize));
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <PageSkeleton type="list" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Error loading notifications. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
                  <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                {unreadData && unreadData.unread_count > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {unreadData.unread_count} unread notification{unreadData.unread_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter by type */}
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setOffset(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="appointment">Appointments</option>
                <option value="alert">Alerts</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
              </select>

              {/* Filter by read status */}
              <select
                value={filterRead === undefined ? 'all' : filterRead ? 'read' : 'unread'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterRead(value === 'all' ? undefined : value === 'read');
                  setOffset(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              {/* Mark all as read */}
              {unreadData && unreadData.unread_count > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

        <div className="bg-white border border-gray-200 rounded-lg  p-6 mb-6">

          {/* Notifications List */}
          <div className="space-y-2">
            {!data || data.results?.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications found</p>
              </div>
            ) : (
              data.results?.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-sm p-4 transition-all  cursor-pointer ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => router.push(`/dashboard/notifications/${notification.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-gray-500">
                              {formatDateTime(notification.created_at)}
                            </p>
                 
                          </div>
                        </div>

                        {/* Mark as read button */}
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            disabled={markAsReadMutation.isPending}
                            className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {data && data.results?.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 min-w-12">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setOffset(0);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {offset + 1}-{Math.min(offset + pageSize, data.count)} of {data.count}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={offset === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!data.next}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}