"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  ArrowLeft, FileText, CheckCircle2, Circle, Clock, XCircle,
  ExternalLink, Loader2, Send, MessageSquare
} from 'lucide-react';

export default function FinanceOfficerReviewPage({ params }) {
  const router = useRouter();
  const requisitionId = params?.id;

  const [supabase] = useState(() => createClient());
  const [requisition, setRequisition] = useState(null);
  const [attachments, setAttachments] = useState([]); // 📎 Dynamic tracking
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!requisitionId) return;

    async function fetchRequisitionRecord() {
      try {
        // Fetch requisition AND its child attachments simultaneously
        const { data, error: fetchError } = await supabase
          .from('requisitions')
          .select('*, attachments(*)')
          .eq('id', requisitionId)
          .single();

        if (fetchError) throw fetchError;
        setRequisition(data);
        if (data.attachments) setAttachments(data.attachments);
      } catch (err) {
        console.error("Database lookup failure:", err.message);
      } finally {
        setLoading(false);
      }
    }

    async function setupChatStream() {
      const { data: initialComments } = await supabase
        .from('requisition_comments')
        .select('*')
        .eq('requisition_id', requisitionId)
        .order('created_at', { ascending: true });

      if (initialComments) setChatMessages(initialComments);

      const channel = supabase
        .channel(`comments-fo-${requisitionId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'requisition_comments', filter: `requisition_id=eq.${requisitionId}` },
          (payload) => {
            setChatMessages((prev) => {
              if (prev.some(msg => msg.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    fetchRequisitionRecord();
    setupChatStream();
  }, [requisitionId, supabase]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !requisitionId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    await supabase
      .from('requisition_comments')
      .insert([{ requisition_id: requisitionId, sender: 'finance desk', text: messageText }]);
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      <nav className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none"><span className="text-2xl font-black text-[#0747A1]">uncommon</span></div>
          <NotificationCenter role="finance-officer" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div onClick={() => router.push('/finance-officer')} className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-bold cursor-pointer mb-8 lowercase">
          <ArrowLeft className="w-4 h-4" /> back to review pool
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">ID: {requisition?.id?.substring(0,8)}</span>
                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{currentStatus}</span>
              </div>
              <h1 className="text-3xl font-black text-[#0A1628] lowercase">file extraction parameters</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs font-bold text-gray-500">
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-[9px] text-gray-400 uppercase">issuing operator</div><div className="text-sm font-black text-gray-900 lowercase">{requisition?.requester}</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-[9px] text-gray-400 uppercase">regional hub</div><div className="text-sm font-black text-gray-900 lowercase">{requisition?.location || 'harare hub'}</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-[9px] text-gray-400 uppercase">category</div><div className="text-sm font-black text-gray-900 lowercase">{requisition?.category}</div></div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg"><div className="text-[9px] text-[#0747A1] uppercase">amount (usd)</div><div className="text-base font-black text-gray-900">${parseFloat(requisition?.amount || 0).toFixed(2)}</div></div>
            </div>

            <div className="space-y-1.5 text-xs font-bold text-gray-500">
              <div className="text-[10px] uppercase text-gray-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> justification statement</div>
              <div className="p-4 bg-gray-50 border rounded-lg text-sm text-gray-700 font-medium">{requisition?.justification}</div>
            </div>

            {/* 📎 LIVE VETTING ATTACHMENTS */}
            {attachments.length > 0 && (
              <div className="space-y-2 text-xs font-bold text-gray-500">
                <div className="text-[10px] uppercase text-gray-400">compliance certificate attachments ({attachments.length})</div>
                <div className="space-y-1.5">
                  {attachments.map((file) => (
                    <a key={file.id} href={file.storage_path} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border rounded-lg bg-white hover:border-[#0747A1] no-underline text-inherit group">
                      <span className="text-xs font-bold text-[#0747A1] group-hover:underline flex items-center gap-2 truncate lowercase">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> {file.file_name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded border">{file.document_class}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm flex flex-col h-[380px] overflow-hidden text-xs font-semibold">
              <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0747A1]" />
                <span className="font-black text-gray-900 lowercase">clarification pipeline feed</span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FAFB]/50 text-gray-700">
                {chatMessages.map((msg) => {
                  const isFinanceDesk = msg.sender === 'finance desk';
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] space-y-0.5 ${isFinanceDesk ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{msg.sender}</span>
                      <div className={`p-3 rounded-xl text-xs shadow-sm ${isFinanceDesk ? 'bg-[#0747A1] text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'}`}>{msg.text}</div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="ask for a budget clarification..." className="flex-1 px-3 py-2 border rounded-lg text-xs bg-gray-50" />
                <button type="submit" className="p-2 bg-[#0747A1] text-white rounded-lg border-none cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}