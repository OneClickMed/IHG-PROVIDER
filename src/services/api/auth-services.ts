// src/services/api/auth.service.ts
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
}

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-App-Source': 'provider-app',
      'ngrok-skip-browser-warning': 'true', // Required for ngrok free tier
    };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.detail || data.message || 'An error occurred';
      throw new Error(errorMessage);
    }

    return data;
  }
}

const apiClient = new ApiClient();

// Auth API functions
export const authApi = {
  // Request password reset OTP
  requestPasswordReset: async (email: string) => {
    return apiClient.request('/api/accounts/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify reset OTP code
  verifyResetCode: async (email: string, code: string) => {
    return apiClient.request('/api/accounts/verify-reset-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  // Reset password with OTP
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const body = { email, code, new_password: newPassword };
    return apiClient.request('/api/accounts/reset-password/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Resend OTP
  resendOtp: async (email: string) => {
    return apiClient.request('/api/accounts/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Get provider profile
  getProviderProfile: async () => {
    return apiClient.request('/api/accounts/profile/provider/', {
      method: 'GET',
    });
  },

  // Update provider profile
  updateProviderProfile: async (data: any) => {
    return apiClient.request('/api/accounts/profile/provider/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
