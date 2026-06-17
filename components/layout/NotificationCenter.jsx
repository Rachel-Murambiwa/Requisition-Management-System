"use client";

import { useState } from 'react';
import { Bell, Check, Circle, MessageSquare, Landmark, Sparkles } from 'lucide-react';

const MOCK_NOTIFICATIONS_BY_ROLE = {
  requester: [
    { id: 1, type: "stage_6", title: "Funds Ready for Pickup", msg: "FO has received disbursed cash from Treasury. Collect transport allowance.", time: "just now", read: false },
    { id: 2, type: "clarification", title: "Clarification Needed", msg: "FO flagged your attachment for missing VAT validation cert.", time: "2h ago", read: true }
  ],
  "finance-officer": [
    { id: 1, type: "stage_1", title: "New Request Logged", msg: "Rachel Murambiwa logged a new travel allocation file for Bulawayo Hub.", time: "1m ago", read: false },
    { id: 2, type: "stage_3", title: "HoP Approval Signed", msg: "Head of Operations authorized 4 items for Harare site visits.", time: "30m ago", read: false },
    { id: 3, type: "stage_5", title: "CM Disbursement Released", msg: "Country Manager pushed Cash Manifest #1106 to corporate wallets.", time: "1h ago", read: true }
  ],
  "head-of-operations": [
    { id: 1, type: "stage_2", title: "Audited Queue Incoming", msg: "FO forwarded 3 compliance-verified site visit files for review.", time: "5m ago", read: false }
  ],
  "country-manager": [
    { id: 1, type: "stage_4", title: "Master Invoice Compiled", msg: "FO submitted a consolidated June manifest totaling $8,595.00.", time: "12m ago", read: false }
  ]
};

export default function NotificationCenter({ role = "finance-officer" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState(MOCK_NOTIFICATIONS_BY_ROLE[role] || []);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  return (
    <div className="relative font-sans text-xs">
      {/* The Active Action Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-[#1D4ED8] bg-gray-50 hover:bg-blue-50 rounded-full transition-all focus:outline-none select-none border border-gray-200"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#991B1B] text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Interactive Dropdown Flyout Card Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 text-left overflow-hidden">
          
          <div className="p-3 bg-gray-50 border-b border-[#E5E7EB] flex items-center justify-between">
            <span className="font-bold text-[#0A1628] uppercase tracking-wider text-[10px]">notification center feed</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 transition-colors flex gap-3 items-start ${alert.read ? 'bg-white' : 'bg-blue-50/50'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.type === 'stage_6' && <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />}
                    {alert.type === 'clarification' && <MessageSquare className="w-3.5 h-3.5 text-[#991B1B]" />}
                    {alert.type === 'stage_1' && <Circle className="w-3.5 h-3.5 fill-[#1D4ED8] text-[#1D4ED8]" />}
                    {alert.type === 'stage_3' && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                    {alert.type === 'stage_5' && <Landmark className="w-3.5 h-3.5 text-[#0A4EA3]" />}
                    {alert.type === 'stage_4' && <FileText className="w-3.5 h-3.5 text-[#D97706]" />}
                    {alert.type === 'stage_2' && <Activity className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-bold text-[#0A1628] lowercase flex items-center gap-2">
                      {alert.title}
                      {!alert.read && <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full shrink-0" />}
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed lowercase">{alert.msg}</p>
                    <span className="text-[9px] text-[#9CA3AF] font-mono block pt-1">{alert.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 text-center text-gray-400 italic lowercase flex flex-col items-center gap-2">
                <Bell className="w-5 h-5 text-gray-300 stroke-[1.5]" />
                <span>your notification stream is clean</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}