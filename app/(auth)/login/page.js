"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError('please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Authenticate credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;

      // 2. Fetch profile safely using .maybeSingle() to prevent unhandled exception throws
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      // 3. Extract and normalize role string (checking DB profile first, then user_metadata, then fallback to requester)
      const rawRole = (profile?.role || authData.user?.user_metadata?.role || 'requester')
        .toString()
        .trim()
        .toLowerCase();

      const roleRedirects = {
        'requester': '/requester',
        'finance-officer': '/finance-officer',
        'head-of-operations': '/head-of-operations',
        'country-manager': '/country-manager',
        'admin': '/admin',
      };

      const targetPath = roleRedirects[rawRole] || '/requester';

      // 4. FORCE HARD REDIRECT TO FULLY COMMIT SESSION COOKIES TO NEXT.JS MIDDLEWARE
      window.location.href = targetPath;

    } catch (err) {
      console.error("Authentication Error:", err);
      setError('invalid login credentials. please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-white px-4">
      
      {/* Top-Left Global Corporate Identity Header */}
      <div className="absolute top-8 left-6 sm:top-10 sm:left-12 flex items-center gap-2 select-none">
        <span className="text-3xl font-bold tracking-tight text-[#1D4ED8]">
          uncommon
        </span>
        <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-badge tracking-wider uppercase">
          rms
        </span>
      </div>

      {/* Centered Main Layout Frame */}
      <div className="w-full max-w-[420px] py-12">
        
        {/* Form Identity Block */}
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold text-[#0A1628] leading-tight tracking-tight lowercase">
            requisition management system
          </h1>
          <p className="text-sm text-[#4B5563] mt-2 tracking-normal">
            sign in with your staff credentials
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#FEE2E2] border border-l-4 border-l-[#991B1B] border-[#FECACA] rounded-r-md text-xs font-semibold text-[#991B1B]">
            {error}
          </div>
        )}

        {/* Form Container Wrapper */}
        <form onSubmit={handleSignIn} className="space-y-5">
          
          {/* Email Block */}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@uncommon.org"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] disabled:opacity-60 transition-all font-sans font-medium"
              />
            </div>
          </div>

          {/* Password Block */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider" htmlFor="password-field">
                password
              </label>
              <span 
                onClick={() => !isLoading && router.push('/forgot-password')}
                className="text-xs text-[#1D4ED8] hover:underline cursor-pointer select-none font-medium"
              >
                forgot password?
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
              <input
                id="password-field"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] disabled:opacity-60 transition-all font-sans font-medium"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Form Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-semibold text-sm rounded-md shadow-sm select-none transition-colors cursor-pointer text-center lowercase ${
                isLoading ? 'opacity-60 cursor-not-allowed bg-[#1A2E4A]' : ''
              }`}
            >
              {isLoading ? 'signing in...' : 'sign in'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}