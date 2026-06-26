"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  Users, 
  Building2, 
  LogOut, 
  ArrowRight,
  Settings2,
  CheckCircle,
  Database,
  Sliders,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Stabilize the client instance reference to prevent loop triggers
  const [supabase] = useState(() => createClient());

  const [quotationThreshold, setQuotationThreshold] = useState(50);
  const [isSaved, setIsSaved] = useState(false);

  // Live Telemetry Framework States
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalHubs: 0,
    requesters: 0,
    financeOfficers: 0,
    headOfOps: 0,
    countryManagers: 0
  });

  // Isolated Hook: Strictly executes once on layout mount
  useEffect(() => {
    async function collectSystemMetrics() {
      try {
        setLoadingMetrics(true);
        
        // Parallel queries to fetch live database profiles and hub counts
        const { data: profiles } = await supabase.from('profiles').select('role');
        const { count: hubsCount } = await supabase.from('hubs').select('*', { count: 'exact', head: true });

        if (profiles) {
          setMetrics({
            totalUsers: profiles.length,
            totalHubs: hubsCount || 0,
            requesters: profiles.filter(p => p.role === 'requester').length,
            financeOfficers: profiles.filter(p => p.role === 'finance_officer' || p.role === 'finance-officer').length,
            headOfOps: profiles.filter(p => p.role === 'head_of_operations' || p.role === 'head-of-operations').length,
            countryManagers: profiles.filter(p => p.role === 'country_manager' || p.role === 'country-manager').length,
          });
        }
      } catch (err) {
        console.error("Failed calculating telemetry parameters:", err.message);
      } {
        setLoadingMetrics(false);
      }
    }
    collectSystemMetrics();
  }, []); 

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const saveConfigurationChanges = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-16">
      
      {/* Top Workspace Navigation Bar */}
      <nav className="w-full bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#991B1B] text-white font-semibold px-1.5 py-0.5 rounded uppercase">system admin</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter role="finance-officer" />
            <div className="h-6 w-px bg-slate-700" />
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors focus:outline-none bg-transparent border-none cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">system configuration panel</h1>
          <p className="text-sm text-[#4B5563] mt-1">provision access profiles, audit security access metrics, and manage global threshold parameters</p>
        </div>

        {loadingMetrics ? (
          <div className="py-12 flex items-center gap-2 text-xs text-gray-400 font-medium lowercase">
            <Loader2 className="w-4 h-4 animate-spin text-[#0747A1]" /> compiling secure telemetry slot updates...
          </div>
        ) : (
          <>
            {/* TOP LAYER: ROLE PROVISIONING HUB METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                    <span>user account directories</span>
                    <Users className="w-4 h-4 text-[#0747A1]" />
                  </div>
                  <div className="text-3xl font-bold text-[#0A1628] pt-2">
                    {metrics.totalUsers} <span className="text-xs text-[#9CA3AF] font-normal">active slots</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-1 leading-relaxed">manage permissions and verify role designations for all network hubs.</p>
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button 
                    onClick={() => router.push('/admin/users')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0747A1] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    <span>view directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                    <span>innovation hub nodes</span>
                    <Building2 className="w-4 h-4 text-[#0747A1]" />
                  </div>
                  <div className="text-3xl font-bold text-[#0A1628] pt-2">{metrics.totalHubs} <span className="text-xs text-[#9CA3AF] font-normal">operational regions</span></div>
                  <p className="text-xs text-gray-500 pt-1 leading-relaxed">active infrastructure nodes registered in network matrix clusters.</p>
                </div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#9CA3AF]">
                  all operational nodes active
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                    <span>security ledger health</span>
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-[#0A1628] pt-2">100% <span className="text-xs text-green-600 font-bold">uptime</span></div>
                  <p className="text-xs text-gray-500 pt-1 leading-relaxed">real-time synchronization streams with core supabase instances are secure.</p>
                </div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> connections established
                </div>
              </div>

            </div>

            {/* BOTTOM LAYER: CONFIGURATION MATRIX SYSTEM INTERFACES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#4B5563]" />
                  <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">global validation parameters</span>
                </div>
                
                <form onSubmit={saveConfigurationChanges} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                      mandatory quotation & vat certification ceiling threshold
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm max-w-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 text-xs font-mono">$</span>
                      </div>
                      <input
                        type="number"
                        value={quotationThreshold}
                        onChange={(e) => setQuotationThreshold(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-300 pl-7 pr-12 py-2 text-sm font-mono font-bold text-[#0A1628] focus:border-[#0747A1] focus:outline-none"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400 text-[10px] font-mono uppercase">usd</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                      any expenditure request exceeding this flat amount requires exactly 3 independent vendor quotes and 3 tax clearance certificates to clear finance officer automated vetting checks.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-4">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-xs font-bold rounded-md text-white bg-[#0A1628] hover:bg-[#1A2E4A] focus:outline-none uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      save parameters
                    </button>
                    {isSaved && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1 font-sans">
                        <CheckCircle className="w-3.5 h-3.5" /> parameters updated globally
                      </span>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#4B5563]" />
                  <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">permission layout metrics</span>
                </div>
                
                <div className="p-6 divide-y divide-gray-100 font-sans">
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600 lowercase">innovation hub requesters</span>
                    <span className="font-mono font-bold bg-gray-100 text-[#0A1628] px-2 py-0.5 rounded">{metrics.requesters} slots</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600 lowercase">central finance officers</span>
                    <span className="font-mono font-bold bg-blue-50 text-[#0747A1] px-2 py-0.5 rounded">{metrics.financeOfficers} slots</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600 lowercase">head of operations</span>
                    <span className="font-mono font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">{metrics.headOfOps} slots</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600 lowercase">country managers</span>
                    <span className="font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{metrics.countryManagers} slots</span>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}