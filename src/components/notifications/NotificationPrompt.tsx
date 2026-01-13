// src/components/notifications/NotificationPrompt.tsx
'use client';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useWebPush } from '@/hooks/useWebPush';

export default function NotificationPrompt() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isSupported, permission, isSubscribed, subscribe, isSubscribing } = useWebPush();

  // Check if user has dismissed the prompt before
  useEffect(() => {
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Don't show if:
  // - Not supported
  // - Already subscribed
  // - Permission denied
  // - User dismissed
  if (
    !isSupported ||
    isSubscribed ||
    permission === 'denied' ||
    isDismissed
  ) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#005994] to-[#003d6b] rounded-lg p-4 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">Stay Updated with Push Notifications</h3>
            <p className="text-sm text-white/90 mt-1">
              Get instant alerts for new bookings, messages, and important updates even when you're not on the site.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={subscribe}
                disabled={isSubscribing}
                className="px-4 py-2 text-sm font-medium text-[#005994] bg-white rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Enabling...' : 'Enable Notifications'}
              </button>

              <button
                onClick={handleDismiss}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
