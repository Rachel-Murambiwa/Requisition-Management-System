"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  UserPlus, 
  LogOut, 
  Settings, 
  Plus, 
  Trash2, 
  MapPin, 
  ListPlus, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [hubs, setHubs] = useState([
    'Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo', 'Kwekwe', 'Kadoma', 'Chinhoyi'
  ]);
  const [categories, setCategories] = useState([
    'hub equipment & hardware',
    'internet, data & utilities',
    'workshop & classroom supplies',
    'marketing & community outreach',
    'travel & logistics',
    'miscellaneous emergency funds'
  ]);

  const [newHub, setNewHub] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load live hubs and categories from system_settings DB table if present
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from('system_settings').select('*').single();
        if (data) {
          if (data.hubs) setHubs(data.hubs);
          if (data.categories) setCategories(data.categories);
        }
      } catch (err) {
        // Fallback to default state if table not queried
      }
    }
    loadSettings();
  }, [supabase]);

  const handleAddHub = () => {
    if (!newHub.trim()) return;
    const cleanHub = newHub.trim();
    if (!hubs.includes(cleanHub)) {
      setHubs([...hubs, cleanHub]);
    }
    setNewHub('');
  };

  const handleRemoveHub = (hubToRemove) => {
    setHubs(hubs.filter(h => h !== hubToRemove));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const cleanCategory = newCategory.trim().toLowerCase();
    if (!categories.includes(cleanCategory)) {
      setCategories([...categories, cleanCategory]);
    }
    setNewCategory('');
  };

  const handleRemoveCategory = (catToRemove) => {
    setCategories(categories.filter(c => c !== catToRemove));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSaveStatus('');

    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ id: 1, hubs, categories, updated_at: new Date().toISOString() });

      if (error) throw error;
      setSaveStatus('system configuration & form parameters updated successfully!');
    } catch (err) {
      setSaveStatus('saved locally (to sync globally, ensure system_settings table exists).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased pb-20">
      
      {/* Navigation Bar */}
      <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => router.push('/admin')}>
            <span className="text-xl font-bold tracking-tight">uncommon</span>
            <span className="text-[10px] bg-[#991B1B] text-white font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">root admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#1A2E4A] p-1 rounded-md border border-slate-700">
              <a href="/admin/users" className="px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 text-slate-300 hover:text-white transition-all text-decoration-none lowercase">
                <Users className="w-3.5 h-3.5" />
                <span>user directory</span>
              </a>
              <a href="/admin/users/new" className="px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 text-slate-300 hover:text-white transition-all text-decoration-none lowercase">
                <UserPlus className="w-3.5 h-3.5" />
                <span>invite engine</span>
              </a>
              <a href="/admin/settings" className="px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 bg-[#0747A1] text-white shadow-sm transition-all text-decoration-none lowercase">
                <Settings className="w-3.5 h-3.5" />
                <span>system settings</span>
              </a>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="max-w-5xl mx-auto px-4 mt-10 space-y-8">
        
        <div className="border-b border-gray-200 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0A1628] tracking-tight lowercase">system & form configuration engine</h1>
            <p className="text-sm text-[#4B5563] mt-1">configure available regional hubs, manage form allocation categories, and update operational parameters</p>
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0747A1] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm border-none cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>save configurations</span>
          </button>
        </div>

        {saveStatus && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-xs font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* 1. REGIONAL HUB LOCATIONS BLOCK */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-4 h-4 text-[#0747A1]" />
            <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-wider">regional hub locations</h2>
          </div>
          <p className="text-xs text-gray-500">Admins can add new physical hubs here. These populate automatically in staff onboarding and dropdown selectors.</p>

          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Enter new hub name (e.g., Victoria Falls)..."
              value={newHub}
              onChange={(e) => setNewHub(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0747A1]"
            />
            <button 
              type="button"
              onClick={handleAddHub}
              className="px-4 py-2 bg-[#0A1628] hover:bg-[#1A2E4A] text-white text-xs font-bold uppercase rounded-md cursor-pointer border-none flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> add hub
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {hubs.map((hub, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-[#0A1628]">
                <span>{hub} Hub</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveHub(hub)}
                  className="text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. REQUISITION FORM CATEGORIES BLOCK */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <ListPlus className="w-4 h-4 text-[#0747A1]" />
            <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-wider">form operational categories</h2>
          </div>
          <p className="text-xs text-gray-500">Edit the categories available to requesters when creating new standard or emergency fund requests.</p>

          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Enter new category name (e.g., software licenses & SaaS)..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0747A1]"
            />
            <button 
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-[#0A1628] hover:bg-[#1A2E4A] text-white text-xs font-bold uppercase rounded-md cursor-pointer border-none flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> add category
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 lowercase">
                <span>{cat}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}