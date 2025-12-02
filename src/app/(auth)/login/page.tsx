// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import AuthInput from '@/components/ui/auth/Input';
import { useLogin, useVerifyOTP } from '@/hooks/useAuth';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const loginMutation = useLogin();
  const verifyOTPMutation = useVerifyOTP();

  // Prefill email if query param exists
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp'>('login'); // always start at login

  const error = searchParams.get('error');
  const resetSuccess = searchParams.get('reset') === 'success';

  // Redirect if ?email= exists but is empty
  useEffect(() => {
    if (searchParams.get('email') === '') {
      router.replace('/login');
    }
  }, [searchParams, router]);

  // Prevent OTP step if login hasn't succeeded
  useEffect(() => {
    if (step === 'otp' && !loginMutation.isSuccess) {
      setStep('login');
      router.replace('/login');
    }
  }, [step, loginMutation.isSuccess, router]);

  const handleLogin = () => {
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setStep('otp'); // move to OTP internally
          // Update URL to show email without giving access to OTP directly
          router.replace(`/login?email=${encodeURIComponent(data.email)}`);
        },
      }
    );
  };

  const handleVerifyOTP = () => {
    verifyOTPMutation.mutate(
      { email, code: otp },
      {
        onError: (err: any) => {
          // console.error('OTP verify error:', err);
        },
      }
    );
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
        Login
      </h1>
      <p className="text-sm md:text-base text-gray-600 text-center mb-8">
        {step === 'login'
          ? 'Enter your credentials to receive an OTP for login'
          : `Enter the 6-digit OTP sent to ${email}`}
      </p>

      {resetSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Password reset successful! Please login with your new password.
        </div>
      )}

      {error === 'not_provider' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          This account is not registered as a provider.
        </div>
      )}

      {(loginMutation.isError || verifyOTPMutation.isError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {(loginMutation.error as any)?.response?.data?.error ||
            (verifyOTPMutation.error as any)?.response?.data?.error ||
            'Something went wrong. Please try again.'}
        </div>
      )}

      <div className="space-y-5">
        {step === 'login' ? (
          <>
            <AuthInput
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
            />
            <AuthInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={loginMutation.isPending}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              onClick={handleLogin}
              title={loginMutation.isPending ? 'Requesting OTP...' : 'Login'}
              variant="filled"
              size="large"
              disabled={loginMutation.isPending || !email || !password}
            />
          </>
        ) : (
          <>
            <AuthInput
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
              disabled={verifyOTPMutation.isPending}
            />
            <Button
              onClick={handleVerifyOTP}
              title={verifyOTPMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              variant="filled"
              size="large"
              disabled={verifyOTPMutation.isPending || otp.length < 6}
            />
            <button
              onClick={() => {
                setStep('login');
                router.replace('/login');
              }}
              className="block text-center text-sm text-gray-500 hover:underline mt-4"
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
