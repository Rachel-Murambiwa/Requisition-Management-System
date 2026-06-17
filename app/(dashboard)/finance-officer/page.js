"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare, ArrowRight, LogOut, SlidersHorizontal } from 'lucide-react';

// The comprehensive ledger arriving at the Finance Desk after passing through various stages
const MASTER_TRANSACTION_LEDGER = [
  {
    id: "REQ-2026-001",
    requester: "nkosi ndlovu",
    location: "harare",
    description: "transport for nkosi (recurring until pdc residence is completed)",
    amount: 130.00,
    date: "jun 15, 2026",
    category: "business travel & expenses",
    compliance: "verified",
    status: "approved" // Approved by Head of Operations, ready for invoice manifest
  },
  {
    id: "REQ-2026-002",
    requester: "nkosi ndlovu",
    location: "harare",
    description: "transport for nkosi to vf for guests",
    amount: 215.00,
    date: "jun 14, 2026",
    category: "business travel & expenses",
    compliance: "verified",
    status: "approved" // Approved by Head of Operations, ready for invoice manifest
  },
  {
    id: "REQ-2026-003",
    requester: "ronald moyo",
    location: "harare",
    description: "indrive expenses for ronald - site visits",
    amount: 70.00,
    date: "jun 14, 2026",
    category: "business travel & expenses",
    compliance: "verified",
    status: "approved" // Approved by Head of Operations, ready for invoice manifest
  },
  {
    id: "REQ-2026-004",
    requester: "tinashe maposa",
    location: "vic falls",
    description: "admin travel to gwoke sensitisation workshop",
    amount: 1190.00,
    date: "jun 12, 2026",
    category: "site visits",
    compliance: "emergency_bypass",
    status: "pending" // Still awaiting internal authorization signatures
  },
  {
    id: "REQ-2026-005",
    requester: "rachel murambiwa",
    location: "bulawayo",
    description: "marketing banners for tech recruitment drive",
    amount: 180.00,
    date: "may 28, 2026",
    category: "marketing & outreach",
    compliance: "not_required",
    status: "rejected" // Denied upstream
  }
];

export default function FinanceOfficerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [transactions, setTransactions] = useState(MASTER_TRANSACTION_LEDGER);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Summary box aggregates values STRICTLY from Head of Operations approved requests
  const regionalApprovedTotals = transactions
    .filter(r => r.status === "approved")
    .reduce((acc, item) => {
      const loc = item.location.toLowerCase();
      if (acc[loc] !== undefined) acc[loc] += item.amount;
      return acc;
    }, { harare: 0, "vic falls": 0, bulawayo: 0 });

  const approvedGrandTotal = Object.values(regionalApprovedTotals).reduce((a, b) => a + b, 0);

  // Filter processing matching Tab States + Dropdowns + Text Inputs
  const filteredRequests = transactions.filter(req => {
    const matchesSearch = req.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.requester.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || req.location === selectedLocation;
    const matchesTab = activeTab === "all" || req.status === activeTab;

    return matchesSearch && matchesLocation && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-16">
      
      {/* Navbar Frame */}
      <nav className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-bold tracking-tight text-[#1D4ED8]">uncommon</span>
            <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-badge tracking-wider uppercase">rms</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#0A1628]">finance desk</span>
              <span className="text-xs text-[#4B5563] lowercase">central billing registry</span>
            </div>
            <div className="h-8 w-px bg-[#E5E7EB] hidden sm:block" />
            <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#991B1B] transition-colors focus:outline-none">
              <LogOut className="w-4 h-4 text-[#9CA3AF]" />
              <span className="hidden sm:inline lowercase">sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Workspace Greeting & Top Actions Row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-[#E5E7EB] pb-8 mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">incoming review pool</h1>
            <p className="text-sm text-[#4B5563] mt-1">cross-examine staff procurement files, request details, and compile approved items for country manager release</p>
            
            <button 
              onClick={() => router.push('/finance-officer/manifest')}
              className="mt-6 inline-flex items-center justify-center py-2.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-medium text-xs uppercase tracking-wider rounded-md shadow-sm transition-all cursor-pointer select-none"
            >
              compile approved manifestation
            </button>
          </div>

          {/* Matrix Calculation Summary Display (Tracks Approved Values Only) */}
          <div className="w-full md:max-w-xs border border-[#E5E7EB] bg-white rounded-lg p-4 shadow-sm shrink-0">
            <div className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider mb-2 pb-1.5 border-b border-gray-100">approved manifest total</div>
            <div className="space-y-2 border-b border-[#E5E7EB] pb-2.5">
              <div className="flex justify-between text-xs font-medium text-[#4B5563]">
                <span className="lowercase">harare</span>
                <span className="font-mono font-bold text-[#0A1628]">${regionalApprovedTotals['harare'].toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-[#4B5563]">
                <span className="lowercase">vic falls</span>
                <span className="font-mono font-bold text-[#0A1628]">${regionalApprovedTotals['vic falls'].toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-[#4B5563]">
                <span className="lowercase">bulawayo</span>
                <span className="font-mono font-bold text-[#0A1628]">${regionalApprovedTotals['bulawayo'].toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between pt-2.5 text-xs font-bold text-[#0A1628]">
              <span className="lowercase">grand total</span>
              <span className="font-mono text-[#1D4ED8]">${approvedGrandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controller Assembly */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            
            {/* Expanded Status Filter Tabs */}
            <div className="flex border border-[#E5E7EB] rounded-md p-1 bg-[#F9FAFB] self-start">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors lowercase whitespace-nowrap focus:outline-none ${
                    activeTab === tab ? 'bg-white text-[#1D4ED8] shadow-sm font-semibold' : 'text-[#4B5563] hover:text-[#0A1628]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-md px-3 py-1.5 bg-[#F9FAFB]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#4B5563]" />
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="text-xs bg-transparent text-[#0A1628] font-semibold focus:outline-none cursor-pointer uppercase tracking-wider"
                >
                  <option value="all">all regions</option>
                  <option value="harare">harare</option>
                  <option value="bulawayo">bulawayo</option>
                  <option value="vic falls">vic falls</option>
                </select>
              </div>

              <div className="relative flex items-center w-full sm:max-w-xs">
                <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search requests..."
                  className="w-full pl-10 pr-4 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>
            </div>
          </div>

          {/* REQUESTS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="px-6 py-4">id</th>
                  <th className="px-6 py-4">location</th>
                  <th className="px-6 py-4">staff member</th>
                  <th className="px-6 py-4">description specs</th>
                  <th className="px-6 py-4">amount</th>
                  <th className="px-6 py-4">workflow signature status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#111827]">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition-colors font-sans">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-[#1D4ED8]">{req.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded lowercase">{req.location}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap lowercase text-[#4B5563] font-medium">{req.requester}</td>
                      <td className="px-6 py-4 max-w-xs sm:max-w-md">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0A1628] lowercase line-clamp-1">{req.description}</span>
                          <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wide mt-0.5">{req.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0A1628]">${req.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium lowercase ${
                          req.status === 'approved' ? 'bg-[#DCFCE7] text-[#166534]' : 
                          req.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 
                          'bg-[#FEF9C3] text-[#854D0E]'
                        }`}>
                          {req.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-[#166534]" />}
                          {req.status === 'rejected' && <XCircle className="w-3 h-3 text-[#991B1B]" />}
                          {req.status === 'pending' && <Clock className="w-3 h-3 text-[#854D0E]" />}
                          {req.status === 'approved' ? 'hop approved' : req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 bg-white text-sm text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-[#9CA3AF] stroke-[1.5]" />
                        <span className="lowercase">no records found matching filter constraints</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>
    </div>
  );
}