"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  Search, 
  Check, 
  X, 
  ArrowUpRight, 
  Loader2, 
  LogOut 
} from 'lucide-react';

export default function FinanceOfficerTerminal() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // Real-time Interactive Layout Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Hydrate full pending and historically logged pipeline requests on load
  async function loadCentralAuditQueue() {
    try {
      setLoading(true);
      
      const { data: records, error } = await supabase
        .from('requisitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!records || records.length === 0) {
        setRequisitions([
          {
            id: "7B9A2C41",
            requester: "rachel murambiwa",
            location: "harare hub",
            justification: "high-density replacement server backup battery arrays for workstations",
            category: "hub equipment & hardware",
            amount: 450.00,
            payment_method: "ecocash corporate wallet",
            status: "pending",
            created_at: new Date().toISOString(),
            current_stage: "finance-officer"
          },
          {
            id: "3C8D11A2",
            requester: "chacha maposa",
            location: "bulawayo hub",
            justification: "workshop & classroom coding curriculum text printouts and training assets",
            category: "workshop & classroom supplies",
            amount: 35.00,
            payment_method: "petty cash disbursement",
            status: "pending",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            current_stage: "finance-officer"
          }
        ]);
      } else {
        setRequisitions(records);
      }
    } catch (err) {
      console.error("Central audit synchronization fault:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🚀 AUTO-REFRESH ON TAB CHANGE: Re-fetch from database when the user clicks a filter tab
  useEffect(() => {
    loadCentralAuditQueue();
  }, [supabase, statusFilter]);

  // Execute immediate state transitions directly against the target database record
  const handleUpdateStatus = async (id, targetStatus) => {
    setProcessingId(id);
    try {
      const isApproving = targetStatus === 'approved';
      const nextStage = isApproving ? 'head-of-operations' : 'finance-officer';
      const databaseStatus = isApproving ? 'pending' : 'rejected';

      const { error } = await supabase
        .from('requisitions')
        .update({ 
          status: databaseStatus,
          current_stage: nextStage 
        })
        .eq('id', id);

      if (error) throw error;

      // Fetch freshly updated queue after status change
      await loadCentralAuditQueue();
    } catch (err) {
      alert(`Pipeline transaction faulted: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Helper helper to evaluate if a stage represents Operations/HOOP
  const isOperationsStage = (stage) => {
    if (!stage) return false;
    const clean = stage.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      clean.includes('operations') || 
      clean.includes('hoop') || 
      clean.includes('ops') || 
      clean.includes('manager')
    );
  };

  // Dynamic Regional Live Matrix Metric Accumulators include items advanced to HOOP
  const getRegionalApprovedSum = (slug) => {
    return requisitions
      .filter(r => {
        const statusKey = (r.status || "").toLowerCase().trim();
        const stageKey = (r.current_stage || "").toLowerCase().trim();
        const matchesLocation = r.location?.toLowerCase().includes(slug.toLowerCase());
        
        // Includes anything approved OR sitting at HOOP awaiting sign-off
        const isApprovedOrWithOps = statusKey === 'approved' || 
          (statusKey === 'pending' && isOperationsStage(stageKey));
        
        return isApprovedOrWithOps && matchesLocation;
      })
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  };

  const harareApprovedTotal = getRegionalApprovedSum('harare');
  const vicFallsApprovedTotal = getRegionalApprovedSum('vic falls');
  const bulawayoApprovedTotal = getRegionalApprovedSum('bulawayo');
  
  const grandApprovedTotal = requisitions
    .filter(r => {
      const statusKey = (r.status || "").toLowerCase().trim();
      const stageKey = (r.current_stage || "").toLowerCase().trim();
      return statusKey === 'approved' || 
        (statusKey === 'pending' && isOperationsStage(stageKey));
    })
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  // Filter treats HOOP-forwarded items as 'approved' under this specific dashboard view
  const filteredRequisitions = requisitions.filter(req => {
    const statusKey = (req.status || "").toLowerCase().trim();
    const stageKey = (req.current_stage || "").toLowerCase().trim();

    let rowTabGroup = 'pending';
    
    // 🚀 ULTRA-RESILIENT check for Approved status
    if (statusKey.includes('approved') || statusKey === 'approved') {
      rowTabGroup = 'approved';
    } else if (statusKey.includes('rejected') || statusKey === 'rejected') {
      rowTabGroup = 'rejected';
    } else if (statusKey === 'pending' && isOperationsStage(stageKey)) {
      rowTabGroup = 'approved';
    }

    const matchStatus = statusFilter === 'all' || rowTabGroup === statusFilter;
    const matchRegion = regionFilter === 'all' || req.location?.toLowerCase().includes(regionFilter.toLowerCase());
    const matchSearch = searchQuery.trim() === '' || 
      req.justification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchStatus && matchRegion && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      
      <nav className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-black tracking-tight text-[#0747A1]">uncommon</span>
            <span className="text-[10px] bg-[#EFF6FF] text-[#0747A1] border border-blue-50 font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">rms</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block select-none">
              <div className="text-sm font-black text-gray-900 tracking-tight lowercase">finance desk</div>
              <div className="text-[11px] text-[#6B7280] font-medium lowercase">central billing registry</div>
            </div>
            <div className="h-8 w-px bg-[#E5E7EB] hidden sm:block" />
            
            <div className="text-gray-600 hover:text-[#0747A1] transition-colors flex items-center justify-center">
              <NotificationCenter role="finance-officer" />
            </div>
            
            <div className="h-8 w-px bg-[#E5E7EB]" />
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-700 bg-transparent border-none cursor-pointer transition-colors uppercase tracking-wider">
              <LogOut className="w-4 h-4 text-gray-400" /> sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
          <div className="lg:col-span-2 space-y-4 pt-2">
            <h1 className="text-4xl font-black text-[#0A1628] tracking-tight lowercase">incoming review pool</h1>
            <p className="text-sm text-[#4B5563] font-medium leading-relaxed max-w-2xl">
              cross-examine staff procurement files, request details, and compile approved items for country manager release
            </p>
            <button 
              onClick={() => router.push('/finance-officer/manifest')}
              className="py-2.5 px-5 bg-[#0747A1] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm hover:opacity-95 border-none cursor-pointer transition-all mt-2"
            >
              compile approved manifestation
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm space-y-4">
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider border-b border-gray-100 pb-2">
              approved manifest total
            </div>
            <div className="space-y-2.5 text-xs font-semibold text-gray-600">
              <div className="flex justify-between items-center">
                <span className="lowercase text-gray-400">harare</span>
                <span className="font-mono font-bold text-gray-900">${harareApprovedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="lowercase text-gray-400">vic falls</span>
                <span className="font-mono font-bold text-gray-900">${vicFallsApprovedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="lowercase text-gray-400">bulawayo</span>
                <span className="font-mono font-bold text-gray-900">${bulawayoApprovedTotal.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900 lowercase">grand total</span>
                <span className="font-mono font-black text-[#0747A1]">${grandApprovedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div className="flex bg-gray-100/80 p-1 rounded-lg text-xs font-bold select-none lowercase self-start">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-md border-none focus:outline-none cursor-pointer font-bold transition-all ${
                  statusFilter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'approved' ? 'approved / forwarded' : tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wide text-gray-700 cursor-pointer focus:outline-none focus:border-[#0747A1] appearance-none min-w-[140px]"
              >
                <option value="all">all regions</option>
                <option value="harare">harare</option>
                <option value="bulawayo">bulawayo</option>
                <option value="vic falls">vic falls</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[9px]">▼</span>
            </div>

            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search requests..."
                className="pl-9 pr-4 py-2 border border-gray-300 bg-white rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0747A1] w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
              <Loader2 className="w-7 h-7 text-[#0747A1] animate-spin" />
              <span>refreshing pipeline registers...</span>
            </div>
          ) : filteredRequisitions.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium text-xs space-y-3">
              <div className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center mx-auto text-gray-400 text-sm font-bold font-mono">!</div>
              <p className="lowercase">no records found matching filter constraints</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E5E7EB] text-[#4B5563] font-black uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">id</th>
                    <th className="px-6 py-4">location</th>
                    <th className="px-6 py-4">staff member</th>
                    <th className="px-6 py-4">description specs</th>
                    <th className="px-6 py-4">amount</th>
                    <th className="px-6 py-4 text-right">workflow signature status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700 font-sans">
                  {filteredRequisitions.map((req) => {
                    const statusKey = req.status?.toLowerCase() || 'pending';
                    const currentStage = req.current_stage || 'finance-officer';

                    const requiresQuotes = 
                      parseFloat(req.amount) > 50 && 
                      req.category !== 'travel & logistics' &&
                      req.category !== 'miscellaneous emergency funds' &&
                      !req.is_emergency;
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/40 transition-colors">
                        
                        <td className="px-6 py-4 font-mono font-bold text-[#0747A1] uppercase tracking-wide">
                          {req.id.startsWith("REQ-") ? req.id : `REQ-${req.id.substring(0,8)}`}
                        </td>

                        <td className="px-6 py-4 font-bold text-gray-900 lowercase">
                          {req.location || 'harare'}
                        </td>

                        <td className="px-6 py-4 lowercase font-medium text-gray-600">
                          {req.requester}
                        </td>

                        <td className="px-6 py-4 max-w-xs sm:max-w-md">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-bold lowercase truncate">{req.justification || 'procurement asset deployment'}</span>
                            {requiresQuotes && (
                              <span className="text-[9px] font-black uppercase tracking-wide text-amber-600 mt-0.5 flex items-center gap-1">
                                ⚠️ requires 3 vendor quotations
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-gray-900 text-sm">
                          ${parseFloat(req.amount).toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {currentStage === 'finance-officer' && statusKey === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => router.push(`/finance-officer/review/${req.id}`)}
                                className="p-1.5 border border-gray-200 text-gray-400 hover:text-[#0747A1] hover:border-[#0747A1] bg-white rounded-md cursor-pointer transition-all"
                                title="inspect validation documents"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                disabled={processingId !== null}
                                className="p-1.5 bg-transparent border border-red-200 text-[#991B1B] hover:bg-red-50 rounded-md cursor-pointer transition-colors disabled:opacity-40"
                              >
                                {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(req.id, 'approved')}
                                disabled={processingId !== null}
                                className="p-1.5 bg-[#0747A1] border border-transparent text-white hover:bg-blue-800 rounded-md cursor-pointer transition-colors disabled:opacity-40"
                              >
                                {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all duration-300 ${
                              statusKey === 'approved' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : isOperationsStage(currentStage) && statusKey === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {statusKey === 'approved' 
                                ? 'vetted & authorized' 
                                : isOperationsStage(currentStage) && statusKey === 'pending'
                                  ? 'waiting for operations approval' 
                                  : 'audit rejected'}
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}