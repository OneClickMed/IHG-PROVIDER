import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import apiClient from '@/lib/api-client';
import {
  LoginCredentials,
  RegisterData,
  VerifyOTPData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthTokens,
  User,
  ProviderProfile,
} from '@/types/auth';

const log = (label: string, data: any) => {
  // console.group(`🔐 [Auth] ${label}`);
  // console.log(data);
  // console.groupEnd();
};

// API Functions
const authApi = {
  // STEP 1: Request OTP
  login: async (credentials: LoginCredentials): Promise<{ message: string; email: string }> => {
    log('Login Request', credentials);
    try {
      const { data } = await apiClient.post('/accounts/request-otp/', credentials);
      log('Login Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Login Error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (registerData: RegisterData) => {
    log('Register Request', registerData);
    try {
      const { data } = await apiClient.post('/accounts/register/', registerData);
      log('Register Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Register Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // STEP 2: Verify OTP
  verifyOTP: async (otpData: VerifyOTPData): Promise<AuthTokens & { user: User }> => {
    log('Verify OTP Request', otpData);
    try {
      const { data } = await apiClient.post('/accounts/verify-otp/', otpData);
      log('Verify OTP Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Verify OTP Error:', error.response?.data || error.message);
      throw error;
    }
  },

  resendOTP: async (email: string) => {
    log('Resend OTP Request', { email });
    try {
      const { data } = await apiClient.post('/accounts/resend-otp/', { email });
      log('Resend OTP Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Resend OTP Error:', error.response?.data || error.message);
      throw error;
    }
  },

  forgotPassword: async (email: ForgotPasswordData) => {
    log('Forgot Password Request', email);
    try {
      const { data } = await apiClient.post('/accounts/forgot-password/', email);
      log('Forgot Password Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Forgot Password Error:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyResetOTP: async (otpData: VerifyOTPData) => {
    log('Verify Reset OTP Request', otpData);
    try {
      const { data } = await apiClient.post('/accounts/verify-reset-otp/', otpData);
      log('Verify Reset OTP Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Verify Reset OTP Error:', error.response?.data || error.message);
      throw error;
    }
  },

  resetPassword: async (resetData: ResetPasswordData) => {
    log('Reset Password Request', resetData);
    try {
      const { data } = await apiClient.post('/accounts/reset-password/', resetData);
      log('Reset Password Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Reset Password Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getProviderProfile: async (): Promise<ProviderProfile> => {
    log('Get Provider Profile Request', null);
    try {
      const { data } = await apiClient.get('/accounts/profile/provider/');
      log('Get Provider Profile Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Get Provider Profile Error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProviderProfile: async (profileData: Partial<ProviderProfile>): Promise<ProviderProfile> => {
    log('Update Provider Profile Request', profileData);
    try {
      const { data } = await apiClient.patch('/accounts/profile/provider/', profileData);
      log('Update Provider Profile Response', data);
      return data;
    } catch (error: any) {
      // console.error('❌ Update Provider Profile Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Custom Hooks
export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      log('useLogin Success', data);
      router.push(`/login?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error) => {
      // console.error('❌ useLogin Error:', error);
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      log('useRegister Success', data);
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error) => {
      // console.error('❌ useRegister Error:', error);
    },
  });
};

export const useVerifyOTP = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyOTP,
    onSuccess: async (data) => {
      log('useVerifyOTP Success', data);

      // Store tokens in localStorage for API calls
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      queryClient.setQueryData(['user'], data.user);

      // Check if user is a provider
      if (data.user.isProvider || data.user.isCustomer === false) {
        // Sign in with NextAuth
        const result = await signIn('credentials', {
          email: data.user.email,
          code: JSON.stringify(data), // Pass the entire response
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
        } else {
          // console.error('NextAuth sign in failed:', result?.error);
          router.push('/login?error=auth_failed');
        }
      } else {
        router.push('/login?error=not_provider');
      }
    },
    onError: (error) => {
      // console.error('❌ useVerifyOTP Error:', error);
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: authApi.resendOTP,
    onSuccess: (data) => log('useResendOTP Success', data),
    onError: (error) => console.error('❌ useResendOTP Error:', error),
  });
};

export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data, variables) => {
      log('useForgotPassword Success', data);
      router.push(`/reset-password?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => console.error('❌ useForgotPassword Error:', error),
  });
};

export const useVerifyResetOTP = () => {
  return useMutation({
    mutationFn: authApi.verifyResetOTP,
    onSuccess: (data) => log('useVerifyResetOTP Success', data),
    onError: (error) => console.error('❌ useVerifyResetOTP Error:', error),
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      log('useResetPassword Success', data);
      router.push('/login?reset=success');
    },
    onError: (error) => console.error('❌ useResetPassword Error:', error),
  });
};

export const useProviderProfile = () => {
  return useQuery({
    queryKey: ['providerProfile'],
    queryFn: authApi.getProviderProfile,
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useUpdateProviderProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProviderProfile,
    onSuccess: (data) => {
      log('useUpdateProviderProfile Success', data);
      queryClient.setQueryData(['providerProfile'], data);
    },
    onError: (error) => console.error('❌ useUpdateProviderProfile Error:', error),
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    // console.warn('🚪 Logging out...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    queryClient.clear();
    await signOut({ callbackUrl: '/login', redirect: true });
  };
};