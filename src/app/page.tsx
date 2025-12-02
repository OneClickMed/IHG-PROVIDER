// src/app/(dashboard)/dashboard/page.tsx
'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation'; // <-- change here

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login'); // works with next/navigation
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-12">
        {/* Logo */}
        <div className="w-full max-w-sm">
          <Image
            src="/images/ihg-logo.png"
            alt="Impact Healthcare Group"
            width={240}
            height={110}
            priority
            className="m-auto"
          />
        </div>

        {/* Login Button */}
        <div className="w-full max-w-sm px-4">
          <Button
            onClick={handleLogin}
            title="Login"
            variant="filled"
          />
        </div>
      </div>
    </div>
  );
}
