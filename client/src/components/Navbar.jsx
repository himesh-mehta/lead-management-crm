import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Search, Bell, Clock, LogOut, Settings, Shield, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ title, toggleSidebar, onAddLeadClick }) => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('light');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Sync theme icon
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setThemeMode(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextDark = themeMode === 'light';
    setThemeMode(nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: 1, text: 'Sarah Connor was contacted', time: '5m ago', unread: true },
    { id: 2, text: 'Bruce Wayne converted to Customer', time: '1h ago', unread: true },
    { id: 3, text: 'Acme Corp pipeline updated to Qualified', time: '2h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 w-full glass-panel border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors duration-300">
      
      {/* Left: Mobile Toggle & Page Header Title */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Title */}
        <h2 className="hidden sm:block text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {title}
        </h2>

        {/* Global Keyboard Shortcut Visual Search Input */}
        <div className="relative max-w-xs w-full hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search dashboard..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-9 pr-12 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-900/50 border transition-all duration-200 text-gray-800 dark:text-slate-200 focus:outline-none ${
              searchFocused 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900' 
                : 'border-gray-200 dark:border-slate-800'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-mono pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right side: Action bar */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
        </button>

        {/* Add New Lead Action CTA */}
        {onAddLeadClick && (
          <button
            onClick={onAddLeadClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-[0.98] transition-all"
            title="Create Lead"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors ${notificationsOpen ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Notifications</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-slate-850 max-h-60 overflow-y-auto">
                {mockNotifications.map(notif => (
                  <div key={notif.id} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${notif.unread ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-800 dark:text-slate-200 font-medium leading-relaxed">{notif.text}</p>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-1">
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
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-indigo-600/10 hover:ring-indigo-600/30 transition-all">
              HM
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden py-1.5 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Himesh Mehta</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">himesh@example.com</p>
              </div>

              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Settings size={14} className="text-gray-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <Shield size={14} className="text-gray-400" />
                <span>Security Policies</span>
              </button>

              <div className="border-t border-gray-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  toast.success('Logged out successfully');
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5 transition-colors"
              >
                <LogOut size={14} />
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
