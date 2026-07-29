"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  const [userId, setUserId] = useState(null);

  // Helper to format timestamps dynamically
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'just now';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // 📥 METHOD A: INITIAL DATABASE FETCH
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch real notifications for this user (or fallback to role filter if needed)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},role.eq.${role}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setAlerts(data || []);
    } catch (err) {
      console.error("Database retrieval failure:", err.message);
    } finally {
      setLoading(false);
    }
  }, [role, supabase]);

  // 📡 METHOD B: REAL-TIME STREAM PIPELINE
  useEffect(() => {
    loadNotifications();

    if (!userId) return;

    // WebSocket subscription listening for new inserts for this user/role
    const notificationsChannel = supabase
      .channel(`realtime_alerts_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setAlerts((currentAlerts) => [payload.new, ...currentAlerts]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [loadNotifications, userId, supabase]);

  // Unread badge count (supports both `is_read` and `read` column conventions)
  const unreadCount = alerts.filter(a => !(a.is_read ?? a.read)).length;

  const handleNotificationClick = async (alert) => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, is_read: true, read: true } : a));
    setIsOpen(false);

    // Update read state in database
    await supabase
      .from('notifications')
      .update({ is_read: true, read: true })
      .eq('id', alert.id);

    // Dynamic Route Navigation
    if (alert.link) {
      router.push(alert.link);
    } else if (alert.requisition_id) {
      router.push(`/${role}/review/${alert.requisition_id}`);
    } else {
      router.push(`/${role}`);
    }
  };

  const markAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true, read: true })));

    if (userId) {
      await supabase
        .from('notifications')
        .update({ is_read: true, read: true })
        .eq('user_id', userId);
    }
  };

  return (
    <div className="relative font-sans text-xs text-[#111827]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-[#0747A1] bg-gray-50 hover:bg-blue-50 rounded-full transition-all focus:outline-none border border-gray-200 cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#991B1B] text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 text-left overflow-hidden animate-fadeIn">
          
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
                <span>syncing dynamic streams...</span>
              </div>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => {
                const isRead = alert.is_read ?? alert.read;
                const messageText = alert.message || alert.msg;

                return (
                  <div 
                    key={alert.id} 
                    onClick={() => handleNotificationClick(alert)}
                    className={`p-3 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-colors ${isRead ? 'bg-white' : 'bg-blue-50/30'}`}
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
                        {!isRead && <span className="w-1.5 h-1.5 bg-[#0747A1] rounded-full shrink-0" />}
                      </div>
                      <p className="text-gray-600 text-[11px] leading-relaxed lowercase">{messageText}</p>
                      <span className="text-[9px] text-[#9CA3AF] font-mono block pt-1 select-none">
                        {alert.time_label || formatTimeAgo(alert.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
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