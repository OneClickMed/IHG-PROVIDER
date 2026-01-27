// src/app/(auth)/reset-password/page.tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthInput from '@/components/ui/auth/Input';
import Button from '@/components/ui/Button';
import { useVerifyResetOTP, useResetPassword } from '@/hooks/useAuth';

function ResetPasswordPageContent() {
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const searchParams = useSearchParams();

  const verifyOTPMutation = useVerifyResetOTP();
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    const stored = localStorage.getItem('resetPasswordRequestedAt');
    if (!stored) {
      setRemainingMs(null);
      return;
    }

    const startedAt = Number(stored);
    if (!Number.isFinite(startedAt)) {
      setRemainingMs(null);
      return;
    }

    const expiresAt = startedAt + 10 * 60 * 1000;
    const updateRemaining = () => {
      const ms = Math.max(0, expiresAt - Date.now());
      setRemainingMs(ms);
    };

    updateRemaining();
    const intervalId = setInterval(updateRemaining, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const isExpired = remainingMs !== null && remainingMs <= 0;
  const formattedCountdown =
    remainingMs === null
      ? null
      : `${String(Math.floor(remainingMs / 60000)).padStart(2, '0')}:${String(
          Math.floor((remainingMs % 60000) / 1000)
        ).padStart(2, '0')}`;

  const handleContinue = () => {
    if (isExpired) return;
    verifyOTPMutation.mutate(
      { email, code: confirmationCode },
      {
        onSuccess: () => setStep('password'),
      }
    );
  };

  const handleResetPassword = () => {
    if (isExpired) return;
    if (password !== confirmPassword) {
      return;
    }
    resetPasswordMutation.mutate({
      email,
      code: confirmationCode,
      password,
      confirmPassword,
    });
  };

  if (step === 'code') {
    return (
      <>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
          Password Reset
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mb-8">
          We sent a confirmation code to <span className="font-semibold">{email}</span>
        </p>

        {formattedCountdown && (
          <div
            className={`mb-4 p-3 border rounded-md text-sm ${
              isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {isExpired
              ? 'Code validity expired. Please request a new code.'
              : `Code expires in ${formattedCountdown}`}
          </div>
        )}

        {verifyOTPMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {(verifyOTPMutation.error as any)?.response?.data?.error || 'Invalid code. Please try again.'}
          </div>
        )}

        <div className="space-y-6">
          <AuthInput
            type="text"
            placeholder="Confirmation code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            disabled={verifyOTPMutation.isPending}
            maxLength={6}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          />
          <Button
            onClick={handleContinue}
            title={verifyOTPMutation.isPending ? 'Verifying...' : 'Continue'}
            variant="filled"
            size="large"
            disabled={verifyOTPMutation.isPending || confirmationCode.length !== 6 || isExpired}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
        Set New Password
      </h1>
      <p className="text-sm md:text-base text-gray-600 text-center mb-8">
        Enter your new password below
      </p>

      {formattedCountdown && (
        <div
          className={`mb-4 p-3 border rounded-md text-sm ${
            isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          {isExpired
            ? 'Code validity expired. Please request a new code.'
            : `Code expires in ${formattedCountdown}`}
        </div>
      )}

      {resetPasswordMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {(resetPasswordMutation.error as any)?.response?.data?.error || 'Failed to reset password.'}
        </div>
      )}

      {password && confirmPassword && password !== confirmPassword && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm">
          Passwords do not match
        </div>
      )}

      <div className="space-y-5">
        <AuthInput
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={resetPasswordMutation.isPending}
        />
        <AuthInput
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={resetPasswordMutation.isPending}
          onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
        />
        <Button
          onClick={handleResetPassword}
          title={resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
          variant="filled"
          size="large"
          disabled={
            resetPasswordMutation.isPending ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword ||
            isExpired
          }
        />
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
