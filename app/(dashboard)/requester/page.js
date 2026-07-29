"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowUpRight, 
  Loader2,
  LogOut,
  MessageSquare
} from 'lucide-react';

export default function RequesterDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [activeUser, setActiveUser] = useState({ name: 'staff member', hub: 'harare' });
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspaceTelemetry() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setActiveUser({
            name: user.user_metadata?.name || 'staff member',
            hub: user.user_metadata?.hub_name || 'harare'
          });

          // 🔒 FILTER BY USER_ID TO PREVENT SHOWING OTHER USERS' REQUISITIONS
          const { data: records, error } = await supabase
            .from('requisitions')
            .select('*')
            .eq('user_id', user.id) // 👈 CRITICAL FIX HERE
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (records) setRequisitions(records);
        }
      } catch (err) {
        console.error("Dashboard telemetry synchronization fault:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceTelemetry();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const totalSpent = requisitions
    .filter(r => r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'disbursed')
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const pendingCount = requisitions.filter(r => 
    r.status?.toLowerCase() === 'pending' || 
    r.status?.toLowerCase() === 'hop_approved' || 
    r.status?.toLowerCase() === 'finance_approved'
  ).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-16">
      
      {/* Top Navigation Frame */}
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#0747A1] text-white font-semibold px-1.5 py-0.5 rounded uppercase">requester panel</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block text-xs font-semibold text-slate-300 lowercase">
              <div>{activeUser.name}</div>
              <div className="text-[10px] text-slate-400">{activeUser.hub} hub</div>
            </div>
            <NotificationCenter role="requester" />
            <div className="h-6 w-px bg-slate-700" />
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">operational dispatch queue</h1>
            <p className="text-sm text-[#4B5563] mt-1">monitor funding cycles, view validation pipeline logs, and dispatch requests</p>
          </div>

          <button 
            onClick={() => router.push('/requester/requisitions/new')}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0747A1] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm border-none cursor-pointer transition-opacity"
          >
            <Plus className="w-4 h-4" /> initialize new request
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
            <Loader2 className="w-8 h-8 text-[#0747A1] animate-spin" />
            <span>compiling matching requisition indices...</span>
          </div>
        ) : (
          <>
            {/* Quick Analytics Stream Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs font-semibold text-gray-500">
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm">
                <div className="uppercase tracking-wider text-[10px] text-gray-400">total records dispatched</div>
                <div className="text-3xl font-black text-[#0A1628] mt-2 font-mono">{requisitions.length} <span className="text-xs font-normal text-gray-400">entries</span></div>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm">
                <div className="uppercase tracking-wider text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> pending review pipelines</div>
                <div className="text-3xl font-black text-amber-600 mt-2 font-mono">{pendingCount} <span className="text-xs font-normal text-gray-400">in audit</span></div>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm">
                <div className="uppercase tracking-wider text-[10px] text-gray-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> released operational capital</div>
                <div className="text-3xl font-black text-green-700 mt-2 font-mono">${totalSpent.toFixed(2)} <span className="text-xs font-normal text-gray-400">usd</span></div>
              </div>
            </div>

            {/* Core Requisitions Historical Ledger Block Grid */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
              {requisitions.length === 0 ? (
                <div className="p-16 text-center text-gray-400 lowercase font-medium text-xs space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
                  <p>your operational database history slice is completely empty.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[#4B5563] font-bold uppercase tracking-wider">
                        <th className="px-5 py-3.5">requisition overview / justification</th>
                        <th className="px-5 py-3.5">asset category</th>
                        <th className="px-5 py-3.5">funding amount</th>
                        <th className="px-5 py-3.5">audit status</th>
                        <th className="px-5 py-3.5 text-right">actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700 font-sans">
                      {requisitions.map((req) => {
                        const currentStatus = req.status?.toLowerCase() || 'pending';
                        return (
                          <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4 max-w-sm">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#0A1628] text-sm lowercase truncate">{req.justification || req.description || 'unspecified asset purchase'}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: {req.id.substring(0, 8).toUpperCase()} • channel: {req.payment_method}</span>
                                
                                {currentStatus === 'rejected' && req.rejection_comment && (
                                  <span className="text-[11px] font-medium text-red-700 bg-red-50 border border-red-100 rounded px-2.5 py-1.5 mt-2 flex items-center gap-1.5 lowercase max-w-fit animate-fadeIn">
                                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-red-500" /> 
                                    <span>reason: {req.rejection_comment}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-500 lowercase font-medium">{req.category}</td>
                            <td className="px-5 py-4 font-mono font-bold text-gray-900">${parseFloat(req.amount).toFixed(2)}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide select-none transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${
                                currentStatus === 'approved' || currentStatus === 'disbursed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                currentStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                                'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {(currentStatus === 'approved' || currentStatus === 'disbursed') && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                                {currentStatus === 'rejected' && <XCircle className="w-3 h-3 text-red-600" />}
                                {(currentStatus === 'pending' || currentStatus === 'hop_approved' || currentStatus === 'finance_approved') && <Clock className="w-3 h-3 text-amber-500" />}
                                {currentStatus}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button 
                                onClick={() => router.push(`/requester/review/${req.id}`)}
                                className="p-1.5 border border-gray-200 text-gray-500 hover:text-[#0747A1] hover:border-[#0747A1] bg-white rounded transition-colors cursor-pointer"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}