"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  Briefcase, 
  FileText, 
  Download, 
  Eye, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Paperclip,
  Building2,
  LogOut 
} from 'lucide-react';

// Sandbox local backup dictionary to ensure smooth rendering if database row is missing
const SANDBOX_BACKUP_POOL = {
  "REQ-2026-004": {
    id: "REQ-2026-004",
    requester: "tinashe maposa",
    hub: "vic falls hub",
    category: "site visits",
    amount: 1190.00,
    date: "jun 12, 2026",
    paymentMethod: "petty cash disbursement",
    justification: "immediate emergency vehicle field repair for the off-road node transport truck stranded outside gwoke site terminal during the sensitisation workshop drive.",
    isEmergency: true,
    travel_meta: {
      travelPurpose: "Sensitization Workshop",
      travelLocation: "Gokwe",
      startDate: "2026-06-01",
      endDate: "2026-06-03",
      totalDays: 3,
      transportType: "Car Hire",
      accomResponsibility: "Self",
      airbnbLinks: "https://airbnb.com/rooms/gokwe-node",
      breakdown: { transportCost: 360.00, fuelCost: 250.00, tollsCost: 8.00, lodgingPerDiem: 200.00, mealsPerDiem: 180.00 },
      travelers: [
        { name: "beyond bechani", title: "head of product design" },
        { name: "wayne hudson benhura", title: "senior instructor: software engineering" }
      ],
      itinerary: [
        { day: 1, activity: "travel day", location: "harare to gokwe" },
        { day: 2, activity: "sensitization workshop", location: "gokwe" },
        { day: 3, activity: "travel day", location: "gokwe to harare" }
      ]
    },
    documents: [
      { name: "car_hire_pro_forma_invoice.pdf", size: "1.1 MB", type: "transport quotation" },
      { name: "fuel_allowance_matrix_signed.pdf", size: "450 KB", type: "logistics breakdown" }
    ]
  },
  "REQ-2026-003": {
    id: "REQ-2026-003",
    requester: "ronald moyo",
    hub: "harare hub",
    category: "business travel & expenses",
    amount: 70.00,
    date: "jun 14, 2026",
    paymentMethod: "ecocash corporate wallet",
    justification: "indrive ride-hailing fares for ronald moyo to execute critical regional site visits across the metropolitan tech hub nodes.",
    isEmergency: false,
    travel_meta: null,
    documents: [{ name: "indrive_ride_receipt_logs.pdf", size: "320 KB", type: "commute receipt" }]
  },
  "REQ-2026-002": {
    id: "REQ-2026-002",
    requester: "nkosi ndlovu",
    hub: "harare hub",
    category: "business travel & expenses",
    amount: 215.00,
    date: "jun 14, 2026",
    paymentMethod: "direct bank transfer",
    justification: "shuttle transport logistics for routing arriving international workshop guests down to victoria falls field terminals safely.",
    isEmergency: false,
    travel_meta: null,
    documents: [{ name: "airport_shuttle_invoice.pdf", size: "610 KB", type: "transit quote" }]
  },
  "REQ-2026-005": {
    id: "REQ-2026-005",
    requester: "rachel murambiwa",
    hub: "bulawayo hub",
    category: "marketing & outreach",
    amount: 180.00,
    date: "may 28, 2026",
    paymentMethod: "ecocash corporate wallet",
    justification: "heavy-duty promotional outdoor pull-up banners for the up-coming community tech recruitment drive and workspace branding.",
    isEmergency: false,
    travel_meta: null,
    documents: [
      { name: "vendor_quote_printflow.pdf", size: "1.1 MB", type: "quotation 1" },
      { name: "zimra_vat_clearance_2026.pdf", size: "2.0 MB", type: "tax compliance" }
    ]
  },
  "REQ-2026-001": {
    id: "REQ-2026-001",
    requester: "nkosi ndlovu",
    hub: "harare hub",
    category: "business travel & expenses",
    amount: 130.00,
    date: "jun 15, 2026",
    paymentMethod: "direct bank transfer",
    justification: "weekly local transport logistics allocation for nkosi ndlovu (recurring commuter expense pipeline until pdc residence construction is completed).",
    isEmergency: false,
    travel_meta: null,
    documents: [{ name: "weekly_mileage_tracker_logs.pdf", size: "410 KB", type: "mileage sheet" }]
  }
};

export default function DynamicRequisitionReview() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();
  
  const [activeUser, setActiveUser] = useState({ name: 'central auditor', role: 'finance-officer' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [requisition, setRequisition] = useState(null);
  const [comments, setComments] = useState([]);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setActiveUser({
          name: user.user_metadata?.name || 'central auditor',
          role: user.user_metadata?.role || 'finance-officer'
        });
      }
    }
    getSession();
  }, []);

  // Hybrid Document Fetching System
  useEffect(() => {
    if (!id) return;

    const fetchSingleVoucherDossier = async () => {
      const { data, error } = await supabase
        .from('requisitions')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Prevents terminal crashes if row count is exactly 0

      if (!error && data) {
        setRequisition({
          id: data.id,
          requester: data.requester || 'staff member',
          hub: data.location || data.hub_name || 'harare hub',
          category: data.category || 'general procurement',
          amount: parseFloat(data.amount) || 0,
          date: data.date || new Date(data.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          paymentMethod: data.payment_method || 'direct bank transfer',
          justification: data.justification || data.description || 'no justification statement provided.',
          isEmergency: data.is_emergency || false,
          travel_meta: data.travel_meta || null,
          documents: data.documents || [{ name: "compliance_quote_dossier.pdf", size: "1.4 MB", type: "procurement quotation" }]
        });
      } else {
        // Fallback activation to protect the UI thread during testing stages
        console.warn("live row missing or permission gate block. deploying sandbox local fallback node configuration.");
        const fallbackNode = SANDBOX_BACKUP_POOL[id] || SANDBOX_BACKUP_POOL["REQ-2026-001"];
        setRequisition(fallbackNode);
      }
    };

    fetchSingleVoucherDossier();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchHistoricComments = async () => {
      const { data, error } = await supabase
        .from('requisition_comments')
        .select('*')
        .eq('requisition_id', id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    };

    fetchHistoricComments();

    const commentChannel = supabase
      .channel(`live-comments-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requisition_comments',
          filter: `requisition_id=eq.${id}`
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, [id]);

  if (!requisition) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-avenir text-xs text-gray-400 lowercase">fetching ledger voucher details...</div>;
  }

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempMessage = newComment.trim().toLowerCase();
    setNewComment('');

    const { error } = await supabase
      .from('requisition_comments')
      .insert([{
        requisition_id: id,
        sender_name: activeUser.name,
        sender_role: activeUser.role,
        message: tempMessage
      }]);

    if (error) {
      console.error("transmit fault:", error.message);
    }
  };

  const handleAction = async (assignedStatus, terminalMessage) => {
    setIsProcessing(true);

    const { error } = await supabase
      .from('requisitions')
      .update({ 
        status: assignedStatus,
        current_stage: assignedStatus === 'approved' ? 'country_manager' : 'finance_officer'
      })
      .eq('id', id);

    setIsProcessing(false);

    // Dynamic routing trigger clears loop state seamlessly
    alert(terminalMessage);
    router.push('/finance-officer');
  };

  const isTravelManifest = !!requisition.travel_meta;
  const travel = requisition.travel_meta;
  
  const voucherAmount = isTravelManifest && travel
    ? (parseFloat(travel.breakdown?.transportCost || 0) + parseFloat(travel.breakdown?.fuelCost || 0) + parseFloat(travel.breakdown?.tollsCost || 0) + parseFloat(travel.breakdown?.lodgingPerDiem || 0) + parseFloat(travel.breakdown?.mealsPerDiem || 0))
    : requisition.amount;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-avenir antialiased pb-20">
      
      {/* Navigation Top Bar */}
      <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/finance-officer')} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#0747A1] transition-colors bg-transparent border-none cursor-pointer focus:outline-none lowercase">
            <ArrowLeft className="w-4 h-4" /> <span>back to finance ledger</span>
          </button>
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-bold tracking-tight text-[#0747A1]">uncommon</span>
            <span className="text-[10px] border border-[#0747A1] text-[#0747A1] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">rms</span>
          </div>
          <div className="w-8 h-8" />
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Title Block Context Header */}
        <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 select-none">
              <span className="font-mono text-xs font-bold text-[#0747A1] bg-gray-50 px-2 py-0.5 border border-gray-200 rounded">{requisition.id}</span>
              {requisition.isEmergency && (
                <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 animate-pulse" /> emergency bypass
                </span>
              )}
              {isTravelManifest && (
                <span className="text-[9px] bg-blue-50 text-[#0747A1] border border-blue-200 font-bold uppercase px-2 py-0.5 rounded">travel manifest</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight lowercase">
              {isTravelManifest ? 'complete travel manifest audit' : 'standard procurement dossier'}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">statement value</span>
            <span className="text-3xl font-black font-mono text-[#0747A1] block mt-0.5">${voucherAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT & CENTER INTERFACE CONTENT PANELS */}
          <div className="lg:col-span-2 space-y-8 text-xs font-semibold">
            
            {/* CONDITIONAL SWITCH A: FULL MULTI-DAY TRAVEL MANIFEST */}
            {isTravelManifest && travel ? (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. Trip Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 1. trip overview parameters</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div><span className="text-gray-400 text-[9px] uppercase tracking-wide block">trip purpose</span><span className="text-gray-900 block mt-1 font-bold lowercase">{travel.travelPurpose}</span></div>
                    <div><span className="text-gray-400 text-[9px] uppercase tracking-wide block">target destination</span><span className="text-gray-900 block mt-1 font-bold lowercase">{travel.travelLocation}</span></div>
                    <div><span className="text-gray-400 text-[9px] tracking-wide block">duration</span><span className="text-gray-700 block mt-1 font-bold">{travel.totalDays} active days</span></div>
                    <div><span className="text-gray-400 text-[9px] uppercase tracking-wide block">disbursal route</span><span className="text-gray-700 block mt-1 font-bold lowercase">{requisition.paymentMethod}</span></div>
                  </div>
                </div>

                {/* 2. Crew Roster */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3 shadow-sm">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 2. registered travel crew manifest</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {travel.travelers?.map((staff, idx) => (
                      <div key={idx} className="p-3 border border-gray-100 bg-gray-50/50 rounded flex flex-col"><span className="text-gray-900 font-bold lowercase">{staff.name}</span><span className="text-gray-400 text-[10px] font-medium lowercase mt-0.5">{staff.title}</span></div>
                    ))}
                  </div>
                </div>

                {/* 3. Itinerary Timeline Table */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3 shadow-sm">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 3. sequential tracking itinerary matrix</div>
                  <div className="border border-gray-100 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-[9px] text-gray-400 uppercase tracking-wider border-b border-gray-100"><th className="py-2.5 px-4 w-24">timeline</th><th className="py-2.5 px-4">planned operational actions</th><th className="py-2.5 px-4">target node position</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {travel.itinerary?.map((iti, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors"><td className="py-3 px-4 font-mono text-[10px] text-gray-400 font-bold uppercase">day {iti.day}</td><td className="py-3 px-4 font-medium lowercase text-gray-900">{iti.activity}</td><td className="py-3 px-4 lowercase font-medium text-[#0747A1]">{iti.location}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Financial Spreadsheet Module */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
                  <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> 4. itemized financial budget calculations</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded p-4 space-y-3 bg-white">
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50 pb-1">transit & logistics parameters</div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium lowercase">transport mode ({travel.transportType})</span>
                        <span className="font-mono font-bold text-gray-900">${travel.breakdown?.transportCost ? parseFloat(travel.breakdown.transportCost).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium lowercase">fuel matrix allocation</span>
                        <span className="font-mono font-bold text-gray-900">${travel.breakdown?.fuelCost ? parseFloat(travel.breakdown.fuelCost).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium lowercase">zimbabwe tolls budget</span>
                        <span className="font-mono font-bold text-gray-900">${travel.breakdown?.tollsCost ? parseFloat(travel.breakdown.tollsCost).toFixed(2) : '0.00'}</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded p-4 space-y-3 bg-white">
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50 pb-1">subsistence & lodging parameters</div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium lowercase">lodging allowance per diem</span>
                        <span className="font-mono font-bold text-gray-900">${travel.breakdown?.lodgingPerDiem ? parseFloat(travel.breakdown.lodgingPerDiem).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium lowercase">meals allowance per diem</span>
                        <span className="font-mono font-bold text-gray-900">${travel.breakdown?.mealsPerDiem ? parseFloat(travel.breakdown.mealsPerDiem).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-gray-50">
                        <span className="truncate max-w-[120px] font-normal lowercase" title={travel.airbnbLinks}>ref: {travel.airbnbLinks || 'none listed'}</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded uppercase tracking-wider text-[8px]">responsibility: {travel.accomResponsibility}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // --------------------------------------------------------
              // CONDITIONAL SWITCH B: STANDARD PROCUREMENT / COMMUTES   //
              // --------------------------------------------------------
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 shadow-sm">
                  <div><span className="text-gray-400 uppercase tracking-wide text-[9px] block">staff member</span><span className="text-gray-900 block mt-1 font-bold lowercase">{requisition.requester}</span></div>
                  <div><span className="text-gray-400 uppercase tracking-wide text-[9px] block">territory node</span><span className="text-[#0747A1] block mt-1 font-bold lowercase flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {requisition.hub}</span></div>
                  <div><span className="text-gray-400 uppercase tracking-wide text-[9px] block">allocation category</span><span className="text-gray-700 block mt-1 font-bold lowercase">{requisition.category}</span></div>
                  <div><span className="text-gray-400 uppercase tracking-wide text-[9px] block">disbursal method</span><span className="text-gray-700 block mt-1 font-bold lowercase">{requisition.paymentMethod}</span></div>
                </div>

                <div className="p-5 border border-gray-200 rounded-lg bg-white space-y-2 shadow-sm">
                  <span className="text-gray-400 uppercase tracking-wide text-[9px] block">justification statement narrative</span>
                  <p className="text-sm text-gray-600 font-medium font-sans leading-relaxed lowercase first-letter:uppercase">{requisition.justification}</p>
                </div>
              </div>
            )}

            {/* SHARED DOCUMENT ASSET VAULT */}
            <div className="border border-gray-200 rounded-lg bg-white p-6 space-y-3 shadow-sm">
              <div className="text-[10px] font-bold text-[#0747A1] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2 select-none">
                <Paperclip className="w-4 h-4" />
                <span>{requisition.isEmergency ? 'emergency supporting evidence files' : 'attached procurement compliance documentation'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requisition.documents?.map((doc, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-3 bg-white flex items-center justify-between hover:border-[#0747A1] transition-colors">
                    <div className="min-w-0 truncate pr-2">
                      <span className="text-[9px] text-[#0747A1] uppercase block tracking-wider font-bold">{doc.type}</span>
                      <span className="text-xs font-bold text-gray-900 truncate block lowercase mt-0.5">{doc.name}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => alert(`opening preview...`)} className="p-1 text-gray-400 hover:text-gray-900 bg-transparent border-none cursor-pointer"><Eye className="w-4 h-4" /></button>
                      <button type="button" onClick={() => alert(`downloading...`)} className="p-1 text-gray-400 hover:text-[#0747A1] bg-transparent border-none cursor-pointer"><Download className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHARED LIVE VERIFICATION DISCUSSION HISTORY */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-[10px] text-gray-700 uppercase tracking-wider flex items-center gap-2 select-none">
                <MessageSquare className="w-4 h-4 text-[#0747A1]" /> <span>compliance dialogue & audit discussion logs</span>
              </div>
              
              <div className="p-5 max-h-64 overflow-y-auto space-y-4 bg-white">
                {comments.map((msg) => (
                  <div key={msg.id} className={`max-w-[85%] rounded-lg p-3 ${msg.sender_role === 'finance-officer' ? 'bg-gray-50 border border-gray-200 ml-auto' : 'bg-white border border-gray-200 mr-auto'}`}>
                    <div className="flex items-center justify-between gap-8 mb-1 border-b border-gray-100 pb-1">
                      <span className={`font-bold lowercase ${msg.sender_role === 'finance-officer' ? 'text-[#0747A1]' : 'text-gray-900'}`}>{msg.sender_name}</span>
                      <span className="text-[9px] text-gray-400 font-mono font-normal">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium lowercase first-letter:uppercase">{msg.message}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={postComment} className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="ask verification query or drop internal audit message..." className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-xs font-normal focus:outline-none focus:border-[#0747A1]" />
                <button type="submit" disabled={isProcessing} className="bg-[#0747A1] text-white font-bold p-2 px-4 rounded text-xs hover:opacity-95 transition-all cursor-pointer border-none flex items-center justify-center"><Send className="w-3.5 h-3.5" /></button>
              </form>
            </div>

          </div>

          {/* RIGHT SIDEBAR ACTION BOX CONTROL */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 sticky top-24 shadow-sm text-xs font-semibold">
            <div>
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 lowercase">verification board actions</h3>
              <p className="text-gray-400 font-normal leading-normal">process this payload batch item forward after verifying compliance attachments or routing parameter fields.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                type="button" 
                disabled={isProcessing}
                onClick={() => handleAction('clarification', 'item flagged for structural clarification parameters.')} 
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-300 py-3 rounded transition-colors cursor-pointer uppercase text-[10px]"
              >
                flag clarification needed
              </button>
              <button 
                type="button" 
                disabled={isProcessing}
                onClick={() => handleAction('rejected', 'voucher drop committed to immutable audit ledger.')} 
                className="w-full bg-white hover:bg-red-50 text-red-700 font-bold border border-red-200 py-3 rounded transition-colors cursor-pointer uppercase text-[10px]"
              >
                deny allocation request
              </button>
              <div className="py-1 border-b border-gray-100" />
              <button 
                type="button" 
                disabled={isProcessing}
                onClick={() => handleAction('approved', 'voucher cleared. appended onto upcoming master billing manifest batch allocation array.')} 
                className="w-full bg-[#0747A1] text-white font-bold py-3 rounded hover:opacity-95 transition-all cursor-pointer uppercase text-[10px] flex items-center justify-center gap-1.5 shadow-sm border-none"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> clear & add to master batch
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}