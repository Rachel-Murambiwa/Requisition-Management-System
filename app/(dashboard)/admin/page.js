"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { 
  UserPlus, 
  Mail, 
  User, 
  Shield, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Building2,
  LogOut,
  SlidersHorizontal,
  Search,
  Lock
} from 'lucide-react';

const MOCK_STAFF_DIRECTORY = [
  { id: "USR-991A", name: "rachel murambiwa", email: "rachel@uncommon.org", role: "requester", hub_name: "nufakose innovation hub" },
  { id: "USR-402B", name: "takudzwa joseph", email: "takudzwa@uncommon.org", role: "finance-officer", hub_name: "headquarters" },
  { id: "USR-773C", name: "farayi nyamayaro", email: "farayi@uncommon.org", role: "head-of-operations", hub_name: "headquarters" },
  { id: "USR-114D", name: "reward murambiwa", email: "reward@uncommon.org", role: "requester", hub_name: "kambuzuma innovation hub" },
  { id: "USR-550E", name: "michelle gwatiringa", email: "michelle@uncommon.org", role: "country-manager", hub_name: "headquarters" }
];

export default function AdminControlCenter() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // 🎛️ Navigation and Data States
  const [activeView, setActiveView] = useState('directory'); // 'directory' or 'invite'
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✉️ Invitation Form States (Matches image_be6f19.png parameters)
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('requester');
  const [hubName, setHubName] = useState('harare');

  // ⚠️ Status Log Elements
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const rolesList = [
    { value: 'requester', label: 'requester' },
    { value: 'finance-officer', label: 'finance officer' },
    { value: 'head-of-operations', label: 'head of operations' },
    { value: 'country-manager', label: 'country manager' }
  ];

  const hubsList = [
    { value: 'harare', label: 'headquarters' },
    { value: 'h1', label: 'mbare innovation hub' },
    { value: 'h2', label: 'warren park hub' },
    { value: 'h3', label: 'kambuzuma innovation hub' },
    { value: 'h4', label: 'mufakose innovation hub' },
    { value: 'h5', label: 'kuwadzana innovation hub' },
    { value: 'h6', label: 'dzivarasekwa innovation hub' },
    { value: 'h7', label: 'renate-dommasch innovation hub' },
    { value: 'bulawayo', label: 'nedbank innovation hub' },
    { value: 'b2', label: 'sally-foundation innovation hub' },
    { value: 'vic falls', label: 'vincent-bohlen hub' },
    { value: 'gwayi', label: 'painted dog innovation hub' },
    { value: 'gokwe', label: 'nyamuroro innovation hub' }
  ];

  // 📥 FETCH REGISTERED USER PROFILES
  async function syncUserDirectory() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      if (!data || data.length === 0) {
        setProfiles(MOCK_STAFF_DIRECTORY);
      } else {
        setProfiles(data);
      }
    } catch (err) {
      console.error("Directory synchronization failure:", err.message);
      setProfiles(MOCK_STAFF_DIRECTORY); // Graceful sandbox fallback
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncUserDirectory();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // ✉️ TRANSMIT INVITATION HANDSHAKE
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !name) {
      setError('all foundation profile information details are required.');
      return;
    }

    setIsLoadingAction(true);

    try {
      const response = await fetch('/api/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          role: role,
          hub_name: hubName
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'failed dispatching security invitation thread.');
      }

      setSuccessMessage(`secure invitation dispatched successfully to ${email.toLowerCase()}!`);
      setEmail('');
      setName('');
      setRole('requester');
      setHubName('harare');
      
      // Auto reload directory stack to log pending placeholders
      syncUserDirectory();
    } catch (err) {
      setError(err.message || 'network connection fault during encryption bridge transaction.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  // ⚙️ UPDATE USER PERMISSION ROLE INLINE
  const handleUpdateRole = async (id, currentRole) => {
    const roleMap = {
      'requester': 'finance-officer',
      'finance-officer': 'head-of-operations',
      'head-of-operations': 'country-manager',
      'country-manager': 'requester'
    };
    const nextRole = roleMap[currentRole] || 'requester';

    try {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: nextRole } : p));
      
      await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', id);
    } catch (err) {
      console.error("Privilege alteration fault:", err.message);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hub_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-16">
      
      {/* Universal Admin Top Navigation Header */}
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#991B1B] text-white font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">root admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#1A2E4A] p-1 rounded-md border border-slate-700">
              <button 
                onClick={() => { setActiveView('directory'); setError(''); setSuccessMessage(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all focus:outline-none lowercase cursor-pointer border-none ${
                  activeView === 'directory' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white bg-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>user directory</span>
              </button>
              <button 
                onClick={() => { setActiveView('invite'); setError(''); setSuccessMessage(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all focus:outline-none lowercase cursor-pointer border-none ${
                  activeView === 'invite' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white bg-transparent'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>invite engine</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700" />
            <NotificationCenter role="admin" />
            <div className="h-6 w-px bg-slate-700" />
            
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors focus:outline-none bg-transparent border-none cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Body Grid Dashboard View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">identity directory dashboard</h1>
          <p className="text-sm text-[#4B5563] mt-1">provision corporate accounts, adjust database security tokens, and monitor workspace distribution maps</p>
        </div>

        {/* Dynamic Aggregation Telemetry Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">enrolled identities</span>
            <div className="text-3xl font-black text-[#0A1628] mt-2 font-mono">{profiles.length} <span className="text-xs font-medium text-gray-400">active profiles</span></div>
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

        {/* Global Error/Success Banner Portals */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-l-4 border-l-[#991B1B] border-red-200 rounded-r-lg text-xs font-semibold text-[#991B1B] flex items-center gap-2 lowercase max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-green-50 border border-l-4 border-l-[#16A34A] border-green-200 rounded-r-lg text-xs font-semibold text-[#166534] flex items-center gap-2 lowercase max-w-xl mx-auto">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* CONDITIONAL SUBVIEW SWITCH */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 text-xs lowercase">
            <Loader2 className="w-7 h-7 text-[#0747A1] animate-spin" />
            <span>fetching active directory records...</span>
          </div>
        ) : activeView === 'directory' ? (
          
          /* VIEW PANEL A: USER MANAGEMENT TABLE LAYER */
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
              <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">active staff catalog</span>
              <div className="relative flex items-center w-full sm:max-w-xs">
                <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search profiles by node or email..." 
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-md text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0747A1]" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[#4B5563] font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-3.5">profile identifier</th>
                    <th className="px-6 py-3.5">email channel</th>
                    <th className="px-6 py-3.5">assigned hub location</th>
                    <th className="px-6 py-3.5">authorization layer</th>
                    <th className="px-6 py-3.5 text-right">privilege lifecycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[#111827] font-medium">
                  {filteredProfiles.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0A1628] lowercase flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-mono font-black text-[10px] text-[#0747A1] uppercase">
                          {user.name ? user.name.substring(0,2) : "ST"}
                        </div>
                        {user.name || 'unassigned name'}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-500 lowercase">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#0747A1] bg-[#EFF6FF] px-2 py-0.5 rounded-md font-bold lowercase">
                          <MapPin className="w-3 h-3 text-[#0747A1]" /> {user.hub_name || user.location || 'harare'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          user.role === 'country-manager' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          user.role === 'head-of-operations' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          user.role === 'finance-officer' ? 'bg-green-50 text-green-700 border-green-100' :
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          <Shield className="w-3 h-3" /> {user.role?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleUpdateRole(user.id, user.role)}
                          className="inline-flex items-center gap-1.5 py-1 px-2.5 border border-slate-200 hover:border-[#0747A1] text-slate-600 hover:text-[#0747A1] bg-white rounded transition-colors cursor-pointer font-bold uppercase tracking-wider text-[9px] focus:outline-none"
                        >
                          <SlidersHorizontal className="w-3 h-3" /> cycle role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (
          
          /* VIEW PANEL B: AUTHORITATIVE STAFF INVITATION CONSOLE */
          /* Exact Match with layout parameters visible inside image_be6f19.png */
          <div className="w-full max-w-xl mx-auto bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-10 space-y-6 animate-fadeIn">
            
            <div className="flex flex-col border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-[#EFF6FF] text-[#0747A1] rounded-lg flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-[#0A1628] tracking-tight lowercase">provision new staff workspace</h1>
              <p className="text-xs text-[#4B5563] font-medium mt-1 leading-relaxed">
                issue an authoritative secure authentication link to provision an employee profile inside the repository schema database
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-5 text-xs font-bold text-gray-500">
              
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider text-[10px] text-gray-400">employee full name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Murambiwa"
                    disabled={isLoadingAction}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider text-[10px] text-gray-400">email directory channel</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@uncommon.org"
                    disabled={isLoadingAction}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider text-[10px] text-gray-400">system permission role</label>
                  <div className="relative flex items-center">
                    <Shield className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoadingAction}
                      className="w-full pl-10 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all appearance-none cursor-pointer lowercase"
                    >
                      {rolesList.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider text-[10px] text-gray-400">operational hub location</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={hubName}
                      onChange={(e) => setHubName(e.target.value)}
                      disabled={isLoadingAction}
                      className="w-full pl-10 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all appearance-none cursor-pointer lowercase"
                    >
                      {hubsList.map((h) => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isLoadingAction || !email || !name}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-[#0747A1] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:opacity-95 border-none cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
                >
                  {isLoadingAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>dispatching parameters...</span>
                    </>
                  ) : (
                    <span>dispatch staff invitation</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
}