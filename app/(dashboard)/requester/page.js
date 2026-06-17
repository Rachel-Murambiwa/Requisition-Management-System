"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  LogOut 
} from 'lucide-react';

// Mock dataset reflecting operational realities across different Innovation Hubs
const INITIAL_REQUISITIONS = [
  {
    id: "REQ-2026-001",
    title: "inverter battery replacements - bulawayo hub",
    amount: 1450.00,
    date: "jun 10, 2026",
    category: "hub equipment & hardware",
    stage: "finance review",
    status: "pending"
  },
  {
    id: "REQ-2026-002",
    title: "syllabus printing & learning materials",
    amount: 320.00,
    date: "jun 08, 2026",
    category: "workshop & classroom supplies",
    stage: "disbursed",
    status: "approved"
  },
  {
    id: "REQ-2026-003",
    title: "fiber internet monthly subscription - harare hq",
    amount: 250.00,
    date: "jun 01, 2026",
    category: "internet, data & utilities",
    stage: "completed",
    status: "approved"
  },
  {
    id: "REQ-2026-004",
    title: "marketing banners for tech recruitment drive",
    amount: 180.00,
    date: "may 28, 2026",
    category: "marketing & community outreach",
    stage: "hub manager review",
    status: "rejected"
  }
];

export default function RequesterDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [requisitions, setRequisitions] = useState(INITIAL_REQUISITIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Metric Calculation Aggregations
  const totalRequested = requisitions.reduce((acc, curr) => acc + (curr.status !== 'rejected' ? curr.amount : 0), 0);
  const pendingCount = requisitions.filter(r => r.status === 'pending').length;
  const approvedCount = requisitions.filter(r => r.status === 'approved').length;

  // Search & Filter Processing
  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && req.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
      
      {/* Universal Workspace Navigation Header */}
      <nav className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Assembly */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-bold tracking-tight text-[#1D4ED8]">
              uncommon
            </span>
            <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-badge tracking-wider uppercase">
              rms
            </span>
          </div>

          {/* User Meta & Session Control Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 text-right">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#0A1628]">Chacha</span>
                <span className="text-xs text-[#4B5563] lowercase">harare hub • requester</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-[#E5E7EB] hidden sm:block" />

            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#991B1B] transition-colors group focus:outline-none"
            >
              <LogOut className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#991B1B] transition-colors" />
              <span className="hidden sm:inline lowercase">sign out</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Workspace Greeting & Top Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">
              requisitions overview
            </h1>
            <p className="text-sm text-[#4B5563] mt-1">
              track, audit, and submit fund requests for your innovation hub projects
            </p>
          </div>

          <button
            onClick={() => router.push('/requester/requisitions/new')}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-sm rounded-md shadow-sm transition-colors cursor-pointer select-none lowercase self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>new requisition</span>
          </button>
        </div>

        {/* Analytical Aggregation Cards Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          
          {/* Card 1: Cumulative Financial Outflow Allocation */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 flex flex-col justify-between shadow-sm">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              active allocation
            </span>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-3xl font-bold text-[#0A1628]">${totalRequested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <span className="text-xs text-[#9CA3AF] mt-2 normal-case">excluding rejected items</span>
          </div>

          {/* Card 2: Queued Verification Pipeline Volume */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                pending approvals
              </span>
              <Clock className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-3xl font-bold text-[#0A1628]">{pendingCount}</span>
              <span className="text-sm font-medium text-[#4B5563] lowercase ml-1">items queued</span>
            </div>
            <span className="text-xs text-[#9CA3AF] mt-2 normal-case">awaiting signature matrices</span>
          </div>

          {/* Card 3: Disbursed & Completed Approvals */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                approved payloads
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-3xl font-bold text-[#0A1628]">{approvedCount}</span>
              <span className="text-sm font-medium text-[#4B5563] lowercase ml-1">completed</span>
            </div>
            <span className="text-xs text-[#9CA3AF] mt-2 normal-case">passed to cash desk systems</span>
          </div>

        </div>

        {/* Control Filters & Tab Filtering Assembly */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
          
          {/* Filtering Control Bar Container */}
          <div className="p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white">
            
            {/* Filter Status Selector Tabs */}
            <div className="flex border border-[#E5E7EB] rounded-md p-1 bg-[#F9FAFB] self-start">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors lowercase whitespace-nowrap focus:outline-none ${
                    activeTab === tab
                      ? 'bg-white text-[#1D4ED8] shadow-sm font-semibold'
                      : 'text-[#4B5563] hover:text-[#0A1628]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Interactive Query Input Field */}
            <div className="relative flex items-center max-w-md w-full">
              <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search by id or title description..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all font-sans"
              />
            </div>

          </div>

          {/* Ledger Structural Table Data Representation */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="px-6 py-4">requisition id</th>
                  <th className="px-6 py-4">description details</th>
                  <th className="px-6 py-4">date filed</th>
                  <th className="px-6 py-4">allocation</th>
                  <th className="px-6 py-4">pipeline routing</th>
                  <th className="px-6 py-4 text-right">actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#111827]">
                {filteredRequisitions.length > 0 ? (
                  filteredRequisitions.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => router.push(`/requester/requisitions/${req.id}`)}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                    >
                      
                      {/* Token Reference ID Column */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-[#1D4ED8]">
                        {req.id}
                      </td>
                      
                      {/* Contextual Description Details */}
                      <td className="px-6 py-4 max-w-xs sm:max-w-md">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#0A1628] group-hover:text-[#1D4ED8] transition-colors truncate">
                            {req.title}
                          </span>
                          <span className="text-xs text-[#9CA3AF] lowercase mt-0.5">
                            {req.category}
                          </span>
                        </div>
                      </td>
                      
                      {/* Historical Metric Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#4B5563]">
                        {req.date}
                      </td>
                      
                      {/* Financial Value Value Cell */}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0A1628]">
                        ${req.amount.toFixed(2)}
                      </td>
                      
                      {/* Operational Status Verification Tag Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            req.status === 'approved' ? 'bg-[#059669]' :
                            req.status === 'pending' ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                          }`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-[#0A1628] lowercase">
                              {req.stage}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Explicit Interactive Audit Triggers */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex items-center gap-1 text-[#1D4ED8] group-hover:underline font-semibold select-none">
                          <span>audit</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  /* Empty Fallback Visual Template State Frame */
                  <tr>
                    <td colSpan="6" className="text-center py-12 bg-white text-sm text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-[#9CA3AF] stroke-[1.5]" />
                        <span className="lowercase">no records found matching specified parameters</span>
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