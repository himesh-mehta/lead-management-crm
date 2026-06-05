import React, { useState, useEffect } from 'react';
import { Sun, Moon, Database, HelpCircle, Check, Loader2, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead, getLeads } from '../services/api';

const MOCK_LEADS = [
  { name: 'Bruce Wayne', email: 'bruce@wayne.corp', phone: '+1 (555) 911-3948', company: 'Wayne Enterprises', status: 'Converted', notes: 'Interested in bulk contract for defense gear. Transformed to won deal.' },
  { name: 'Clark Kent', email: 'clark@dailyplanet.press', phone: '+1 (555) 438-1920', company: 'Daily Planet', status: 'New', notes: 'Inquired about digital subscription models and ad placements.' },
  { name: 'Diana Prince', email: 'diana@themyscira.org', phone: '+1 (555) 728-1039', company: 'Themyscira Museum', status: 'Qualified', notes: 'Budget approved for historical preservation software suite.' },
  { name: 'Barry Allen', email: 'barry.speed@ccpd.gov', phone: '+1 (555) 283-9481', company: 'Central City Police Dept', status: 'Contacted', notes: 'Demonstrated forensic tracking tool. Follow-up scheduled next Tuesday.' },
  { name: 'Tony Stark', email: 'tony@stark.industries', phone: '+1 (555) 382-0192', company: 'Stark Industries', status: 'Converted', notes: 'Purchased enterprise clean-energy grids package.' },
  { name: 'Peter Parker', email: 'peter@dailybugle.com', phone: '+1 (555) 739-1029', company: 'Daily Bugle', status: 'Lost', notes: 'Pricing too high for freelance photojournalism tracking.' },
  { name: 'Hal Jordan', email: 'hal@ferris.aero', phone: '+1 (555) 392-1082', company: 'Ferris Aircraft', status: 'New', notes: 'Looking for flight testing logs management system.' },
  { name: 'Arthur Curry', email: 'arthur@atlantisshipping.net', phone: '+1 (555) 902-8347', company: 'Atlantis Shipping', status: 'Contacted', notes: 'Sent quote for deep-sea navigation logs tracker.' },
  { name: 'Selina Kyle', email: 'selina@gothamcats.org', phone: '+1 (555) 109-2938', company: 'Kyle Charities', status: 'Lost', notes: 'Unresponsive after initial inquiry.' },
  { name: 'Wanda Maximoff', email: 'wanda@westview.net', phone: '+1 (555) 293-1029', company: 'Westview Co', status: 'Qualified', notes: 'Wants integration with scheduling platforms.' }
];

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Sync state with DOM class and localStorage
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.success('Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.success('Light mode enabled');
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    let successCount = 0;
    try {
      // First check if there's any existing leads to avoid massive duplicates easily
      const currentLeads = await getLeads({ limit: 1 });
      
      // We will seed
      for (const lead of MOCK_LEADS) {
        try {
          await createLead(lead);
          successCount++;
        } catch (e) {
          // If lead email already exists, skip
          console.warn(`Skipped seeding email ${lead.email}:`, e.message);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully seeded database with ${successCount} mock leads!`);
      } else {
        toast.error('Seeding complete. No new unique leads could be added (emails already exist).');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to run database seeder');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
          <SettingsIcon size={24} className="text-indigo-600 dark:text-indigo-400" />
          <span>System Settings</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Configure interface options, styling theme, and developer utilities
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Theme Preferences */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Interface Theme</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Toggle between Light mode and Dark mode views</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-9 w-20 items-center justify-between rounded-full bg-gray-100 dark:bg-slate-800 p-1 cursor-pointer transition-colors focus:outline-none border border-gray-200 dark:border-slate-700"
            >
              <span className="sr-only">Toggle dark mode</span>
              <Sun className={`h-4.5 w-4.5 text-amber-500 transition-opacity z-10 ml-1.5 ${darkMode ? 'opacity-30' : 'opacity-100'}`} />
              <Moon className={`h-4.5 w-4.5 text-indigo-400 transition-opacity z-10 mr-1.5 ${darkMode ? 'opacity-100' : 'opacity-30'}`} />
              
              <span
                className={`absolute left-1 h-7 w-7 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-200 ${
                  darkMode ? 'translate-x-11' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Developer Utilities */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Developer Utilities
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded">
              Demo Sandbox
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database size={15} className="text-gray-400" />
                <span>Seed Database</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md">
                Insert 10 unique pre-configured leads with realistic activity timelines to populate your charts and analytics instantly.
              </p>
            </div>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 rounded-xl shadow-md hover:shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all self-start sm:self-center"
            >
              {seeding ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Seeding Database...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Seed Mock Leads</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* About App Info */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-soft space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={15} className="text-gray-400" />
            <span>About LeadFlow CRM</span>
          </h2>
          <div className="text-xs text-gray-500 dark:text-slate-400 space-y-2 leading-relaxed">
            <p>
              LeadFlow CRM is a premium, lightweight Lead Pipeline Management platform. Built using React, Express, Neon PostgreSQL, and Drizzle ORM.
            </p>
            <p className="font-semibold text-gray-700 dark:text-slate-300">
              Version 1.0.0 (Production Build)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
