"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function WelcomeActivationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Interactive metadata profile tracking states
  const [staffName, setStaffName] = useState('staff member');
  const [staffRole, setStaffRole] = useState('requester');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Read the temporary session parameters automatically on mount
  useEffect(() => {
    async function inspectOnboardingSession() {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (user) {
        // Automatically extract the pre-assigned metadata the admin configured
        setStaffName(user.user_metadata?.name || 'staff member');
        setStaffRole(user.user_metadata?.role || 'requester');
      } else if (sessionError) {
        console.error("onboarding session token missing:", sessionError.message);
        setError('your account invitation token is invalid or has expired. please request a new link from your workspace administrator.');
      }
    }
    inspectOnboardingSession();
  }, [supabase]);

  const handleAccountActivation = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('please fill out both password parameter boxes.');
      return;
    }

    if (password.length < 8) {
      setError('security guidelines require passwords to be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('passwords do not match. check your characters and re-type.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Commit the chosen password to the secure Supabase Auth record database layer
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setIsSuccess(true);

      // 2. Read the final role string and boot them straight to their respective terminal hub node
      const finalRoleDestination = data.user?.user_metadata?.role || staffRole;
      
      setTimeout(() => {
        router.push(`/${finalRoleDestination}`);
      }, 2000);

    } catch (err) {
      console.error("activation script sequence fault:", err.message);
      setError(err.message || 'failed to save credentials. please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-avenir antialiased">
      
      {/* Platform Branding Context Stack */}
      <div className="sm:mx-auto w-full max-w-md text-center select-none">
        <div className="inline-flex items-center gap-2.5">
          <span className="text-4xl font-black tracking-tight text-white">uncommon</span>
          <span className="text-xs bg-[#0747A1] border border-blue-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white">
            rms
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 border border-slate-200 sm:rounded-xl shadow-xl space-y-6">
          
          {!isSuccess ? (
            <>
              {/* Heading Text Cluster */}
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-900 lowercase tracking-tight">
                  welcome, <span className="text-[#0747A1]">{staffName}</span>
                </h2>
                <p className="text-xs text-gray-400 lowercase font-normal mt-1">
                  your profile has been provisioned as a <strong className="text-gray-600 font-semibold">{staffRole.replace('-', ' ')}</strong>. choose a secure permanent password below to complete account activation.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-l-4 border-l-red-600 border-red-100 rounded-r text-xs font-medium text-red-700 flex items-start gap-2 lowercase animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAccountActivation} className="space-y-5 text-xs font-semibold text-gray-600">
                
                {/* Field 1: Choose Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider text-[10px]" htmlFor="new-password">
                    choose secure password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0747A1] transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Field 2: Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider text-[10px]" htmlFor="confirm-password">
                    re-type password to verify
                  </label>
                  <div className="relative flex items-center">
                    <ShieldCheck className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0747A1] transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Activation Submission Trigger Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-md font-bold text-xs uppercase tracking-wider text-white bg-[#0747A1] hover:opacity-95 shadow transition-all border-none focus:outline-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>encrypting permanent credentials...</span>
                      </>
                    ) : (
                      <span>activate staff account</span>
                    )}
                  </button>
                </div>

              </form>
            </>
          ) : (
            /* Animated Success Confirmation State View */
            <div className="py-6 flex flex-col text-center items-center justify-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 stroke-[1.5]" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 lowercase tracking-tight">
                  account activated!
                </h3>
                <p className="text-xs text-gray-400 lowercase max-w-xs mx-auto">
                  your access parameters are configured. mounting your personalized workspace environment dashboard...
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}