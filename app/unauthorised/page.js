"use client";

import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  Key, 
  HelpCircle,
  LogIn
} from 'lucide-react';

export default function UnauthorisedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased flex flex-col items-center justify-center p-4">
      
      {/* Upper Brand Badge */}
      <div className="flex items-center gap-2 select-none mb-6">
        <span className="text-2xl font-black tracking-tight text-[#0747A1]">uncommon</span>
        <span className="text-[10px] bg-[#EFF6FF] text-[#0747A1] border border-blue-50 font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">security gateway</span>
      </div>

      {/* Main Core Alert Card */}
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-md space-y-6 text-center animate-fadeIn">
        
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-[#0A1628] tracking-tight lowercase">
            access clearance required
          </h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed lowercase">
            the requisition portal was unable to validate your identity credentials. this is typically caused by security safeguards rather than a system fault.
          </p>
        </div>

        {/* Possible Causes List */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-3.5 text-xs font-semibold text-gray-600">
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-150 pb-1.5">
            potential resolution parameters
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block lowercase">expired single-use token</span>
              <span className="text-[10px] text-gray-400 font-medium block lowercase mt-0.5">
                invitation links are strictly single-use and expire within 24 hours of dispatch.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block lowercase">stale validation session</span>
              <span className="text-[10px] text-gray-400 font-medium block lowercase mt-0.5">
                your active browser authorization cookies may have expired. a fresh login will refresh your access tokens.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block lowercase">restricted privilege level</span>
              <span className="text-[10px] text-gray-400 font-medium block lowercase mt-0.5">
                you may be attempting to access a workspace partition that exceeds your assigned staff role permissions.
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={() => router.push('/login')}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0747A1] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border-none cursor-pointer transition-opacity"
          >
            <LogIn className="w-3.5 h-3.5" /> return to login portal
          </button>
          
          <div className="text-[10px] text-gray-400 font-bold lowercase">
            need assistance? contact the <span className="text-gray-600">administrator</span>
          </div>
        </div>

      </div>
    </div>
  );
}