// src/hooks/useWebPush.ts
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// VAPID public key - you'll need to get this from your Django backend
// For now, we'll use a placeholder
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Convert base64 string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  if (!base64String || base64String.trim() === '') {
    throw new Error('VAPID public key is empty or not configured');
  }

  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  } catch (error) {
    throw new Error('Invalid VAPID public key format. Please check your configuration.');
  }
}

// API Functions
const webPushApi = {
  // Subscribe to web push
  subscribe: async (subscription: PushSubscription) => {
    const { data } = await apiClient.post('/accounts/provider/web-push-subscribe/', subscription.toJSON());
    return data;
  },

  // Unsubscribe from web push
  unsubscribe: async () => {
    const { data } = await apiClient.delete('/accounts/provider/web-push-subscribe/');
    return data;
  },

  // Get subscription status
  getStatus: async () => {
    const { data } = await apiClient.get('/accounts/provider/web-push-subscribe/');
    return data;
  },
};

// Check if web push is supported
export const isPushSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

// Hook for managing web push notifications
export const useWebPush = () => {
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check subscription status from backend
  const { data: statusData } = useQuery({
    queryKey: ['webPushStatus'],
    queryFn: webPushApi.getStatus,
    enabled: isPushSupported(),
    retry: 1,
  });

  // Update permission state
  useEffect(() => {
    if (isPushSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check local subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isPushSupported()) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
        setIsSubscribed(!!sub);
      } catch (err: any) {
        // console.error('Error checking subscription:', err);
        setError(err.message);
      }
    };

    checkSubscription();
  }, []);

  // Register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
    if (!isPushSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      // console.log('Service Worker registered:', registration);
      return registration;
    } catch (err: any) {
      // console.error('Service Worker registration failed:', err);
      throw new Error(`Service Worker registration failed: ${err.message}`);
    }
  };

  // Request notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isPushSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      // Register service worker
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;

      // Subscribe to push manager
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });


      // Send subscription to backend
      await webPushApi.subscribe(sub);

      setSubscription(sub);
      setIsSubscribed(true);
      setError(null);

      return sub;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webPushStatus'] });
    },
    onError: (err: any) => {
      // console.error('Subscription error:', err);
      setError(err.message);
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) {
        throw new Error('No active subscription');
      }

      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Remove subscription from backend
      await webPushApi.unsubscribe();

      setSubscription(null);
      setIsSubscribed(false);
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webPushStatus'] });
    },
    onError: (err: any) => {
      // console.error('Unsubscribe error:', err);
      setError(err.message);
    },
  });

  // Subscribe function
  const subscribe = useCallback(() => {
    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID public key is not configured. Please add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your .env file.');
      return;
    }
    subscribeMutation.mutate();
  }, [subscribeMutation]);

  // Unsubscribe function
  const unsubscribe = useCallback(() => {
    unsubscribeMutation.mutate();
  }, [unsubscribeMutation]);

  return {
    // State
    isSupported: isPushSupported(),
    permission,
    isSubscribed,
    subscription,
    error,
    backendStatus: statusData,

    // Actions
    subscribe,
    unsubscribe,
    requestPermission,

    // Loading states
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  };
};

// Hook to auto-subscribe on mount (optional)
export const useAutoWebPush = (autoSubscribe = false) => {
  const webPush = useWebPush();

  useEffect(() => {
    if (autoSubscribe && webPush.isSupported && !webPush.isSubscribed && webPush.permission === 'default') {
      // Optionally auto-request permission (be careful with UX)
      // webPush.subscribe();
    }
  }, [autoSubscribe, webPush]);

  return webPush;
};
