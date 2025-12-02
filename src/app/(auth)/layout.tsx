// src/app/(auth)/layout.tsx
'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background  flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center">
          <p className="text-sm text-gray-600 -mb-8 ">Powered by</p>
          <Image
            src="/images/oneclickmed.png"
            alt="OneClick Med"
            width={190}
            height={40}
          />
          <p className="text-xs text-gray-500">© Copyrights 2025</p>
        </div>
      </div>
    </div>
  );
}
