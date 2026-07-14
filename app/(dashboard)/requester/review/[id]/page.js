"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  ArrowLeft, 
  Calendar, 
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

export default function RequesterReviewDetailPage({ params }) {
  const router = useRouter();
  const requisitionId = params?.id;

  const [supabase] = useState(() => createClient());
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clarification Chat States
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
      } catch (err) {
        console.error("Database lookup failure:", err.message);
        // Fallback testing state
        setRequisition({
          id: requisitionId || 'REQ-20260714-E271',
          requester: 'chacha',
          location: 'harare',
          created_at: new Date().toISOString(),
          amount: 1624.00,
          category: 'travel & logistics',
          payment_method: 'direct bank transfer',
          justification: 'travel purpose: sensitization workshop. location route: vic falls.',
          is_emergency: false,
          status: 'pending',
          travel_meta: {
            travelPurpose: 'sensitization workshop',
            travelLocation: 'vic falls',
            startDate: '2026-07-15',
            endDate: '2026-07-20',
            totalDays: 5,
            transportType: 'personal vehicle',
            accomResponsibility: 'Self',
            airbnbLinks: '',
            breakdown: { transportCost: '0', fuelCost: '400', tollsCost: '24', lodgingPerDiem: '20', mealsPerDiem: '50' },
            travelers: [
              { name: 'rachel', title: 'intern' },
              { name: 'vimbai', title: 'hr' }
            ],
            itinerary: [
              { day: 1, activity: 'Food', location: 'Vic Falls' },
              { day: 2, activity: 'Food + Activities', location: 'Vic Falls' },
              { day: 3, activity: 'Food + Activities', location: 'Vic Falls' },
              { day: 4, activity: 'Food + Activities', location: 'Vic Falls' },
              { day: 5, activity: 'Food', location: 'Vic Falls' }
            ]
          }
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

    const optimisticMessage = {
      id: `opt-${Date.now()}`,
      requisition_id: requisitionId,
      sender: "requester",
      text: textToSend,
      created_at: new Date().toISOString()
    };
    
    setChatMessages((prev) => [...prev.filter(m => m.id !== 'sys-init'), optimisticMessage]);

    await supabase
      .from('requisition_comments')
      .insert([{ requisition_id: requisitionId, sender: "requester", text: textToSend }]);
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#0747A1] text-white font-semibold px-1.5 py-0.5 rounded uppercase">requester review</span>
          </div>
          <NotificationCenter role="requester" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div onClick={() => router.push('/requester')} className="inline-flex items-center gap-2 text-xs text-[#4B5563] hover:text-[#0747A1] font-bold cursor-pointer mb-8 select-none lowercase">
          <ArrowLeft className="w-4 h-4" /> back to dashboard
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">ID: {requisition.id}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  currentStatus === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' : 
                  currentStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>{currentStatus}</span>
              </div>
              <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">allocation breakdown summary</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs font-bold text-gray-500">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">issuing operator</div>
                <div className="text-sm font-black text-gray-900 mt-0.5 lowercase">{requisition.requester}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">deployment regional location</div>
                <div className="text-sm font-black text-gray-900 mt-0.5 lowercase">{requisition.location}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">budget category tracking</div>
                <div className="text-sm font-black text-gray-900 mt-0.5 lowercase">{requisition.category}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-[9px] text-[#0747A1] uppercase tracking-wide">aggregated fund volume (usd)</div>
                <div className="text-base font-black text-gray-900 mt-0.5">${parseFloat(requisition.amount).toFixed(2)}</div>
              </div>
            </div>

            {isTravelRequest && (
              <div className="space-y-6 pt-4 border-t border-dashed border-gray-200 text-xs font-semibold text-gray-500">
                {/* travelers manifest */}
                {requisition.travel_meta?.travelers && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> traveling group personnel manifest</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {requisition.travel_meta.travelers.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-gray-50 rounded-md border border-gray-100 flex flex-col">
                          <span className="font-bold text-gray-900 lowercase">{t.name}</span>
                          <span className="text-[10px] text-gray-400 lowercase">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* trip parameters */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> travel routing specs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center font-bold text-gray-900">
                    <div className="p-2.5 bg-gray-50 rounded border text-left">
                      <span className="text-[8px] text-gray-400 uppercase block">duration</span>
                      <span className="text-xs font-black text-gray-900">{requisition.travel_meta?.totalDays || 1} days</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded border text-left">
                      <span className="text-[8px] text-gray-400 uppercase block">lodging responsibility</span>
                      <span className="text-xs font-black text-gray-900 lowercase">{requisition.travel_meta?.accomResponsibility === 'Self' ? 'self' : 'uncommon'}</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded border text-left">
                      <span className="text-[8px] text-gray-400 uppercase block">transit scheme</span>
                      <span className="text-xs font-black text-gray-900 lowercase">{requisition.travel_meta?.transportType}</span>
                    </div>
                  </div>
                </div>

                {/* itinerary matrix */}
                {requisition.travel_meta?.itinerary && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> daily scheduled itinerary matrix</h3>
                    <div className="space-y-1.5">
                      {requisition.travel_meta.itinerary.map((iti, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#F9FAFB] p-2 border border-gray-100 rounded-md text-xs">
                          <span className="col-span-2 text-[9px] text-gray-400 font-mono text-center uppercase">day {iti.day}</span>
                          <span className="col-span-6 text-gray-800 font-bold lowercase">{iti.activity}</span>
                          <span className="col-span-4 text-gray-400 font-bold text-right lowercase">{iti.location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* budget metric breakdown with step-by-step math scaling */}
                {requisition.travel_meta?.breakdown && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> budget metric breakdown</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono font-bold text-gray-900">
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-[8px] text-gray-400 font-sans block uppercase">ticket cost</span>
                          <span className="text-[9px] text-gray-400 font-sans block mt-0.5">flat total</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">${requisition.travel_meta.breakdown.transportCost}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-[8px] text-gray-400 font-sans block uppercase">estimated fuel</span>
                          <span className="text-[9px] text-gray-400 font-sans block mt-0.5">flat total</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">${requisition.travel_meta.breakdown.fuelCost}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-[8px] text-gray-400 font-sans block uppercase">lodging per-diem</span>
                          <span className="text-[8px] text-blue-700 font-sans block mt-0.5">
                            ${requisition.travel_meta.breakdown.lodgingPerDiem}/d × {requisition.travel_meta.totalDays || 1}d × {requisition.travel_meta.travelers?.length || 1}p
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">
                          ${(parseFloat(requisition.travel_meta.breakdown.lodgingPerDiem) || 0) * (requisition.travel_meta.totalDays || 1) * (requisition.travel_meta.travelers?.length || 1)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-100 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-[8px] text-gray-400 font-sans block uppercase">meals per-diem</span>
                          <span className="text-[8px] text-blue-700 font-sans block mt-0.5">
                            ${requisition.travel_meta.breakdown.mealsPerDiem}/d × {requisition.travel_meta.totalDays || 1}d × {requisition.travel_meta.travelers?.length || 1}p
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">
                          ${(parseFloat(requisition.travel_meta.breakdown.mealsPerDiem) || 0) * (requisition.travel_meta.totalDays || 1) * (requisition.travel_meta.travelers?.length || 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Clarification feed sidebar */}
          <div className="lg:col-span-5">
            <div className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm flex flex-col h-[480px] overflow-hidden text-xs font-semibold">
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
                  const isRequester = msg.sender === 'requester';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center py-1 text-[10px] font-mono text-gray-400 lowercase italic bg-gray-100 rounded border border-gray-200/60 max-w-xs mx-auto">
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] space-y-0.5 ${isRequester ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{msg.sender}</span>
                      <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans shadow-sm ${
                        isRequester ? 'bg-[#0747A1] text-white rounded-tr-none font-medium' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-medium'
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
                  placeholder="type verification notes..."
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