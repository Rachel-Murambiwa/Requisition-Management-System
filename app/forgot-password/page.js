"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('please provide your registered staff email channel.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // Redirects users straight back to your active welcome password configuration route
        redirectTo: `${window.location.origin}/welcome`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'failed dispatching recovery link parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-white px-4 font-sans antialiased">
      
      {/* Top-Left Logo Frame */}
      <div className="absolute top-8 left-6 sm:top-10 sm:left-12 flex items-center gap-2 select-none">
        <span className="text-3xl font-bold tracking-tight text-[#0747A1]">uncommon</span>
        <span className="text-[10px] bg-[#EFF6FF] text-[#0747A1] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">rms</span>
      </div>

      <div className="w-full max-w-[420px] py-12 space-y-6">
        
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">recover security key</h1>
          <p className="text-sm text-[#4B5563] mt-2 leading-relaxed">
            enter your directory mail string to issue an authoritative password reset configuration link
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-l-4 border-l-[#991B1B] border-red-200 rounded-r-md text-xs font-semibold text-[#991B1B] lowercase">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3 animate-fadeIn text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-2 text-green-800 font-bold lowercase">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>recovery manifest dispatched!</span>
            </div>
            <p className="lowercase leading-relaxed">
              a secure account reset handshake token has been transmitted to <strong className="text-gray-900">{email.toLowerCase()}</strong>. verify your inbox channels to proceed.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full mt-2 py-2 bg-transparent border border-gray-200 text-gray-700 font-bold uppercase tracking-wider rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-[10px]"
            >
              return to login terminal
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-5 text-xs font-bold text-gray-500">
            <div className="flex flex-col gap-1.5">
              <label className="uppercase tracking-wider text-[10px] text-gray-400" htmlFor="email">staff directory email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@uncommon.org"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0747A1] disabled:opacity-60 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-bold uppercase tracking-wider rounded-md shadow-sm transition-colors border-none cursor-pointer disabled:opacity-50 text-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>transmitting token parameters...</span>
                </>
              ) : (
                <span>dispatch recovery email</span>
              )}
            </button>

            <div 
              onClick={() => router.push('/login')}
              className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-[#0747A1] transition-colors cursor-pointer font-semibold py-1 lowercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> return to login validation desk
            </div>
          </form>
        )}

      </div>
    </div>
  );
}