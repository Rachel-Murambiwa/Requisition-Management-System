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
  Loader2,
  Send,
  MessageSquare
} from 'lucide-react';

export default function RequisitionDetailPage({ params: paramsPromise }) {
  const router = useRouter();
  const params = use(paramsPromise);
  const requisitionId = params.id;

  const [supabase] = useState(() => createClient());
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💬 Conversation stream states for the live communication portal
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "system", text: "clarification channel opened for transaction audit thread.", time: "system log" },
    { id: 2, sender: "finance desk", text: "rachel, the sub-total line on the powervale quote seems to omit the standard hub transport fee. could you cross-check if they included it in the final aggregate volume?", time: "jun 11, 10:45 am" }
  ]);
  const [newMessage, setNewMessage] = useState('');

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Return Trigger */}
        <div 
          onClick={() => router.push('/requester')}
          className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-semibold transition-colors cursor-pointer mb-8 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="lowercase">back to dashboard</span>
        </div>

        {/* Responsive 12-Column Layout Grid matching the structural look */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN PANEL: Core Document Overviews (Weight 7) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            
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

            {/* Standard vs Travel Content Rendering Layer Split */}
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
              <div className="space-y-8 pt-4 border-t border-dashed border-gray-200 text-xs font-semibold animate-fadeIn text-gray-600">
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

          {/* RIGHT SIDEBAR PANEL MATRIX: Handles Tree Tracking and Live Chat Component (Weight 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upper Lifecycle Tracker */}
            <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white shadow-sm text-xs font-semibold space-y-6">
              <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider border-b border-[#E5E7EB] pb-3">
                approval lifecycle pipeline
              </div>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
                {approvalTimelineMatrix.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative animate-fadeIn">
                    <div className="mt-0.5 z-10 shrink-0 bg-white">
                      {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#16A34A] fill-white stroke-[2.5]" />}
                      {step.status === 'active' && <Clock className="w-5 h-5 text-[#EAB308] fill-white stroke-[2.5]" />}
                      {step.status === 'failed' && <XCircle className="w-5 h-5 text-[#991B1B] fill-white stroke-[2.5]" />}
                      {step.status === 'upcoming' && <Circle className="w-5 h-5 text-[#D1D5DB] fill-white stroke-[2]" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs font-bold lowercase ${
                        step.status === 'completed' ? 'text-[#0A1628]' :
                        step.status === 'active' ? 'text-[#EAB308]' :
                        step.status === 'failed' ? 'text-[#991B1B]' : 'text-[#9CA3AF]'
                      }`}>{step.label}</span>
                      <span className="text-[11px] text-[#6B7280] font-medium capitalize">{step.actor}</span>
                      <span className="text-[10px] text-[#9CA3AF] font-mono lowercase">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 💬 THE INTERACTIVE CLARIFICATION CHAT PANEL MODULE */}
            <div className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm flex flex-col h-[380px] overflow-hidden text-xs font-semibold">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 select-none">
                <MessageSquare className="w-4 h-4 text-[#0747A1]" />
                <div className="flex flex-col">
                  <span className="font-black text-gray-900 tracking-tight lowercase">finance coordination thread</span>
                  <span className="text-[10px] text-gray-400 font-medium lowercase">respond directly to processing queries</span>
                </div>
              </div>

              {/* Chat Message Logs Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FAFB]/50 font-sans font-medium text-gray-700">
                {chatMessages.map((msg) => {
                  const isSystem = msg.sender === 'system';
                  const isCurrentUser = msg.sender === 'requester';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center py-1 text-[10px] font-mono text-gray-400 lowercase italic bg-gray-100 rounded border border-gray-200/60 max-w-xs mx-auto">
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] space-y-0.5 ${isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{msg.sender}</span>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans shadow-sm ${
                        isCurrentUser 
                          ? 'bg-[#0747A1] text-white rounded-tr-none font-medium' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-medium'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] font-mono text-gray-400 tracking-tight lowercase">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="type your explanation statement here..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0747A1] bg-gray-50 font-sans"
                />
                <button 
                  type="submit" 
                  className="p-2 bg-[#0747A1] text-white rounded-lg border-none cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}