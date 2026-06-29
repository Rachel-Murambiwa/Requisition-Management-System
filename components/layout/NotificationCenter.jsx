"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // 🚀 Imported your live Supabase client
import { 
  Bell, 
  Check, 
  Circle, 
  MessageSquare, 
  Landmark, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Activity,
  Loader2
} from 'lucide-react';

export default function NotificationCenter({ role = "finance-officer" }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📥 FETCH LIVE ALERTS FROM SUPABASE
  async function loadNotifications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // 🛠️ SANDBOX FALLBACK: Keeps your UI populated if DB rows are empty
        const fallbacks = {
          "finance-officer": [
            { id: 991, type: "stage_1", title: "new request logged", msg: "rachel murambiwa logged a new travel allocation file for bulawayo hub.", time_label: "1m ago", read: false, link: "/finance-officer/review/7B9A2C41" },
            { id: 992, type: "stage_3", title: "hop approval signed", msg: "head of operations authorized 4 items for harare site visits.", time_label: "30m ago", read: false, link: "/finance-officer/review/7B9A2C41" }
          ],
          requester: [
            { id: 993, type: "clarification", title: "clarification needed", msg: "fo flagged your attachment for missing validation files.", time_label: "2h ago", read: false, link: "/requester" }
          ]
        };
        setAlerts(fallbacks[role] || []);
      } else {
        setAlerts(data);
      }
    } catch (err) {
      console.error("Notification database synchronization failure:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [role, supabase]);

  const unreadCount = alerts.filter(a => !a.read).length;

  // 📝 UPDATE READ STATUS IN DATABASE
  const handleNotificationClick = async (alert) => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    setIsOpen(false);

    // If it's a real DB record, update it on the backend
    if (alert.id < 900) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', alert.id);
    }

    if (alert.link) {
      router.push(alert.link);
    }
  };

  const markAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('role', role)
      .eq('read', false);
  };

  return (
    <div className="relative font-sans text-xs">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-[#0747A1] bg-gray-50 hover:bg-blue-50 rounded-full transition-all focus:outline-none border border-gray-200 cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#991B1B] text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 text-left overflow-hidden">
          
          <div className="p-3 bg-gray-50 border-b border-[#E5E7EB] flex items-center justify-between select-none">
            <span className="font-bold text-[#0A1628] uppercase tracking-wider text-[10px]">notification center feed</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[#0747A1] hover:underline font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer">
                <Check className="w-3 h-3" /> mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-gray-400 font-medium lowercase">
                <Loader2 className="w-4 h-4 text-[#0747A1] animate-spin" />
                <span>syncing feeds...</span>
              </div>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  onClick={() => handleNotificationClick(alert)}
                  className={`p-3 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-colors ${alert.read ? 'bg-white' : 'bg-blue-50/30'}`}
                >
                  <div className="mt-0.5 shrink-0 select-none">
                    {alert.type === 'stage_6' && <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />}
                    {alert.type === 'clarification' && <MessageSquare className="w-3.5 h-3.5 text-[#991B1B]" />}
                    {alert.type === 'stage_1' && <Circle className="w-3.5 h-3.5 fill-[#0747A1] text-[#0747A1]" />}
                    {alert.type === 'stage_3' && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                    {alert.type === 'stage_5' && <Landmark className="w-3.5 h-3.5 text-[#0747A1]" />}
                    {alert.type === 'stage_4' && <FileText className="w-3.5 h-3.5 text-[#D97706]" />}
                    {alert.type === 'stage_2' && <Activity className="w-3.5 h-3.5 text-[#0747A1]" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-bold text-[#0A1628] lowercase flex items-center gap-2">
                      {alert.title}
                      {!alert.read && <span className="w-1.5 h-1.5 bg-[#0747A1] rounded-full shrink-0" />}
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed lowercase">{alert.msg}</p>
                    <span className="text-[9px] text-[#9CA3AF] font-mono block pt-1 select-none">{alert.time_label || alert.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 text-center text-gray-400 italic lowercase flex flex-col items-center gap-2 select-none">
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