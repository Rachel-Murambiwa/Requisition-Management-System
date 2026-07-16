"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 📡 DUAL-MODE PARSING EXTRACTION: Captures tokens via standard parameters (?) OR URL hashes (#)
  useEffect(() => {
    async function captureVerificationSession() {
      if (typeof window !== 'undefined') {
        try {
          let accessToken = null;
          let refreshToken = null;

          // Mode 1: Check for tokens inside traditional query strings (?access_token=...)
          const urlParams = new URLSearchParams(window.location.search);
          accessToken = urlParams.get('access_token');
          refreshToken = urlParams.get('refresh_token');

          // Mode 2: Fallback check inside hash parameters (#access_token=...) if query parameters are blank
          if (!accessToken && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
          }

          // 🔐 Authenticate the guest user in the background if tokens are verified
          if (accessToken && refreshToken) {
            setIsLoading(true);
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        } catch (err) {
          console.error("failed to mount link parameters:", err.message);
          setError("your authorization link structure is expired or invalid. please request a new link.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    captureVerificationSession();
  }, [supabase]);

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault();

    if (!password || !confirmPassword) {
      setError('please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('password must be at least 8 characters long for corporate compliance.');
      return;
    }

    if (password !== confirmPassword) {
      setError('passwords do not match. please re-verify your inputs.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Save the password securely against the logged-in user session context
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;
      
      // 2. Clear out the temporary email verification session to avoid login page clashing
      await supabase.auth.signOut();

      // 3. Switch layout views to indicate complete registration
      setIsSuccess(true);
    } catch (err) {
      console.error("Password update tracking error:", err.message);
      setError('your session context has expired or the token link is invalid. please check with support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-white px-4">
      
      {/* Global Corporate Identity Header */}
      <div className="absolute top-8 left-6 sm:top-10 sm:left-12 flex items-center gap-2 select-none">
        <span className="text-2xl font-bold tracking-tight text-[#1D4ED8]">
          uncommon
        </span>
        <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-badge tracking-wider uppercase">
          rms
        </span>
      </div>

      <div className="w-full max-w-[420px] py-12">
        
        {!isSuccess ? (
          <form onSubmit={handlePasswordUpdate} className="block w-full">
            <div className="flex flex-col mb-8">
              <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
                set your private password
              </h1>
              <p className="text-sm text-[#4B5563] mt-2 tracking-normal">
                finalize your account profile credentials to gain system entry
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-[#FEE2E2] border border-l-4 border-l-[#991B1B] border-[#FECACA] rounded-r-md text-xs font-medium text-[#991B1B]">
                {error}
              </div>
            )}

            <div className="space-y-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="password-field">
                  new password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    id="password-field"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] disabled:opacity-60 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="confirm-field">
                  confirm new password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    id="confirm-field"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] disabled:opacity-60 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-3 px-4 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-medium text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase border-none focus:outline-none ${
                    isLoading ? 'opacity-60 cursor-not-allowed bg-[#1A2E4A]' : ''
                  }`}
                >
                  {isLoading ? 'saving password credentials...' : 'save password credentials'}
                </button>
              </div>

            </div>
          </form>
        ) : (
          <div className="flex flex-col text-left py-4 animate-fadeIn">
            <CheckCircle className="w-12 h-12 text-[#1D4ED8] mb-6 stroke-[1.5]" />
            <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
              credentials updated
            </h1>
            <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
              your private profile account password has been successfully saved to the registry database system. you may now log in to the portal workspace dashboard.
            </p>
            <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="inline-flex items-center justify-center py-2.5 px-5 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-medium text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase border-none focus:outline-none"
              >
                proceed to login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}