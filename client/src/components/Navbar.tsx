import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Bell, Clock, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface NavbarProps {
  onAddLeadClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddLeadClick }) => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('navbar-search') as HTMLInputElement | null;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/leads?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const mockNotifications = [
    { id: 1, text: 'Sarah Connor was contacted', time: '5m ago', unread: true },
    { id: 2, text: 'Bruce Wayne converted to Customer', time: '1h ago', unread: true },
    { id: 3, text: 'Acme Corp pipeline updated to Qualified', time: '2h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 h-12 w-full hubspot-header flex items-center justify-between pl-3 pr-6 transition-colors duration-300">
      
      {/* Left: Branding */}
      <div className="flex items-center gap-4">
        {/* Logo and Name */}
        <div className="flex items-center gap-2.5 mr-2 select-none cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center justify-center text-white font-extrabold text-sm tracking-wide">
            LB
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">
              LeadBridge
            </h3>
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 leading-none">
              Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Action bar */}
      <div className="flex items-center gap-3.5 flex-1 justify-end">
        {/* Global Keyboard Shortcut Visual Search Input shifted to right */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="navbar-search"
            type="text"
            placeholder="Search CRM or type '/'..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-9 pr-12 py-1.5 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-900/50 border transition-all duration-200 text-slate-850 dark:text-slate-200 focus:outline-none ${
              searchFocused 
                ? 'border-indigo-500 ring-2 ring-indigo-500/15 bg-white dark:bg-slate-900' 
                : 'border-white/20 hover:border-white/40'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500 font-mono pointer-events-none">
            ⌘K
          </span>
        </form>

        {/* Add New Lead Action CTA */}
        {onAddLeadClick && (
          <button
            onClick={onAddLeadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-500/10 hover:shadow-indigo-500/20"
            title="Create Lead"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        )}

        {/* Vertical divider */}
        <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors ${notificationsOpen ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-scale-in header-dropdown">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-850 max-h-60 overflow-y-auto">
                {mockNotifications.map(notif => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${notif.unread ? 'bg-indigo-500' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 dark:text-slate-350 font-medium leading-normal">{notif.text}</p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={10} /> {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm shadow-indigo-650/10 border border-white/25">
              HM
            </div>
            <ChevronDown size={12} className="text-white/70 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden py-1.5 animate-scale-in header-dropdown">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Himesh Mehta</p>
                <p className="text-[9px] text-slate-450 dark:text-slate-500">himesh@example.com</p>
              </div>

              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Settings size={13} className="text-slate-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Shield size={13} className="text-slate-400" />
                <span>Security Policies</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  toast.success('Logged out successfully');
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5 transition-colors"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
