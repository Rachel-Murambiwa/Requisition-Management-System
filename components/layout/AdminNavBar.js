import { Users, UserPlus, LogOut } from 'lucide-react';

export function AdminNavbar({ activeRoute, onSignOut }) {
  return (
    <nav className="w-full bg-[#0A1628] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <span className="text-xl font-bold tracking-tight">uncommon</span>
          <span className="text-[10px] bg-[#991B1B] text-white font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">root admin</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#1A2E4A] p-1 rounded-md border border-slate-700">
            <a 
              href="/admin/users" 
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all text-decoration-none lowercase ${
                activeRoute === 'directory' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>user directory</span>
            </a>
            <a 
              href="/admin/users/new" 
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all text-decoration-none lowercase ${
                activeRoute === 'invite' ? 'bg-[#0747A1] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
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