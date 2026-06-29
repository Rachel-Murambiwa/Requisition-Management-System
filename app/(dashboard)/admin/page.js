"use client";

import { useState } from 'react';
import { 
  UserPlus, 
  Mail, 
  User, 
  Shield, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function AdminInviteStaffPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('requester');
  const [hubName, setHubName] = useState('harare');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const rolesList = [
    { value: 'requester', label: 'requester' },
    { value: 'finance-officer', label: 'finance officer' },
    { value: 'country-manager', label: 'country manager' },
    { value: 'head-of-operations', label: 'head of operations' }
  ];

  const hubsList = [
    { value: 'harare', label: 'headquarters' },
    { value: 'h1', label:'mbare innovation hub' },
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
    {value: 'gokwe', label: 'nyamuroro innovation hub' }
  ];

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !name) {
      setError('all foundation profile information details are required.');
      return;
    }

    setIsLoading(true);

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
    } catch (err) {
      setError(err.message || 'network connection fault during encryption bridge transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 sm:p-10 flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-10 space-y-6">
        
        {/* Header Block Description */}
        <div className="flex flex-col border-b border-gray-100 pb-4">
          <div className="w-10 h-10 bg-[#EFF6FF] text-[#0747A1] rounded-lg flex items-center justify-center mb-3">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-[#0A1628] tracking-tight lowercase">provision new staff workspace</h1>
          <p className="text-xs text-[#4B5563] font-medium mt-1 leading-relaxed">
            issue an authoritative secure authentication link to provision an employee profile inside the repository schema database
          </p>
        </div>

        {/* State Notification Flags */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-l-4 border-l-[#991B1B] border-red-200 rounded-r-lg text-xs font-semibold text-[#991B1B] flex items-center gap-2 lowercase">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-green-50 border border-l-4 border-l-[#16A34A] border-green-200 rounded-r-lg text-xs font-semibold text-[#166534] flex items-center gap-2 lowercase">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Console Invitation Input Grid Form */}
        <form onSubmit={handleSendInvite} className="space-y-5 text-xs font-bold text-gray-500">
          
          {/* Full Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="uppercase tracking-wider text-[10px] text-gray-400">employee full name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Murambiwa"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          {/* Email Channel Address field */}
          <div className="flex flex-col gap-1.5">
            <label className="uppercase tracking-wider text-[10px] text-gray-400">email directory channel</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@uncommon.org"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          {/* Select Dynamic Dropdowns Rows Grid layout splitting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Security Matrix Role Option Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="uppercase tracking-wider text-[10px] text-gray-400">system permission role</label>
              <div className="relative flex items-center">
                <Shield className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0747A1] focus:bg-white transition-all appearance-none cursor-pointer lowercase"
                >
                  {rolesList.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
              </div>
            </div>

            {/* Target Deployment Hub Region Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="uppercase tracking-wider text-[10px] text-gray-400">operational hub location</label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  disabled={isLoading}
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

          {/* Execution dispatch submission button trigger layout component row */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-[#0747A1] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:opacity-95 border-none cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
            >
              {isLoading ? (
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
    </div>
  );
}