"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootGateway() {
  const router = useRouter();

  useEffect(() => {
    // Instantly force anyone hitting the base URL straight over to your true /login path
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D4ED8]" />
    </div>
  );
}