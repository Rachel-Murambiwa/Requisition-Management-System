"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  ArrowLeft, 
  UserPlus, 
  Trash2, 
  Building2, 
  Users, 
  MapPin, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function AdminUserAndHubManagement() {
  const router = useRouter();
  
  // Stabilize the client instance reference to prevent loop triggers
  const [supabase] = useState(() => createClient());

  const [activeTab, setActiveTab] = useState("users");
  
  // Real Database Connected Tracking States
  const [users, setUsers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Core Form Binding Parameters
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("requester");
  const [newUserHub, setNewUserHub] = useState("harare");

  const [newHubName, setNewHubName] = useState("");
  const [newHubCode, setNewHubCode] = useState("");

  const [formFeedback, setFormFeedback] = useState({ error: "", success: "", loading: false });

  // Lifecycle Hook: Strictly fetches data components once on load
  useEffect(() => {
    async function loadCoreRegistries() {
      try {
        setIsLoadingData(true);
        
        const [profilesRes, hubsRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('hubs').select('*').order('name')
        ]);

        if (profilesRes.data) setUsers(profilesRes.data);
        if (hubsRes.data) setHubs(hubsRes.data);
      } catch (err) {
        console.error("Infrastructure registry hydration failure:", err.message);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadCoreRegistries();
  }, []); 

  // Action Handler: Dispatch invitation payload upstream to dynamic API
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setFormFeedback({ error: "", success: "", loading: true });

    try {
      const response = await fetch('/api/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          role: newUserRole,
          hub_name: newUserHub
        })
      });

      const outcome = await response.json();

      if (!outcome.success) throw new Error(outcome.error || 'Pipeline execution failure.');

      setFormFeedback({ error: "", success: `Onboarding link successfully dispatched to ${newUserEmail}`, loading: false });
      setNewUserName("");
      setNewUserEmail("");

      // Refresh data cleanly without page resets
      const { data: updatedProfiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (updatedProfiles) setUsers(updatedProfiles);

    } catch (err) {
      setFormFeedback({ error: err.message, success: "", loading: false });
    }
  };

  const handleRemoveUser = async (id, name) => {
    if (!confirm(`Revoke credentials and permanently delete access for ${name}?`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(`Access revocation failed: ${err.message}`);
    }
  };

  const handleAddHub = async (e) => {
    e.preventDefault();
    if (!newHubName.trim() || !newHubCode.trim()) return;

    try {
      const cleanNameToken = newHubName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      const { data, error } = await supabase
        .from('hubs')
        .insert([{ 
          name: cleanNameToken, 
          code: newHubCode.toUpperCase().trim(),
          country: "zimbabwe" 
        }])
        .select();

      if (error) throw error;
      if (data) setHubs([...hubs, data[0]]);
      
      setNewHubName("");
      setNewHubCode("");
    } catch (err) {
      alert(`Failed committing territorial node: ${err.message}`);
    }
  };

  const handleRemoveHub = async (id, name) => {
    if (!confirm(`Decommission ${name} database entry?`)) return;

    try {
      const { error } = await supabase.from('hubs').delete().eq('id', id);
      if (error) throw error;
      setHubs(hubs.filter(h => h.id !== id));
    } catch (err) {
      alert(`Decommission operation faulted: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans antialiased pb-16">
      
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="lowercase">back to config panel</span>
          </div>
          <NotificationCenter role="finance-officer" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1628] tracking-tight lowercase">infrastructure registries</h1>
            <p className="text-sm text-[#4B5563] mt-1">live directory tables to scale staff credential profiles or allocate innovation nodes</p>
          </div>

          <div className="flex bg-gray-200 p-1 rounded-md border border-gray-300 self-start sm:self-auto">
            <button 
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-all focus:outline-none lowercase ${
                activeTab === 'users' ? 'bg-[#0A1628] text-white shadow-sm' : 'text-gray-600 hover:text-[#0A1628]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>personnel ({users.length})</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('hubs')}
              className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-all focus:outline-none lowercase ${
                activeTab === 'hubs' ? 'bg-[#0A1628] text-white shadow-sm' : 'text-gray-600 hover:text-[#0A1628]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>innovation hubs ({hubs.length})</span>
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 font-medium text-xs lowercase">
            <Loader2 className="w-8 h-8 text-[#0747A1] animate-spin" />
            <span>hydrating active registry network slots...</span>
          </div>
        ) : activeTab === 'users' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6 space-y-4">
              <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                <UserPlus className="w-4 h-4 text-[#0747A1]" />
                <span>provision new account access</span>
              </div>

              {formFeedback.error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-medium rounded text-[11px] lowercase">{formFeedback.error}</div>}
              {formFeedback.success && <div className="p-2.5 bg-blue-50 border border-blue-100 text-[#0747A1] font-medium rounded text-[11px] lowercase">{formFeedback.success}</div>}

              <form onSubmit={handleAddUser} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase tracking-wide text-[10px]">full user name</label>
                  <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. john doe" className="w-full p-2 border border-gray-300 rounded font-medium focus:outline-none focus:border-[#0747A1]" required disabled={formFeedback.loading} />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase tracking-wide text-[10px]">email destination</label>
                  <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="username@uncommon.org" className="w-full p-2 border border-gray-300 rounded font-mono focus:outline-none focus:border-[#0747A1]" required disabled={formFeedback.loading} />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase tracking-wide text-[10px]">assigned base hub</label>
                  <select value={newUserHub} onChange={(e) => setNewUserHub(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 cursor-pointer font-bold lowercase" disabled={formFeedback.loading}>
                    <option value="harare">headquarters</option>
                    <option value="h1">mbare innovation hub</option>
                    <option value="h2">warren-park innovation hub</option>
                    <option value="h3">kambuzuma innovation hub</option>
                    <option value="h4">mufakose innovation hub</option>
                    <option value="h5">kuwadzana innovation hub</option>
                    <option value="h6">dzivarasekwa innovation hub</option>
                    <option value="h7">renate-dommasch innovation hub</option>
                    <option value="bulawayo">nedbank innovation hub</option>
                    <option value="b1">sally-soundation innovation hub</option>
                    <option value="vic falls">vincent-bohlen innovation hub</option>
                    <option value="gwayi">painted dog innovation hub</option>
                    <option value="gokwe">nyamuroro innovation hub</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase tracking-wide text-[10px]">permission level</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 cursor-pointer font-bold lowercase" disabled={formFeedback.loading}>
                    <option value="requester">requester</option>
                    <option value="finance-officer">central finance officer</option>
                    <option value="head-of-operations">head of operations</option>
                    <option value="country-manager">country manager</option>
                  </select>
                </div>
                <button type="submit" disabled={formFeedback.loading} className="w-full bg-[#0747A1] hover:opacity-95 text-white py-2.5 font-bold uppercase tracking-wider rounded shadow-sm cursor-pointer select-none transition-all flex items-center justify-center gap-2 border-none">
                  {formFeedback.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'authorize access account'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[#4B5563] font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">identity profile</th>
                      <th className="px-5 py-3.5">allocated hub</th>
                      <th className="px-5 py-3.5">designated role</th>
                      <th className="px-5 py-3.5 text-right">actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 font-sans">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0A1628] lowercase">{u.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 lowercase font-bold text-[#0747A1]">{u.hub_name || 'unassigned'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'requester' ? 'bg-gray-100 text-gray-700' :
                            u.role === 'finance_officer' || u.role === 'finance-officer' ? 'bg-blue-50 text-[#0747A1]' :
                            u.role === 'head_of_operations' || u.role === 'head-of-operations' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            <ShieldCheck className="w-3 h-3" /> {u.role.replace('_', ' ').replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => handleRemoveUser(u.id, u.name)} className="p-1.5 border border-red-100 text-[#991B1B] hover:bg-red-50 rounded focus:outline-none bg-transparent cursor-pointer transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6 space-y-4">
              <div className="text-xs font-bold text-[#0A1628] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                <MapPin className="w-4 h-4 text-[#0747A1]" />
                <span>register new innovation hub</span>
              </div>

              <form onSubmit={handleAddHub} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase tracking-wide text-[10px]">hub name</label>
                  <input type="text" value={newHubName} onChange={(e) => setNewHubName(e.target.value)} placeholder="e.g. gweru" className="w-full p-2 border border-gray-300 rounded font-medium focus:outline-none focus:border-[#0747A1]" required />
                </div>
                <button type="submit" className="w-full bg-[#0747A1] hover:opacity-95 text-white py-2 font-bold uppercase tracking-wider rounded shadow-sm cursor-pointer select-none border-none">
                  append new hub to registry
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[#4B5563] font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">hub name</th>
                      <th className="px-5 py-3.5">operational country</th>
                      <th className="px-5 py-3.5 text-right">actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 font-sans">
                    {hubs.map((h) => (
                      <tr key={h.id || h.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-[#0A1628] lowercase tracking-wide flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          {h.name}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold tracking-widest text-gray-600 uppercase bg-gray-50/40 px-2 rounded inline-block mt-3 ml-4">{h.code}</td>
                        <td className="px-5 py-4 text-gray-400 lowercase">{h.country}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => handleRemoveHub(h.id || h.name, h.name)} className="p-1.5 border border-red-100 text-[#991B1B] hover:bg-red-50 rounded focus:outline-none bg-transparent cursor-pointer transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}