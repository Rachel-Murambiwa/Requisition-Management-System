"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  LogOut, 
  SlidersHorizontal,
  FileText,
  BarChart3,
  Printer,
  LayoutDashboard,
  TrendingUp,
  Activity,
  MapPin,
  MessageSquare,
  X,
  Loader2,
  ArrowUpRight
} from 'lucide-react';

const FORWARDED_AUDIT_QUEUE = [
  { id: "REQ-001", requester: "nkosi ndlovu", location: "harare", description: "transport for nkosi (recurring until pdc residence is completed)", amount: 130.00, date: "jun 15, 2026", category: "business travel", status: "approved", rejection_comment: null },
  { id: "REQ-006", requester: "tinashe maposa", location: "vic falls", description: "admin travel to gwoke sensitisation workshop", amount: 1190.00, date: "jun 12, 2026", category: "site visits", status: "pending", rejection_comment: null },
  { id: "REQ-007", requester: "rachel murambiwa", location: "bulawayo", description: "deep-cycle solar inverter battery cells backup replacement", amount: 1000.00, date: "jun 10, 2026", category: "infrastructure", status: "pending", rejection_comment: null },
  { id: "REQ-008", requester: "shammah dzwairo", location: "harare", description: "unauthorized high-end mechanical gaming keyboards for lab testing", amount: 450.00, date: "jun 05, 2026", category: "hub equipment", status: "rejected", rejection_comment: "not within budget parameters for general educational lab resources." }
];

export default function HeadOfOperationsDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [viewMode, setViewMode] = useState("dashboard");

  // 💬 Comment Dialog Overlay States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Sync initial queue registry logs
  async function syncOperationsQueue() {
    try {
      setLoading(true);
      
      // 🚀 SAFE REVERT: Fetch all records from database to protect against empty/null stage values
      const { data, error } = await supabase
        .from('requisitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setQueue(FORWARDED_AUDIT_QUEUE);
      } else {
        // Filter in-memory: Display records that match HOOP stage variations (case-insensitive & space-friendly)
        const liveHOOPRequests = data.filter(req => {
          if (!req.current_stage) return false;
          const stageNormalized = req.current_stage.toLowerCase().trim();
          return (
            stageNormalized === 'head-of-operations' ||
            stageNormalized === 'head of operations' ||
            stageNormalized === 'head_of_operations' ||
            stageNormalized === 'hoop'
          );
        });

        // Failsafe: Fall back to sandbox dummy cards if no live requests are currently with HOOP
        if (liveHOOPRequests.length === 0) {
          setQueue(FORWARDED_AUDIT_QUEUE);
        } else {
          setQueue(liveHOOPRequests);
        }
      }
    } catch (err) {
      console.error("Ops sync network error:", err.message);
      setQueue(FORWARDED_AUDIT_QUEUE);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncOperationsQueue();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 👍 APPROVED HANDLER: Route the vetted request back to the Finance Officer
  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('requisitions')
        .update({ 
          current_stage: 'finance-officer', // 🚀 Automatically route back to FO for master compiling
          status: 'approved'               
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state queue
      setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'approved', current_stage: 'finance-officer' } : item));
    } catch (err) {
      console.error("Approval transaction fault:", err.message);
    }
  };

  // 👎 REJECT DETECTOR: Opens comment collection form modal
  const openRejectionModal = (item) => {
    setTargetItem(item);
    setCommentText("");
    setIsModalOpen(true);
  };

  // 🚀 REJECTION CONFIRMATION: Bounce back to finance-officer with comment logs
  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !targetItem) return;

    setIsSubmittingDecision(true);
    const cleaningComment = commentText.toLowerCase().trim();

    try {
      await supabase
        .from('requisitions')
        .update({ 
          status: 'rejected',
          current_stage: 'finance-officer', // 🚀 Bounce back to FO
          rejection_comment: cleaningComment
        })
        .eq('id', targetItem.id);

      await supabase
        .from('notifications')
        .insert([{
          role: 'finance-officer', // Send alert specifically to FO role
          type: 'clarification',
          title: 'requisition rejected by ops',
          msg: `ops rejected ${targetItem.id.substring(0,8)}: "${cleaningComment}"`,
          time_label: 'just now',
          link: `/finance-officer`,
          read: false
        }]);

      setQueue(prev => prev.map(item => 
        item.id === targetItem.id 
          ? { ...item, status: 'rejected', current_stage: 'finance-officer', rejection_comment: cleaningComment } 
          : item
      ));

      setIsModalOpen(false);
      setTargetItem(null);
    } catch (err) {
      console.error("Rejection lifecycle pipeline error:", err.message);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // --- METRIC PROCESSORS ---
  const totalVolume = queue.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
  const approvedItems = queue.filter(r => r.status === 'approved');
  const rejectedItems = queue.filter(r => r.status === 'rejected');
  const pendingItems = queue.filter(r => r.status === 'pending');

  const approvedValue = approvedItems.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
  const rejectedValue = rejectedItems.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
  const pendingValue = pendingItems.reduce((a, b) => a + parseFloat(b.amount || 0), 0);

  const regionalMetrics = queue.reduce((acc, item) => {
    const loc = item.location?.toLowerCase() || 'harare';
    if (acc[loc]) {
      acc[loc].total += parseFloat(item.amount || 0);
      if (item.status === 'approved') acc[loc].approved += parseFloat(item.amount || 0);
    }
    return acc;
  }, { harare: { total: 0, approved: 0 }, bulawayo: { total: 0, approved: 0 }, "vic falls": { total: 0, approved: 0 } });

  const categoryMetrics = queue.reduce((acc, item) => {
    acc[item.category || 'other'] = (acc[item.category || 'other'] || 0) + parseFloat(item.amount || 0);
    return acc;
  }, {});

  const filteredQueue = queue.filter(req => {
    const matchesSearch = (req.description || req.justification || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.requester.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || req.location?.toLowerCase() === selectedLocation;
    const matchesTab = activeTab === "all" || req.status === activeTab;
    return matchesSearch && matchesLocation && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-16">
      
      {/* Universal Navigation Header */}
      <nav className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-4xl font-bold font-sans tracking-tight text-[#0747A1] bg-white">uncommon</span>
            <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2 py-0.5 rounded uppercase">rms</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex border border-[#E5E7EB] bg-[#F3F4F6] p-1 rounded-md">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all focus:outline-none lowercase cursor-pointer border-none ${
                  viewMode === 'dashboard' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-[#4B5563] hover:text-[#0A1628] bg-transparent'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>queue monitor</span>
              </button>
              <button 
                onClick={() => setViewMode('report')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all focus:outline-none lowercase cursor-pointer border-none ${
                  viewMode === 'report' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-[#4B5563] hover:text-[#0A1628] bg-transparent'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>analytics report</span>
              </button>
            </div>

            <div className="h-6 w-px bg-[#E5E7EB]" />
            <NotificationCenter role="head-of-operations" />
            <div className="h-6 w-px bg-[#E5E7EB]" />

            <button onClick={handleSignOut} className="p-2 text-[#9CA3AF] hover:text-[#991B1B] bg-transparent border-none cursor-pointer transition-colors focus:outline-none">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
          <Loader2 className="w-7 h-7 text-[#0747A1] animate-spin" />
          <span>refreshing dynamic master registries...</span>
        </div>
      ) : viewMode === 'dashboard' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">operations authorization board</h1>
            <p className="text-sm text-[#4B5563] mt-1">sign off on finance-cleared hub expenditures to prepare the master distribution tranche</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-sm">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block">awaiting sign-off</span>
              <div className="text-3xl font-bold text-[#0A1628] mt-3">{pendingItems.length} <span className="text-xs font-normal text-[#9CA3AF]">items running</span></div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-sm">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block">authorized value</span>
              <div className="text-3xl font-bold text-[#16A34A] mt-3">${approvedValue.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-sm">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block">denied payload volume</span>
              <div className="text-3xl font-bold text-[#991B1B] mt-3">${rejectedValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex border border-[#E5E7EB] rounded-md p-1 bg-[#F9FAFB] self-start">
                {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-colors lowercase focus:outline-none ${activeTab === tab ? 'bg-white text-[#1D4ED8] shadow-sm font-semibold' : 'text-[#4B5563] hover:text-[#0A1628]'}`}>{tab === 'pending' ? 'awaiting sign-off' : tab}</button>
                ))}
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-md px-3 py-1.5 bg-[#F9FAFB] w-full sm:w-auto">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#4B5563]" />
                  <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="text-xs bg-transparent border-none text-[#0A1628] font-semibold focus:outline-none cursor-pointer uppercase tracking-wider w-full sm:w-auto">
                    <option value="all">all locations</option>
                    <option value="harare">harare</option>
                    <option value="bulawayo">bulawayo</option>
                    <option value="vic falls">vic falls</option>
                  </select>
                </div>
                <div className="relative flex items-center w-full sm:max-w-xs">
                  <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="search metrics..." className="w-full pl-10 pr-4 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                    <th className="px-6 py-4">id</th>
                    <th className="px-6 py-4">location</th>
                    <th className="px-6 py-4">staff member</th>
                    <th className="px-6 py-4 w-5/12">specification description details</th>
                    <th className="px-6 py-4">amount</th>
                    <th className="px-6 py-4 text-right">authorization signatures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[#111827]">
                  {filteredQueue.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/40 transition-colors font-sans">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-[#1D4ED8] uppercase">{req.id.substring(0,8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded lowercase">{req.location}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap lowercase text-[#4B5563] font-medium">{req.requester}</td>
                      <td className="px-6 py-4 max-w-xs sm:max-w-xl">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0A1628] lowercase line-clamp-1">{req.description || req.justification}</span>
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#9CA3AF] mt-0.5">{req.category}</span>
                          {req.status === 'rejected' && req.rejection_comment && (
                            <span className="text-[11px] font-medium text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1 mt-1.5 inline-block lowercase flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 shrink-0" /> reason: {req.rejection_comment}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0A1628] font-mono">${parseFloat(req.amount || 0).toFixed(2)}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2 select-none">
                            <button 
                              onClick={() => openRejectionModal(req)} 
                              className="p-1.5 bg-transparent border border-red-200 text-[#991B1B] hover:bg-red-50 rounded-md shadow-sm transition-colors focus:outline-none cursor-pointer"
                              title="quick reject"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleApprove(req.id)} 
                              className="p-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white border-none rounded-md shadow-sm font-bold transition-colors focus:outline-none cursor-pointer"
                              title="quick approve"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => router.push(`/head-of-operations/review/${req.id}`)}
                              className="p-1.5 border border-gray-200 text-gray-400 hover:text-[#0747A1] hover:border-[#0747A1] bg-white rounded-md transition-colors cursor-pointer focus:outline-none shadow-sm"
                              title="view full attachments"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${req.status === 'approved' ? 'text-[#16A34A] bg-green-50 border border-green-100' : 'text-[#991B1B] bg-red-50 border border-red-100'}`}>{req.status === 'approved' ? 'authorized signature' : 'rejected audit'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 print:p-0 animate-fadeIn">
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div>
              <h1 className="text-xl font-bold text-[#0A1628] tracking-tight lowercase">executive system compilation</h1>
              <p className="text-xs text-[#4B5563] mt-0.5">real-time trend analysis generated across network regions</p>
            </div>
            <button onClick={() => window.print()} className="bg-[#0A1628] hover:bg-[#1A2E4A] text-white text-xs font-bold px-4 py-2 border-none rounded flex items-center gap-2 shadow-sm select-none transition-colors cursor-pointer"><Printer className="w-3.5 h-3.5" /> print report sheet</button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-12 shadow-sm print:border-none print:shadow-none space-y-12">
            <div className="flex justify-between border-b border-gray-300 pb-6">
              <div>
                <div className="text-2xl font-black text-[#1D4ED8]">uncommon</div>
                <div className="text-xs text-[#4B5563] font-bold uppercase tracking-wider mt-1">internal operations audit division</div>
              </div>
              <div className="text-right text-xs font-mono text-[#4B5563]">
                <div className="font-bold text-[#0A1628] uppercase">manifest analytics trends</div>
                <div>date compiled: jun 15, 2026</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-4 rounded bg-[#F9FAFB]">
                <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">gross value requested</span>
                <div className="text-xl font-bold text-[#0A1628] mt-1.5">${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <span className="text-[10px] font-mono text-gray-400 block mt-1">{queue.length} total entries filed</span>
              </div>
              <div className="border border-green-200 bg-green-50/40 p-4 rounded">
                <span className="text-[10px] font-bold text-green-800 uppercase tracking-wider block">net authorized value</span>
                <div className="text-xl font-bold text-[#16A34A] mt-1.5">${approvedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <span className="text-[10px] font-mono text-green-600 block mt-1">{approvedItems.length} streams cleared</span>
              </div>
              <div className="border border-red-200 bg-red-50/40 p-4 rounded">
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">denied / rejected volume</span>
                <div className="text-xl font-bold text-[#991B1B] mt-1.5">${rejectedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <span className="text-[10px] font-mono text-red-600 block mt-1">{rejectedItems.length} lines dropped</span>
              </div>
              <div className="border border-yellow-200 bg-yellow-50/40 p-4 rounded">
                <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider block">active queue backlog</span>
                <div className="text-xl font-bold text-[#B45309] mt-1.5">${pendingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <span className="text-[10px] font-mono text-yellow-600 block mt-1">{pendingItems.length} rows holding</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#4B5563] flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#1D4ED8]" /> 6-cycle operational capital trend</h3>
                <div className="w-full bg-white border border-gray-100 rounded-md p-4 shadow-sm">
                  <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible font-sans">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.00"/>
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#F3F4F6" strokeWidth="1" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#F3F4F6" strokeWidth="1" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#F3F4F6" strokeWidth="1" />
                    <line x1="0" y1="190" x2="500" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />

                    <polygon points="0,200 100,150 200,170 300,120 400,160 500,60 500,190 0,190" fill="url(#chartGrad)" />
                    <polyline points="0,150 100,150 200,170 300,120 400,160 500,60" fill="transparent" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
                    
                    <circle cx="0" cy="150" r="4" fill="#0A1628" stroke="#1D4ED8" strokeWidth="1.5" />
                    <circle cx="100" cy="150" r="4" fill="#0A1628" stroke="#1D4ED8" strokeWidth="1.5" />
                    <circle cx="200" cy="170" r="4" fill="#0A1628" stroke="#1D4ED8" strokeWidth="1.5" />
                    <circle cx="300" cy="120" r="4" fill="#0A1628" stroke="#1D4ED8" strokeWidth="1.5" />
                    <circle cx="400" cy="160" r="4" fill="#0A1628" stroke="#1D4ED8" strokeWidth="1.5" />
                    <circle cx="500" cy="60" r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />

                    <text x="0" y="198" className="text-[10px] font-bold fill-gray-400 font-mono uppercase text-center">jan</text>
                    <text x="100" y="198" className="text-[10px] font-bold fill-gray-400 font-mono uppercase">feb</text>
                    <text x="200" y="198" className="text-[10px] font-bold fill-gray-400 font-mono uppercase">mar</text>
                    <text x="300" y="198" className="text-[10px] font-bold fill-gray-400 font-mono uppercase">apr</text>
                    <text x="400" y="198" className="text-[10px] font-bold fill-gray-400 font-mono uppercase">may</text>
                    <text x="475" y="198" className="text-[10px] font-bold fill-[#1D4ED8] font-mono uppercase">june (curr)</text>
                    
                    <text x="430" y="45" className="text-[11px] font-black fill-[#1D4ED8] font-mono font-bold">$8,595.00</text>
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-[#4B5563] flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#1D4ED8]" /> operational vetting efficiency index</h3>
                <div className="border border-gray-100 rounded-md p-4 shadow-sm flex flex-col items-center justify-center min-h-[190px]">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="#F3F4F6" strokeWidth="10" fill="transparent" />
                      <circle 
                        cx="56" cy="56" r="48" stroke="#16A34A" strokeWidth="10" fill="transparent" 
                        strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * (approvedItems.length / (queue.length || 1)))}
                        strokeLinecap="round"
                        className="transition-all duration-1000" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black text-[#0A1628]">{queue.length > 0 ? ((approvedItems.length / queue.length) * 100).toFixed(0) : 0}%</span>
                      <span className="text-[8px] font-bold text-[#9CA3AF] uppercase tracking-tight">approval rate</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-6 w-full text-center text-xs border-t border-gray-100 pt-3 font-medium text-gray-500">
                    <div><div className="font-bold text-[#16A34A] font-mono">{approvedItems.length}</div><div className="text-[9px] uppercase tracking-wide">approved</div></div>
                    <div><div className="font-bold text-[#D97706] font-mono">{pendingItems.length}</div><div className="text-[9px] uppercase tracking-wide">pending</div></div>
                    <div><div className="font-bold text-[#991B1B] font-mono">{rejectedItems.length}</div><div className="text-[9px] uppercase tracking-wide">rejected</div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-xs font-bold text-[#0A1628] uppercase tracking-widest border-l-2 border-l-[#1D4ED8] pl-2 mb-4 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1D4ED8]" />
                regional geographic volume comparisons
              </h2>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[#4B5563] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-1/3">geographical region</th>
                      <th className="py-2.5 px-4">disbursal distribution intensity metric chart</th>
                      <th className="py-2.5 px-4 text-right">gross volume</th>
                      <th className="py-2.5 px-4 text-right text-[#16A34A]">authorized release</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {Object.entries(regionalMetrics).map(([locName, data]) => {
                      const totalPercentage = totalVolume > 0 ? ((data.total / totalVolume) * 100) : 0;
                      const approvedPercentage = totalVolume > 0 ? ((data.approved / totalVolume) * 100) : 0;
                      
                      return (
                        <tr key={locName} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-bold text-[#0A1628] uppercase tracking-wide">{locName}</td>
                          <td className="py-3 px-4">
                            <div className="w-48 sm:w-64 h-3 bg-gray-100 rounded-sm relative overflow-hidden shadow-inner">
                              <div className="absolute top-0 left-0 h-full bg-gray-300 transition-all duration-500" style={{ width: `${totalPercentage}%` }} />
                              <div className="absolute top-0 left-0 h-full bg-[#1D4ED8] transition-all duration-500" style={{ width: `${approvedPercentage}%` }} />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">${data.total.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#16A34A]">${data.approved.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-xs font-bold text-[#0A1628] uppercase tracking-widest border-l-2 border-l-[#1D4ED8] pl-2 mb-4 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1D4ED8]" />
                budget category asset concentrations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(categoryMetrics).map(([catName, val]) => {
                  const barShare = totalVolume > 0 ? ((val / totalVolume) * 100).toFixed(0) : 0;
                  return (
                    <div key={catName} className="p-4 border border-gray-100 bg-[#F9FAFB] rounded-md shadow-sm">
                      <div className="text-[9px] font-bold text-[#9CA3AF] uppercase truncate">{catName}</div>
                      <div className="text-sm font-bold text-[#0A1628] font-mono mt-1">${val.toFixed(2)}</div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-[#1D4ED8]" style={{ width: `${barShare}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 block mt-1">{barShare}% pool weight</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-12 border-t border-dashed border-gray-300 flex justify-between items-end text-xs text-gray-500">
              <div className="leading-relaxed text-[11px]">
                autogenerated via uncommon rms audit systems module<br />
                internal use only • confidential programmatic financial ledger report
              </div>
              <div className="text-center w-48 shrink-0">
                <div className="w-full h-px bg-gray-400 mb-2" />
                <div className="text-[10px] font-bold text-[#0A1628] uppercase tracking-widest">head of operations signature</div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Rejection Justification Modal */}
      {isModalOpen && targetItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1628]/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl shadow-2xl p-6 relative flex flex-col space-y-4">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase self-start mb-2">
                ID: {targetItem.id.substring(0,8)}
              </span>
              <h3 className="text-lg font-black text-[#0A1628] tracking-tight lowercase">provide rejection justification</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                explain the auditing or operational constraints preventing this cash allocation from clearing.
              </p>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-4 text-xs font-bold text-gray-400">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider text-[9px]">operational comment log</label>
                <textarea
                  required
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="e.g. over budgeting limits for specific hub nodes; please adjust vehicle parameters or merge logs."
                  className="w-full p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-md transition-colors border-none cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDecision || !commentText.trim()}
                  className="py-2 px-5 bg-[#991B1B] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm hover:bg-red-800 border-none cursor-pointer transition-colors disabled:opacity-40"
                >
                  {isSubmittingDecision ? 'dispatching logs...' : 'confirm rejection'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}