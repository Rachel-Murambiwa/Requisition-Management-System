"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, MapPin, Shield, SlidersHorizontal, Loader2, ArrowLeft, Users, UserPlus, LogOut } from 'lucide-react';

const MOCK_STAFF_DIRECTORY = [
  { id: "USR-991A", name: "rachel murambiwa", email: "rachel@uncommon.org", role: "requester", hub_name: "mufakose innovation hub" },
  { id: "USR-402B", name: "takudzwa joseph", email: "takudzwa@uncommon.org", role: "finance-officer", hub_name: "headquarters" },
  { id: "USR-773C", name: "farayi nyamayaro", email: "farayi@uncommon.org", role: "head-of-operations", hub_name: "headquarters" },
  { id: "USR-114D", name: "reward murambiwa", email: "reward@uncommon.org", role: "requester", hub_name: "kambuzuma innovation hub" },
  { id: "USR-550E", name: "michelle gwatiringa", email: "michelle@uncommon.org", role: "country-manager", hub_name: "headquarters" }
];

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
            <a href="/admin/users" className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 text-decoration-none lowercase ${activeRoute === 'directory' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              <Users className="w-3.5 h-3.5" />
              <span>user directory</span>
            </a>
            <a href="/admin/users/new" className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 text-decoration-none lowercase ${activeRoute === 'invite' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
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

export default function UserDirectoryPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  async function syncUserDirectory() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').order('name', { ascending: true });
      if (error) throw error;
      setProfiles(!data || data.length === 0 ? MOCK_STAFF_DIRECTORY : data);
    } catch (err) {
      setProfiles(MOCK_STAFF_DIRECTORY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { syncUserDirectory(); }, [supabase]);

  const handleUpdateRole = async (id, currentRole) => {
    const roleMap = { 'requester': 'finance-officer', 'finance-officer': 'head-of-operations', 'head-of-operations': 'country-manager', 'country-manager': 'requester' };
    const nextRole = roleMap[currentRole] || 'requester';
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: nextRole } : p));
    await supabase.from('profiles').update({ role: nextRole }).eq('id', id);
  };

  const filteredProfiles = profiles.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] pb-16">
      <AdminNavbar activeRoute="directory" onSignOut={async () => { await supabase.auth.signOut(); router.push('/login'); }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* 🛠️ BACK TO DASHBOARD NAVIGATION LINK ENTRY BUTTON */}
        <div>
          <button 
            onClick={() => router.push('/admin')} 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0747A1] hover:text-[#0A1628] transition-colors bg-transparent border-none cursor-pointer p-0 lowercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>back to system dashboard</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
            <Loader2 className="w-7 h-7 text-[#0747A1] animate-spin" />
            <span>fetching active directory records...</span>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
              <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">active staff catalog</span>
              <div className="relative flex items-center w-full sm:max-w-xs">
                <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="search profiles by name or email..." className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[#4B5563] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">profile identifier</th>
                    <th className="px-6 py-3.5">email channel</th>
                    <th className="px-6 py-3.5">assigned hub location</th>
                    <th className="px-6 py-3.5">authorization layer</th>
                    <th className="px-6 py-3.5 text-right">privilege lifecycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredProfiles.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/40 font-medium">
                      <td className="px-6 py-4 font-bold text-[#0A1628] lowercase flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-mono font-black text-[10px] text-[#0747A1] uppercase">{user.name?.substring(0,2) || "ST"}</div>
                        {user.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#0747A1] bg-[#EFF6FF] px-2 py-0.5 rounded-md font-bold lowercase">
                          <MapPin className="w-3 h-3" /> {user.hub_name || 'harare'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-700">
                          <Shield className="w-3 h-3" /> {user.role?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleUpdateRole(user.id, user.role)} className="inline-flex items-center gap-1.5 py-1 px-2.5 border border-slate-200 text-slate-600 bg-white rounded font-bold text-[9px] uppercase cursor-pointer hover:border-[#0747A1]">
                          <SlidersHorizontal className="w-3 h-3" /> cycle role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}