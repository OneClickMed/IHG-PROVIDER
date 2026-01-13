// src/lib/api-client.ts 
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Source': 'provider-app',
    'ngrok-skip-browser-warning': 'true', // Required for ngrok free tier
  },
});

// Request interceptor to add auth token from NextAuth session
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the NextAuth session (works both client and server side)
      const session = await getSession();

      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
        // console.log('🔑 [API Client] Auth token added to:', config.url);
      } else {
        // console.warn('⚠️ [API Client] No access token found for:', config.url);
      }
    } catch (error) {
      // console.error('❌ [API Client] Error getting session:', error);
    }

    return config;
  },
  (error) => {
    // console.error('❌ [API Client] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // console.log('✅ [API Client]', response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    /*
    console.error('❌ [API Client] Response error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    */

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // If we haven't tried to refresh yet
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // console.log('🔄 [API Client] Attempting token refresh...');
          
          // Get the current session
          const session = await getSession();
          
          if (!session?.refreshToken) {
            throw new Error('No refresh token available');
          }

          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: session.refreshToken,
          }, {
            headers: {
              'X-App-Source': 'provider-app',
              'ngrok-skip-browser-warning': 'true', // Required for ngrok free tier
            },
          });

          const { access } = response.data;
          
          // console.log('✅ [API Client] Token refreshed successfully');

          // Update the authorization header with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }

          // Note: You'll need to update the session with the new token
          // This requires a custom session update mechanism or re-authentication
          // For now, we'll just retry with the new token
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // console.error('❌ [API Client] Token refresh failed:', refreshError);
          
          // Sign out the user and redirect to login
          // console.log('🚪 [API Client] Signing out user...');
          await signOut({ redirect: true, callbackUrl: '/login' });
          
          return Promise.reject(refreshError);
        }
      }
      
      // If we already tried to refresh, sign out
      // console.log('🚪 [API Client] Already tried refresh, signing out...');
      await signOut({ redirect: true, callbackUrl: '/login' });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
