"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, User, Mail, Shield, MapPin, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Users, LogOut } from 'lucide-react';

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

export default function InviteStaffPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('requester');
  const [hubName, setHubName] = useState('harare');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🛠️ ALL 13 REGIONAL HUBS LINKED IN
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

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMessage('');
    if (!email || !name) return setError('all foundation details are required.');
    setIsLoadingAction(true);

    try {
      const response = await fetch('/api/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), role, hub_name: hubName })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'failed dispatching security link.');

      setSuccessMessage(`secure invitation dispatched successfully to ${email.toLowerCase()}!`);
      setEmail(''); setName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] pb-16">
      <AdminNavbar activeRoute="invite" onSignOut={async () => { await supabase.auth.signOut(); router.push('/login'); }} />
      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        
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

        {error && <div className="p-3.5 bg-red-50 border-l-4 border-l-[#991B1B] text-xs font-semibold text-[#991B1B] flex items-center gap-2 rounded-r-lg"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        {successMessage && <div className="p-3.5 bg-green-50 border-l-4 border-l-[#16A34A] text-xs font-semibold text-[#166534] flex items-center gap-2 rounded-r-lg"><CheckCircle2 className="w-4 h-4 shrink-0" />{successMessage}</div>}

        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex flex-col border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-[#EFF6FF] text-[#0747A1] rounded-lg flex items-center justify-center mb-3"><UserPlus className="w-5 h-5" /></div>
            <h1 className="text-2xl font-black text-[#0A1628] tracking-tight lowercase">provision new staff workspace</h1>
            <p className="text-xs text-[#4B5563] font-medium mt-1">issue an authoritative link to provision an employee profile inside the schema database</p>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-5 text-xs font-bold text-gray-500">
            <div className="flex flex-col gap-1.5">
              <label className="uppercase tracking-wider text-[10px] text-gray-400">employee full name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rachel Murambiwa" className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:bg-white" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="uppercase tracking-wider text-[10px] text-gray-400">email directory channel</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="username@uncommon.org" className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider text-[10px] text-gray-400">system permission role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full py-2.5 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-bold text-gray-700 focus:outline-none text-xs lowercase cursor-pointer">
                  <option value="requester">requester</option>
                  <option value="finance-officer">finance officer</option>
                  <option value="head-of-operations">head of operations</option>
                  <option value="country-manager">country manager</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-wider text-[10px] text-gray-400">operational hub location</label>
                <select value={hubName} onChange={(e) => setHubName(e.target.value)} className="w-full py-2.5 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-bold text-gray-700 focus:outline-none text-xs lowercase cursor-pointer">
                  {hubsList.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button type="submit" disabled={isLoadingAction || !email || !name} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-[#0747A1] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>dispatch staff invitation</span>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}