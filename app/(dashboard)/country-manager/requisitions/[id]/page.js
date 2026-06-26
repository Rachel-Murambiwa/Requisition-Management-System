"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Printer, 
  LogOut,
  TrendingUp,
  Coins
} from 'lucide-react';

export default function CountryManagerTreasuryRelease() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();
  
  const [disbursalStatus, setDisbursalStatus] = useState("idle"); // 'idle', 'processing', 'completed'
  const [selectedChannel, setSelectedChannel] = useState("ecocash corporate wallet");

  // Simulated live data mapping for the dynamic route identifier
  const [requisition] = useState({
    id: id || "REQ-010",
    title: "uncapped fiber internet backbone subscription hq",
    requester: "jane doe",
    hub: "victoria falls hub",
    amount: 365.00,
    category: "utilities & data connectivity",
    date: "may 25, 2026",
    justification: "monthly uncapped dedicated fiber link renewal for the main training laboratory backbone grid. ensures zero instructional disruptions for the active cohort.",
    foAuditor: "shammah dzwairo",
    hopSignoff: "nkosi ndlovu"
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleFinalDisbursal = () => {
    setDisbursalStatus("processing");
    setTimeout(() => {
      setDisbursalStatus("completed");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-20">
      
      {/* Universal Executive Navigation Header */}
      <nav className="w-full bg-[#0A1628] text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => router.push('/country-manager')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="lowercase">back to executive terminal</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter role="country-manager" />
            <div className="h-6 w-px bg-slate-700" />
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors focus:outline-none">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Workspace Container */}
      <main className="max-w-4xl mx-auto px-4 mt-10">
        
        {disbursalStatus === "completed" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-sm text-green-800 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            <div>
              <strong>Treasury disbursement finalized.</strong> Funding tranche of <b>${requisition.amount.toFixed(2)}</b> has been securely wired via {selectedChannel}.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* LEFT DETAILS BOX (2/3 width layout) */}
          <div className="md:col-span-2 bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
                    {requisition.id}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-[#1D4ED8] border border-blue-200 font-mono font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> double-signed
                  </span>
                </div>
                <h1 className="text-xl font-bold text-[#0A1628] mt-3 tracking-tight lowercase">{requisition.title}</h1>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">payout total</span>
                <span className="text-2xl font-black font-mono text-[#0A1628] block mt-0.5">${requisition.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Parameter Summary Grids */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-gray-400 uppercase tracking-wide text-[10px] block">origin member</span>
                <span className="text-[#0A1628] block mt-1 font-bold lowercase">{requisition.requester}</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase tracking-wide text-[10px] block">hub destination</span>
                <span className="text-[#1D4ED8] block mt-1 font-bold lowercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {requisition.hub}
                </span>
              </div>
            </div>

            {/* Justification Narrative Text Frame */}
            <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs font-semibold">
              <span className="text-gray-400 uppercase tracking-wide text-[10px] block">operational justification</span>
              <p className="text-sm text-gray-600 font-medium font-sans leading-relaxed lowercase first-letter:uppercase">
                {requisition.justification}
              </p>
            </div>

            {/* Explicit Authorization Footprint Timeline */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-medium text-gray-500 space-y-2 font-sans">
              <div className="flex items-center gap-1.5 text-[#16A34A]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified by Finance Desk Auditor: <b>{requisition.foAuditor}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-[#16A34A]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorized by Head of Operations: <b>{requisition.hopSignoff}</b></span>
              </div>
            </div>
          </div>

          {/* RIGHT CONTROLS PANELS (1/3 width layout) */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-5 space-y-5">
            <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <CreditCard className="w-4 h-4 text-[#1D4ED8]" />
              <span>treasury channel execution</span>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wide text-[10px]">select release node</label>
                <select 
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  disabled={disbursalStatus !== "idle"}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] uppercase tracking-wide text-[11px] cursor-pointer"
                >
                  <option value="ecocash corporate wallet">ecocash corporate wallet run</option>
                  <option value="direct bank transfer">direct bank wire batch</option>
                  <option value="petty cash pool">petty cash allocation ledger</option>
                </select>
              </div>

              {disbursalStatus !== "completed" ? (
                <button
                  type="button"
                  onClick={handleFinalDisbursal}
                  disabled={disbursalStatus === "processing"}
                  className={`w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider text-white shadow transition-all flex items-center justify-center gap-1.5 ${
                    disbursalStatus === 'processing' ? 'bg-slate-400 cursor-wait' : 'bg-[#1D4ED8] hover:bg-[#1E40AF]'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{disbursalStatus === 'idle' ? 'release payout' : 'processing wire...'}</span>
                </button>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-center rounded text-xs font-bold uppercase tracking-wider select-none">
                  tranche settled successfully
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}