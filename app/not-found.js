"use client";

import { useRouter } from 'next/navigation';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="flex flex-col items-center max-w-sm">
        <FileQuestion className="w-12 h-12 text-[#0A1628] mb-4 stroke-[1.5]" />
        
        {/* Lowercase-forward heading style matching branding rules */}
        <h1 className="text-xl font-semibold text-[#0A1628] mb-2 tracking-tight">
          page not found
        </h1>
        
        <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
          the page you are looking for doesn't exist or you don't have permission to view it.
        </p>

        <div
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-medium text-sm rounded-md shadow-sm transition-colors cursor-pointer select-none"
        >
          back to safety
        </div>
      </div>
    </div>
  );
}