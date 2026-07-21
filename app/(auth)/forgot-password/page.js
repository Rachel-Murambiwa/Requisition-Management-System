"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      setError('please enter your email address.');
      return;
    }

    // 🔓 RESTRICTION LIFTED: Domain validation removed for testing flexibility

    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setIsSubmitted(true);
    } catch (err) {
      setError('unable to process recovery request. please ensure your account exists.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-white px-4">
      
      {/* Top-Left Global Corporate Identity Header */}
      <div 
        onClick={() => router.push('/login')} 
        className="absolute top-8 left-6 sm:top-10 sm:left-12 flex items-center gap-2 select-none cursor-pointer"
      >
        <span className="text-2xl font-bold tracking-tight text-[#1D4ED8]">
          uncommon
        </span>
        <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-badge tracking-wider uppercase">
          rms
        </span>
      </div>

      {/* Main Core View Area */}
      <div className="w-full max-w-[420px] py-12">
        
        {!isSubmitted ? (
          <>
            {/* Form Identity Heading */}
            <div className="flex flex-col mb-8">
              <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
                recover your password
              </h1>
              <p className="text-sm text-[#4B5563] mt-2 tracking-normal">
                enter your email address to receive a secure recovery link
              </p>
            </div>

            {/* Error Notification Portal */}
            {error && (
              <div className="mb-6 p-3 bg-[#FEE2E2] border border-l-4 border-l-[#991B1B] border-[#FECACA] rounded-r-md text-xs font-medium text-[#991B1B]">
                {error}
              </div>
            )}

            {/* Input Interactive Fields Layout */}
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="email-field">
                  email address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    id="email-field"
                    type="email"
                    value={email}
                    // ✨ FIXED: Standard event binding configuration
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetRequest()}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] disabled:opacity-60 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Recovery Form Trigger */}
              <div className="pt-2">
                <div
                  onClick={!isLoading ? handleResetRequest : undefined}
                  className={`w-full flex items-center justify-center py-3 px-4 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-medium text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase ${
                    isLoading ? 'opacity-60 cursor-not-allowed bg-[#1A2E4A]' : ''
                  }`}
                >
                  {isLoading ? 'sending recovery link...' : 'send recovery link'}
                </div>
              </div>

              {/* Navigation Back Link */}
              <div 
                onClick={() => router.push('/login')}
                className="flex items-center justify-center gap-2 text-xs text-[#4B5563] hover:text-[#1D4ED8] font-medium transition-colors cursor-pointer pt-2 select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>back to sign in</span>
              </div>
            </div>
          </>
        ) : (
          /* Successful Transmission Template Screen Layout */
          <div className="flex flex-col text-left py-4 animate-fadeIn">
            <CheckCircle className="w-12 h-12 text-[#1D4ED8] mb-6 stroke-[1.5]" />
            <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
              recovery link sent
            </h1>
            <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
              we have sent a single-use verification link to <strong className="text-[#0A1628] font-semibold">{email}</strong>. please check your inbox to update your password credentials.
            </p>
            <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
              <div
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-2 text-sm text-[#1D4ED8] font-semibold hover:underline cursor-pointer select-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>return to login</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}