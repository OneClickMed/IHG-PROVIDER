// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  isCustomer: boolean;
  isProvider: boolean;
    profileId?: number;
}

export interface ProviderProfile {
  id: number;
  organizationName: string;
  type: 'INDIVIDUAL' | 'INSTITUTION';
  specialty?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;

}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  isProvider: boolean;
  organizationName?: string;
  type?: 'INDIVIDUAL' | 'INSTITUTION';
}

export interface VerifyOTPData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}