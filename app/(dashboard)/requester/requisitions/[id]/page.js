"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle,
  Users,
  MapPin,
  Briefcase,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function RequisitionDetailPage({ params: paramsPromise }) {
  const router = useRouter();
  const params = use(paramsPromise);
  const requisitionId = params.id;

  const [supabase] = useState(() => createClient());
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hydrate record profile data from Supabase live on load
  useEffect(() => {
    async function fetchRequisitionRecord() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('requisitions')
          .select('*')
          .eq('id', requisitionId)
          .single();

        if (fetchError) throw fetchError;
        setRequisition(data);
      } catch (err) {
        console.error("Database connection fault:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (requisitionId) {
      fetchRequisitionRecord();
    }
  }, [requisitionId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
        <Loader2 className="w-8 h-8 text-[#0747A1] animate-spin" />
        <span>fetching record data from secure network registries...</span>
      </div>
    );
  }

  if (error || !requisition) {
    return (
      <div className="min-h-screen bg-white p-10 max-w-5xl mx-auto space-y-4 text-xs font-semibold">
        <button onClick={() => router.push('/requester')} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0747A1] bg-transparent border-none cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> <span>return to dashboard</span>
        </button>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md lowercase">
          unsupported requisition index reference: {error || 'record entry not found inside current schema slice.'}
        </div>
      </div>
    );
  }

  const currentStatus = requisition.status?.toLowerCase() || 'pending';
  const isTravelRequest = requisition.category === 'travel & logistics';

  // Compute a dynamic timeline progression map based on current live approval state
  const approvalTimelineMatrix = [
    { label: 'requisition logged', actor: requisition.requester || 'staff member', status: 'completed', date: new Date(requisition.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toLowerCase() },
    { label: 'finance audit verification', actor: 'central finance pool', status: currentStatus === 'pending' ? 'active' : 'completed', date: currentStatus === 'pending' ? 'processing' : 'verified log' },
    { label: 'executive approval clearance', actor: 'country manager desk', status: currentStatus === 'pending' ? 'upcoming' : currentStatus === 'rejected' ? 'failed' : 'completed', date: currentStatus === 'approved' ? 'authorized clearance' : currentStatus === 'rejected' ? 'terminated pipeline' : 'awaiting upstream' },
    { label: 'capital payment disbursement', actor: 'operations core desk', status: currentStatus === 'approved' ? 'completed' : currentStatus === 'rejected' ? 'failed' : 'upcoming', date: currentStatus === 'approved' ? 'disbursed released' : 'awaiting authorization' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      
      {/* Top Workspace Bar Layout Frame */}
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#0747A1] text-white font-semibold px-1.5 py-0.5 rounded uppercase">file inspector</span>
          </div>
          <NotificationCenter role="requester" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Return Trigger (FIXED CLIPPING DIV PARENT HERE) */}
        <div 
          onClick={() => router.push('/requester')}
          className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-semibold transition-colors cursor-pointer mb-8 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="lowercase">back to dashboard</span>
        </div>

        {/* Main Grid Splitting Data Panels and Workflow Timelines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Core Document Overviews */}
          <div className="lg:col-span-2 space-y-8 bg-white border border-[#E5E7EB] rounded-lg p-6 sm:p-8 shadow-sm">
            
            {/* Identity Descriptor Block */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="text-xs font-bold font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wide">ID: {requisition.id.substring(0, 8).toUpperCase()}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentStatus === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' : 
                  currentStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {currentStatus}
                </span>
                {requisition.is_emergency && (
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                    emergency bypass active
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">
                allocation breakdown summary
              </h1>
            </div>

            {/* Core Descriptive Parameters List Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E5E7EB] pt-6 text-xs font-semibold">
              <div className="flex items-start gap-3 p-3 bg-[#F9FAFB] border border-gray-100 rounded-lg">
                <Calendar className="w-4 h-4 text-[#9CA3AF] mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">submission date logs</div>
                  <div className="text-sm font-bold text-[#0A1628] lowercase mt-0.5">
                    {new Date(requisition.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F9FAFB] border border-gray-100 rounded-lg">
                <Tag className="w-4 h-4 text-[#9CA3AF] mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">budget deployment hub category</div>
                  <div className="text-sm font-bold text-[#0A1628] lowercase mt-0.5">{requisition.category}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F9FAFB] border border-gray-100 rounded-lg">
                <Wallet className="w-4 h-4 text-[#9CA3AF] mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">preferred payment distribution channel</div>
                  <div className="text-sm font-bold text-[#0A1628] lowercase mt-0.5">{requisition.payment_method}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg">
                <span className="text-sm font-black text-[#0747A1] mt-0.5">$</span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0747A1]">aggregated fund total volume (usd)</div>
                  <div className="text-base font-black text-gray-900 mt-0.5">${parseFloat(requisition.amount).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* VIEW SUB-LAYER A: STANDARD COMPLIANCE DATA RENDERING LOOKUP   */}
            {/* ============================================================== */}
            {!isTravelRequest ? (
              <div className="space-y-6 pt-2">
                <div className="space-y-2 text-xs font-semibold text-gray-600">
                  <h2 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> business purpose justification statement
                  </h2>
                  <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] leading-relaxed font-sans shadow-sm font-medium">
                    {requisition.justification}
                  </div>
                </div>

                {/* Compliance Safe Vault File Index Matrix Row list */}
                {requisition.documents && requisition.documents.length > 0 && (
                  <div className="space-y-3 text-xs font-semibold text-gray-600">
                    <h2 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                      attached vetting documents validation logs ({requisition.documents.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {requisition.documents.map((file, i) => (
                        <a 
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg bg-white shadow-sm hover:border-[#0747A1] transition-colors cursor-pointer group no-underline text-inherit"
                        >
                          <span className="text-xs font-bold text-[#0747A1] group-hover:underline truncate pr-4 lowercase flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> {file.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#F9FAFB] px-2 py-0.5 rounded border border-[#E5E7EB] shrink-0">{file.size || 'binary stream'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ============================================================== */
              /* VIEW SUB-LAYER B: STRUCTURAL TRAVEL MANIFEST DATA RENDERING    */
              /* ============================================================== */
              <div className="space-y-8 pt-4 border-t border-dashed border-gray-200 text-xs font-semibold animate-fadeIn text-gray-600">
                
                {/* 1. Crew Manifest Mapping */}
                {requisition.travel_meta?.travelers && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5"><Users className="w-3.5 h-3.5" /> traveling group personnel manifest</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {requisition.travel_meta.travelers.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-gray-50 border border-gray-100 rounded-md flex flex-col">
                          <span className="font-bold text-[#0A1628] text-sm lowercase">{t.name || 'unspecified traveler'}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5 lowercase">{t.title || 'operational slot'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Daily Itinerary Map */}
                {requisition.travel_meta?.itinerary && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5"><Calendar className="w-3.5 h-3.5" /> scheduled itinerary destination route logs</h3>
                    <div className="space-y-2">
                      {requisition.travel_meta.itinerary.map((iti, idx) => (
                        <div key={idx} className="flex gap-3 items-center p-2.5 bg-white border border-gray-100 rounded-md shadow-sm">
                          <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">day {iti.day || idx + 1}</span>
                          <div className="truncate"><span className="text-gray-900 font-bold lowercase">{iti.activity}</span> <span className="text-gray-400 font-normal px-1">•</span> <span className="text-[#0747A1] lowercase tracking-wide font-medium">{iti.location}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Segmented Ledgers */}
                {requisition.travel_meta?.breakdown && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5"><Briefcase className="w-3.5 h-3.5" /> logistical funding category metrics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono font-bold">
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100"><span className="text-[9px] text-gray-400 uppercase tracking-wide block font-sans">transport ticket</span><span className="text-gray-900 text-sm mt-1 block">${requisition.travel_meta.breakdown.transportCost || '0.00'}</span></div>
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100"><span className="text-[9px] text-gray-400 uppercase tracking-wide block font-sans">fuel reserves</span><span className="text-gray-900 text-sm mt-1 block">${requisition.travel_meta.breakdown.fuelCost || '0.00'}</span></div>
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100"><span className="text-[9px] text-gray-400 uppercase tracking-wide block font-sans">lodging allowance</span><span className="text-gray-900 text-sm mt-1 block">${requisition.travel_meta.breakdown.lodgingPerDiem || '0.00'}</span></div>
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100"><span className="text-[9px] text-gray-400 uppercase tracking-wide block font-sans">meal tracking</span><span className="text-gray-900 text-sm mt-1 block">${requisition.travel_meta.breakdown.mealsPerDiem || '0.00'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Visual Real-time Audit Validation Flow Timeline Tracker */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 bg-[#F9FAFB] h-fit space-y-6 shadow-sm text-xs font-semibold">
            <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider border-b border-[#E5E7EB] pb-3">
              approval lifecycle pipeline
            </div>
            
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
              {approvalTimelineMatrix.map((step, idx) => (
                <div key={idx} className="flex gap-4 relative animate-fadeIn">
                  
                  {/* Visual Circle Icon Stepper Nodes */}
                  <div className="mt-0.5 z-10 shrink-0 bg-[#F9FAFB]">
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] fill-white stroke-[2.5]" />
                    )}
                    {step.status === 'active' && (
                      <Clock className="w-5 h-5 text-[#EAB308] fill-white stroke-[2.5] animate-spin-slow" />
                    )}
                    {step.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-[#991B1B] fill-white stroke-[2.5]" />
                    )}
                    {step.status === 'upcoming' && (
                      <Circle className="w-5 h-5 text-[#D1D5DB] fill-white stroke-[2]" />
                    )}
                  </div>

                  {/* Content Texts Descriptor Stack for the Approval Milestones */}
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold lowercase ${
                      step.status === 'completed' ? 'text-[#0A1628]' :
                      step.status === 'active' ? 'text-[#EAB308]' :
                      step.status === 'failed' ? 'text-[#991B1B]' : 'text-[#9CA3AF]'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[11px] text-[#6B7280] font-medium capitalize">
                      {step.actor}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono lowercase">
                      {step.date}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}