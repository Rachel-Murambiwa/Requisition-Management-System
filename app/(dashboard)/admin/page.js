"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, LogOut, ShieldAlert } from 'lucide-react'; 

// 🛠️ Local Nav Component Definition
function AdminNavbar({ activeRoute, onSignOut }) {
  return (
    <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <span className="text-xl font-bold tracking-tight">uncommon</span>
          <span className="text-[10px] bg-[#991B1B] text-white font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">root admin</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#1A2E4A] p-1 rounded-md border border-slate-700">
            <a href="/admin/users" className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all text-decoration-none lowercase ${activeRoute === 'directory' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              <Users className="w-3.5 h-3.5" />
              <span>user directory</span>
            </a>
            <a href="/admin/users/new" className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all text-decoration-none lowercase ${activeRoute === 'invite' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              <UserPlus className="w-3.5 h-3.5" />
              <span>invite engine</span>
            </a>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <button onClick={onSignOut} className="text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function AdminControlCenter() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [profileCount, setProfileCount] = useState(0);

  useEffect(() => {
    async function getCount() {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setProfileCount(count || 5);
    }
    getCount();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-16">
      <AdminNavbar activeRoute="dashboard" onSignOut={handleSignOut} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">identity directory dashboard</h1>
          <p className="text-sm text-[#4B5563] mt-1">provision corporate accounts, adjust database security tokens, and monitor workspace distribution maps</p>
        </div>

        {/* Telemetry Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-sm cursor-pointer hover:border-[#0747A1] transition-all" onClick={() => router.push('/admin/users')}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">enrolled identities</span>
            <div className="text-3xl font-black text-[#0A1628] mt-2 font-mono">{profileCount} <span className="text-xs font-medium text-gray-400">active profiles ➔</span></div>
          </div>
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">permission structures</span>
            <div className="text-3xl font-black text-[#0747A1] mt-2 font-mono">4 <span className="text-xs font-medium text-gray-400">isolated layers</span></div>
          </div>
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">connected network nodes</span>
            <div className="text-3xl font-black text-[#16A34A] mt-2 font-mono">13 <span className="text-xs font-medium text-gray-400">regional hubs</span></div>
          </div>
        </div>

        {/* 🛠️ ADDED: ADMINISTRATIVE QUICK ACTIONS PLATFORM BLOCK */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 space-y-4">
          <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider block">administrative quick engine controls</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/admin/users/new')}
              className="flex items-center justify-center gap-2 p-4 border border-[#E5E7EB] hover:border-[#0747A1] hover:bg-[#EFF6FF]/30 text-[#0747A1] text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer bg-transparent"
            >
              <UserPlus className="w-4 h-4" />
              <span>open invite engine terminal</span>
            </button>

            <button 
              onClick={() => router.push('/admin/users')}
              className="flex items-center justify-center gap-2 p-4 border border-[#E5E7EB] hover:border-[#0A1628] hover:bg-gray-50 text-[#4B5563] hover:text-[#0A1628] text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer bg-transparent"
            >
              <Users className="w-4 h-4" />
              <span>browse staff directory database</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}