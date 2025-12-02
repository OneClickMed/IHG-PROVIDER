// src/app/(auth)/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthInput from '@/components/ui/auth/Input';
import Button from '@/components/ui/Button';
import { useForgotPassword } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleResetPassword = () => {
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
        Reset Password
      </h1>
      <p className="text-sm md:text-base text-gray-600 text-center mb-8">
        Enter your email address and we'll send you a reset code.
      </p>

      {forgotPasswordMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {(forgotPasswordMutation.error as any)?.response?.data?.error || 'Failed to send reset code.'}
        </div>
      )}

      <div className="space-y-6">
        <AuthInput
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={forgotPasswordMutation.isPending}
          onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
        />
        <Button
          onClick={handleResetPassword}
          title={forgotPasswordMutation.isPending ? 'Sending...' : 'Reset Password'}
          variant="filled"
          size="large"
          disabled={forgotPasswordMutation.isPending || !email}
        />
        <div className="text-center">
          <Link 
            href="/login"
            className="text-sm text-primary hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}
