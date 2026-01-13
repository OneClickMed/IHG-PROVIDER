// src/components/notifications/WebPushToggle.tsx
'use client';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { useWebPush } from '@/hooks/useWebPush';

export default function WebPushToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
    isSubscribing,
    isUnsubscribing,
  } = useWebPush();

  // Don't show if not supported
  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Push notifications not supported</p>
            <p className="text-xs">Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show permission denied message
  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Notifications blocked</p>
            <p className="text-xs">You've blocked notifications. To enable them, go to your browser settings and allow notifications for this site.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Error</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isSubscribed ? (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BellOff className="w-5 h-5 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              {isSubscribed
                ? 'You are receiving push notifications for new bookings, messages, and updates.'
                : 'Enable push notifications to get instant alerts for new bookings, messages, and important updates.'}
            </p>

            {isSubscribed && (
              <div className="mt-3 inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {isSubscribed ? (
            <button
              onClick={unsubscribe}
              disabled={isUnsubscribing}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnsubscribing ? 'Disabling...' : 'Disable'}
            </button>
          ) : (
            <button
              onClick={subscribe}
              disabled={isSubscribing}
              className="px-4 py-2 text-sm font-medium text-white bg-[#005994] rounded-lg hover:bg-[#004070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Enable Notifications
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Additional info */}
      {!isSubscribed && permission === 'default' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            You'll be asked to allow notifications when you click "Enable Notifications".
          </p>
        </div>
      )}
    </div>
  );
}
