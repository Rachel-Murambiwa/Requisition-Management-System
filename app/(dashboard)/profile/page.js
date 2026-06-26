"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Lock, 
  Shield, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  // Profile data state
  const [userMeta, setUserMeta] = useState({
    name: "loading...",
    email: "loading...",
    role: "loading...",
    hub: "loading..."
  });

  // Password interactive form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch the active authenticated user's profile metadata on mount
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserMeta({
          name: user.user_metadata?.name || 'anonymous staff',
          email: user.email || '',
          role: user.user_metadata?.role || 'requester',
          hub: user.user_metadata?.hub_name || 'unassigned hub'
        });
      }
    }
    getProfile();
  }, [supabase]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('all password entry parameters are strictly required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('security guidelines state passwords must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('password confirmation does not match your new password key.');
      return;
    }

    setIsLoading(true);

    try {
      // Direct update execution with Supabase Auth cryptographic engine
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess('security credentials updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'failed to update security credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-16">
      
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-10 select-none">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B5563] hover:text-[#1D4ED8] transition-colors focus:outline-none lowercase bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>back to previous screen</span>
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: STATIC WORKSPACE METRICS CARD */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#1D4ED8] mb-3 border border-blue-100">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#0A1628] lowercase tracking-tight">{userMeta.name}</h2>
              <span className="text-xs text-gray-400 font-mono mt-0.5">{userMeta.email}</span>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-gray-400 uppercase tracking-wide text-[9px] block">assigned platform role</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-50 text-[#1D4ED8] font-bold uppercase border border-blue-100 mt-1">
                  <Shield className="w-3 h-3" /> {userMeta.role.replace('-', ' ')}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-gray-400 uppercase tracking-wide text-[9px] block">operational node allocation</span>
                <span className="text-gray-700 font-bold lowercase flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> {userMeta.hub}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RE-AUTHENTICATION / PASSWORD FORM */}
          <div className="md:col-span-2 bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-[#E5E7EB] px-6 py-4">
              <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider block">update security authorization keys</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-xs font-semibold text-[#991B1B] flex items-start gap-2 lowercase animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-md text-xs font-semibold text-green-800 flex items-start gap-2 lowercase animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5 text-xs font-bold max-w-sm">
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase tracking-wide text-[10px]" htmlFor="profile-new-password">new password string</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input 
                      id="profile-new-password"
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="minimum 6 characters" 
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase tracking-wide text-[10px]" htmlFor="profile-confirm-password">confirm new password string</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input 
                      id="profile-confirm-password"
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="re-type password string" 
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] transition-all" 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#0A1628] hover:bg-[#1A2E4A] text-white font-bold py-2.5 px-5 text-xs uppercase tracking-wider rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <span>{isLoading ? "re-writing lines..." : "update password entry"}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}