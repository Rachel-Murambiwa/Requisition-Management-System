"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

export default function LoginGateway() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("please complete all credential input parameters.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Handshake with Supabase Auth backend
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;

      const user = data?.user;

      if (user) {
        // 2. ✨ FIXED: Fetch the actual profile role from your database table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile row missing or failed to fetch:", profileError);
          // Standard fallback if database table entry isn't complete yet
          router.push('/dashboard');
          return;
        }

        const userRole = profile.role;
        
        // 3. 🚀 FIXED ROUTING: Strict role-based routing matching your routes
        if (userRole === 'admin') {
          router.push('/admin-dashboard');
        } else if (userRole === 'finance-officer') {
          router.push('/finance-officer-dashboard');
        } else if (userRole === 'head-of-operations') {
          router.push('/head-of-operations-dashboard');
        } else if (userRole === 'country-manager') {
          router.push('/country-manager-dashboard');
        } else if (userRole === 'requester') {
          router.push('/requester-dashboard');
        } else {
          router.push('/dashboard');
        }
      }

    } catch (err) {
      setError(err.message || "authentication checkpoint failed. check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased flex flex-col justify-between">
      
      {/* 1. CLEAN BRANDING HEADER */}
      <header className="w-full bg-white max-w-7xl mx-auto px-6 sm:px-12 h-24 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[50px] font-black tracking-tight text-[#1D4ED8]">uncommon</span>
          <span className="text-[9px] bg-blue-50 text-[#1D4ED8] font-mono font-bold px-1.5 py-0.5 rounded tracking-wide uppercase mt-1">rms</span>
        </div>
      </header>

      {/* 2. CENTERED HERO & SECURITY VALIDATION FORM */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-8 flex flex-col justify-center items-center">
        <div className="w-full space-y-8 text-center">
          
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-[#0A1628] tracking-tight lowercase">
              requisition management system
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium max-w-md mx-auto leading-relaxed first-letter:uppercase">
              Log, track, and authorize internal funding requests cleanly and securely. Sign in below to access your workflow queue.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-xs font-semibold text-[#991B1B] flex items-start gap-2 lowercase text-left animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Secure Login Box Layout Container */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 text-left shadow-sm">
            <form onSubmit={handleStandardLogin} className="space-y-5 text-xs font-bold">
              
              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase tracking-wide text-[10px]" htmlFor="login-email">email directory channel</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input 
                    id="login-email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="username@uncommon.org" 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-sans transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase tracking-wide text-[10px]" htmlFor="login-password">password verification key</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input 
                    id="login-password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••••••" 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] transition-all" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-bold py-3 text-xs uppercase tracking-widest rounded-md shadow transition-all flex items-center justify-center gap-2 cursor-pointer select-none mt-2"
              >
                <span>{isLoading ? "linking profile lines..." : "establish verification session"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* 3. DISTRACTION-FREE MINIMALIST FOOTER BLOCK */}
      <footer className="w-full py-6 text-center text-[11px] text-gray-400 select-none">
        &copy; {new Date().getFullYear()} uncommon.org • all rights reserved.
      </footer>

    </div>
  );
}