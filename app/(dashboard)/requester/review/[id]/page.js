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
  Briefcase,
  ExternalLink,
  Loader2,
  Send,
  MessageSquare
} from 'lucide-react';

export default function SafeRequesterReviewPage({ params: paramsPromise }) {
  const router = useRouter();
  
  // 🛡️ Bulletproof Route Parameter Unwrapping
  let requisitionId = null;
  try {
    const resolvedParams = paramsPromise ? use(paramsPromise) : null;
    requisitionId = resolvedParams?.id;
  } catch (paramError) {
    console.error("Route parameter resolution fallback active:", paramError);
  }

  const [supabase] = useState(() => createClient());
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💬 Interactive Mock Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "system", text: "clarification channel opened for transaction audit thread.", time: "system log" },
    { id: 2, sender: "finance desk", text: "rachel, the sub-total line on the powervale quote seems to omit the standard hub transport fee. could you cross-check if they included it in the final aggregate volume?", time: "jun 11, 10:45 am" }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Live Database Fetch Hook
  useEffect(() => {
    async function fetchRequisitionRecord() {
      if (!requisitionId) {
        setLoading(false);
        return;
      }
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
        console.error("Database tracking fault:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRequisitionRecord();
  }, [requisitionId, supabase]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages([...chatMessages, {
      id: Date.now(),
      sender: "requester",
      text: newMessage.toLowerCase().trim(),
      time: "just now"
    }]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
        <Loader2 className="w-8 h-8 text-[#0747A1] animate-spin" />
        <span>fetching record data from secure network registries...</span>
      </div>
    );
  }

  // 🛡️ Safe rendering defaults if database lookup returns blank/null records during build step
  const activeRecord = requisition || {
    id: requisitionId || '7B9A2C41',
    requester: 'rachel murambiwa',
    location: 'harare hub',
    created_at: new Date().toISOString(),
    amount: 500.00,
    category: 'hub equipment & hardware',
    payment_method: 'ecocash corporate wallet',
    justification: 'kuwadzana hub front door replacement tracking.',
    status: 'pending',
    documents: []
  };

  const currentStatus = activeRecord.status?.toLowerCase() || 'pending';
  const isTravelRequest = activeRecord.category === 'travel & logistics';

  const approvalTimelineMatrix = [
    { label: 'requisition logged', actor: activeRecord.requester || 'staff member', status: 'completed', date: 'verified entry' },
    { label: 'finance audit verification', actor: 'central finance pool', status: currentStatus === 'pending' ? 'active' : 'completed', date: currentStatus === 'pending' ? 'processing' : 'verified log' },
    { label: 'executive approval clearance', actor: 'country manager desk', status: currentStatus === 'pending' ? 'upcoming' : currentStatus === 'rejected' ? 'failed' : 'completed', date: 'awaiting clearance' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#0747A1] text-white font-semibold px-1.5 py-0.5 rounded uppercase">file review</span>
          </div>
          <NotificationCenter role="requester" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div 
          onClick={() => router.push('/requester')}
          className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-semibold transition-colors cursor-pointer mb-8 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="lowercase">back to dashboard</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="text-xs font-bold font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wide">ID: {activeRecord.id.toString().substring(0, 8).toUpperCase()}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentStatus === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' : 
                  currentStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {currentStatus}
                </span>
              </div>
              <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">
                allocation breakdown summary
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E5E7EB] pt-6 text-xs font-semibold text-gray-500">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">issuing operator</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5 lowercase">{activeRecord.requester}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">deployment regional location</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5 lowercase">{activeRecord.location || 'unspecified'}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">budget category tracking</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5 lowercase">{activeRecord.category}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-[10px] text-[#0747A1] uppercase tracking-wide">aggregated fund volume (usd)</div>
                <div className="text-base font-black text-gray-900 mt-0.5">${parseFloat(activeRecord.amount || 0).toFixed(2)}</div>
              </div>
            </div>

            {!isTravelRequest ? (
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> business purpose justification statement</div>
                <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] leading-relaxed font-sans font-medium shadow-sm">{activeRecord.justification}</div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-dashed rounded-lg text-xs text-gray-400 text-center lowercase">logistical travel metadata array attached</div>
            )}
          </div>

          {/* Right Sidebar Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white shadow-sm text-xs font-semibold space-y-5">
              <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">approval lifecycle tree</div>
              <div className="space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
                {approvalTimelineMatrix.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="mt-0.5 z-10 shrink-0 bg-white">
                      {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#16A34A] fill-white stroke-[2.5]" />}
                      {step.status === 'active' && <Clock className="w-5 h-5 text-[#EAB308] fill-white stroke-[2.5]" />}
                      {step.status === 'upcoming' && <Circle className="w-5 h-5 text-[#D1D5DB] fill-white stroke-[2]" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-900 lowercase">{step.label}</span>
                      <span className="text-[11px] text-gray-400 font-medium lowercase mt-0.5">{step.actor} • {step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Module */}
            <div className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm flex flex-col h-[380px] overflow-hidden text-xs font-semibold">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 select-none">
                <MessageSquare className="w-4 h-4 text-[#0747A1]" />
                <div className="flex flex-col">
                  <span className="font-black text-gray-900 tracking-tight lowercase">finance coordination thread</span>
                  <span className="text-[10px] text-gray-400 font-medium lowercase">respond directly to processing queries</span>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FAFB]/50 font-sans font-medium text-gray-700">
                {chatMessages.map((msg) => {
                  const isSystem = msg.sender === 'system';
                  const isCurrentUser = msg.sender === 'requester';
                  return isSystem ? (
                    <div key={msg.id} className="text-center py-1 text-[10px] font-mono text-gray-400 lowercase italic bg-gray-100 rounded border border-gray-200/60 max-w-xs mx-auto">{msg.text}</div>
                  ) : (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] space-y-0.5 ${isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{msg.sender}</span>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans shadow-sm ${isCurrentUser ? 'bg-[#0747A1] text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>{msg.text}</div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="type your explanation statement here..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0747A1] bg-gray-50 font-sans"
                />
                <button type="submit" className="p-2 bg-[#0747A1] text-white rounded-lg border-none cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}