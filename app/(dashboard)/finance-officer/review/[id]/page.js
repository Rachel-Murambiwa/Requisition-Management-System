"use client";

import { useState, useEffect } from 'react';
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
  ExternalLink,
  Loader2,
  Send,
  MessageSquare,
  Users,
  MapPin,
  Briefcase
} from 'lucide-react';

export default function FinanceOfficerReviewPage({ params }) {
  const router = useRouter();
  const requisitionId = params?.id;

  const [supabase] = useState(() => createClient());
  const [requisition, setRequisition] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💬 Interactive Clarification Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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

        try {
          const { data: attachData } = await supabase
            .from('attachments')
            .select('*')
            .eq('requisition_id', requisitionId);
          if (attachData) setAttachments(attachData);
        } catch (attErr) {
          console.error("Non-blocking attachment sync error:", attErr.message);
        }

      } catch (err) {
        console.error("Database lookup failure:", err.message);
        setRequisition({
          id: requisitionId || '7B9A2C41',
          requester: 'rachel murambiwa',
          location: 'harare hub',
          created_at: new Date().toISOString(),
          amount: 450.00,
          category: 'hub equipment & hardware',
          payment_method: 'ecocash corporate wallet',
          justification: 'purchase of 3 replacement uninterruptible power supply (ups) batteries for the harare hub classroom workstations to sustain teaching capacity during grid load-shedding cycles.',
          is_emergency: false,
          status: 'pending',
          documents: [
            { name: 'quotation_powervale.pdf', size: '142 kb', url: '#' },
            { name: 'quotation_solargen.pdf', size: '198 kb', url: '#' },
            { name: 'vat_cert_powervale.pdf', size: '89 kb', url: '#' }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    async function setupChatStream() {
      if (!requisitionId) return;

      const { data: initialComments } = await supabase
        .from('requisition_comments')
        .select('*')
        .eq('requisition_id', requisitionId)
        .order('created_at', { ascending: true });

      if (initialComments && initialComments.length > 0) {
        setChatMessages(initialComments);
      } else {
        setChatMessages([
          { id: 'sys-init', sender: 'system', text: 'clarification channel opened for transaction audit thread.', created_at: new Date() }
        ]);
      }

      const channel = supabase
        .channel(`comments-fo-window-${requisitionId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'requisition_comments', filter: `requisition_id=eq.${requisitionId}` },
          (payload) => {
            setChatMessages((prev) => {
              if (prev.some(msg => msg.id === payload.new.id)) return prev;
              const filtered = prev.filter(m => m.id !== 'sys-init');
              return [...filtered, payload.new];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    if (requisitionId) {
      fetchRequisitionRecord();
      setupChatStream();
    }
  }, [requisitionId, supabase]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage.toLowerCase().trim();
    setNewMessage('');

    // ✨ OPTIMISTIC UPDATE: Render instantly on your screen so it can't disappear!
    const optimisticMessage = {
      id: `opt-${Date.now()}`,
      requisition_id: requisitionId,
      sender: "finance desk",
      text: textToSend,
      created_at: new Date().toISOString()
    };
    
    setChatMessages((prev) => {
      const filtered = prev.filter(m => m.id !== 'sys-init');
      return [...filtered, optimisticMessage];
    });

    // Save to database background task
    const { error: insertError } = await supabase
      .from('requisition_comments')
      .insert([
        {
          requisition_id: requisitionId,
          sender: "finance desk",
          text: textToSend
        }
      ]);

    if (insertError) {
      console.error("Failed to commit comment transmission:", insertError.message);
      // Remove optimistic token if database completely rejected it
      setChatMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
        <Loader2 className="w-7 h-7 text-[#0747A1] animate-spin" />
        <span>fetching verification manifests...</span>
      </div>
    );
  }

  const currentStatus = requisition?.status?.toLowerCase() || 'pending';
  const isTravelRequest = requisition?.category === 'travel & logistics';

  const approvalTimelineMatrix = [
    { label: 'requisition logged', actor: requisition?.requester || 'staff member', status: 'completed', date: 'verified entry' },
    { label: 'finance audit verification', actor: 'finance officer pool', status: currentStatus === 'pending' ? 'active' : 'completed', date: currentStatus === 'pending' ? 'processing' : 'vetted log' },
    { label: 'executive approval authorization', actor: 'country manager desk', status: currentStatus === 'pending' ? 'upcoming' : currentStatus === 'rejected' ? 'failed' : 'completed', date: 'awaiting clearance' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      <nav className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-black tracking-tight text-[#0747A1]">uncommon</span>
            <span className="text-[10px] bg-[#EFF6FF] text-[#0747A1] border border-blue-50 font-bold px-1.5 py-0.5 rounded uppercase">file review</span>
          </div>
          <NotificationCenter role="finance-officer" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          onClick={() => router.push('/finance-officer')}
          className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-bold cursor-pointer mb-8 select-none lowercase"
        >
          <ArrowLeft className="w-4 h-4" /> back to review pool
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">ID: {requisition.id}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  currentStatus === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' : 
                  currentStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>{currentStatus}</span>
              </div>
              <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">file extraction parameters</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs font-bold text-gray-500">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">issuing staff operator</div>
                <div className="text-sm font-black text-gray-900 mt-0.5 lowercase">{requisition.requester}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">regional deploy hub</div>
                <div className="text-sm font-black text-gray-900 mt-0.5 lowercase">{requisition.location || 'harare hub'}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">procurement group track</div>
                <div className="text-sm font-black text-gray-900 mt-0.5 lowercase">{requisition.category}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-[9px] text-[#0747A1] uppercase tracking-wide">requested capital size</div>
                <div className="text-base font-black text-gray-900 mt-0.5">${parseFloat(requisition.amount).toFixed(2)}</div>
              </div>
            </div>

            {!isTravelRequest ? (
              <div className="space-y-5 text-xs font-bold text-gray-500">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> submission justification logs</div>
                  <div className="p-4 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm text-gray-700 leading-relaxed font-sans font-medium">{requisition.justification}</div>
                </div>

                {((attachments.length > 0 ? attachments : requisition.documents) || []).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400">compliance certificate attachments</div>
                    <div className="space-y-1.5">
                      {(attachments.length > 0 ? attachments : requisition.documents).map((file, i) => (
                        <a key={i} href={file.url || file.storage_path} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-[#0747A1] transition-all no-underline text-inherit group">
                          <span className="text-xs font-bold text-[#0747A1] group-hover:underline flex items-center gap-2 truncate lowercase">
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> {file.name || file.file_name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 shrink-0">{file.size || file.document_class || 'pdf payload'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 pt-2 border-t border-dashed border-gray-200 text-xs font-semibold text-gray-500 animate-fadeIn">
                {requisition.travel_meta?.travelers && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> dispatch crew grouping</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {requisition.travel_meta.travelers.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-gray-50 rounded-md border border-gray-100 flex flex-col"><span className="font-bold text-gray-900 lowercase">{t.name}</span><span className="text-[10px] text-gray-400 lowercase">{t.title}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {requisition.travel_meta?.breakdown && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> budget metric breakdown</h3>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono font-bold text-gray-900">
                      <div className="p-2 bg-gray-50 rounded border"><span className="text-[8px] text-gray-400 font-sans block">ticket</span>${requisition.travel_meta.breakdown.transportCost}</div>
                      <div className="p-2 bg-gray-50 rounded border"><span className="text-[8px] text-gray-400 font-sans block">fuel</span>${requisition.travel_meta.breakdown.fuelCost}</div>
                      <div className="p-2 bg-gray-50 rounded border"><span className="text-[8px] text-gray-400 font-sans block">lodging</span>${requisition.travel_meta.breakdown.lodgingPerDiem}</div>
                      <div className="p-2 bg-gray-50 rounded border"><span className="text-[8px] text-gray-400 font-sans block">meals</span>${requisition.travel_meta.breakdown.mealsPerDiem}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm space-y-4 text-xs font-semibold">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">approval verification tree</div>
              <div className="space-y-4 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {approvalTimelineMatrix.map((step, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    <div className="mt-0.5 z-10 bg-white">
                      {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#16A34A] fill-white stroke-[2.5]" />}
                      {step.status === 'active' && <Clock className="w-4 h-4 text-[#EAB308] fill-white stroke-[2.5]" />}
                      {step.status === 'failed' && <XCircle className="w-4 h-4 text-[#991B1B] fill-white stroke-[2.5]" />}
                      {step.status === 'upcoming' && <Circle className="w-4 h-4 text-gray-200 fill-white stroke-[2]" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold lowercase ${step.status === 'active' ? 'text-amber-600' : 'text-gray-900'}`}>{step.label}</span>
                      <span className="text-[10px] text-gray-400 font-medium lowercase mt-0.5">{step.actor} • {step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm flex flex-col h-[380px] overflow-hidden text-xs font-semibold">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 select-none">
                <MessageSquare className="w-4 h-4 text-[#0747A1]" />
                <div className="flex flex-col">
                  <span className="font-black text-gray-900 tracking-tight lowercase">clarification pipeline feed</span>
                  <span className="text-[10px] text-gray-400 font-medium lowercase">direct communications interface channel</span>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FAFB]/50 font-sans font-medium text-gray-700">
                {chatMessages.map((msg) => {
                  const isSystem = msg.sender === 'system';
                  const isFinanceDesk = msg.sender === 'finance desk';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center py-1 text-[10px] font-mono text-gray-400 lowercase italic bg-gray-100 rounded border border-gray-200/60 max-w-xs mx-auto">
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] space-y-0.5 ${isFinanceDesk ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{msg.sender}</span>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans shadow-sm ${
                        isFinanceDesk ? 'bg-[#0747A1] text-white rounded-tr-none font-medium' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-medium'
                      }`}>{msg.text}</div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="ask for a budget clarification or attachment amendment..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0747A1] bg-gray-50 font-sans"
                />
                <button type="submit" className="p-2 bg-[#0747A1] text-white rounded-lg border-none cursor-pointer hover:opacity-90 transition-opacity shrink-0">
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