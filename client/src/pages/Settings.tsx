import React, { useState } from 'react';
import { 
  Database, Loader2, Sparkles, 
  Settings as SettingsIcon, User, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead, getLeads } from '../services/api';
import { LeadStatus, Lead } from '../types';

const MOCK_LEADS: Omit<Lead, 'id' | 'createdAt'>[] = [
  { name: 'Sarah Connor', email: 'sarah@resistance.net', phone: '+1 (555) 198-4202', company: 'Cyberdyne Systems', status: 'Contacted' as LeadStatus, source: 'Web', notes: 'Interested in structural security assessments and monitoring logs.', gender: 'Female' },
  { name: 'Bruce Wayne', email: 'bruce@wayne.corp', phone: '+1 (555) 911-3948', company: 'Wayne Enterprises', status: 'Converted' as LeadStatus, source: 'Referral', notes: 'Interested in bulk contract for defense gear. Transformed to won deal.', gender: 'Male' },
  { name: 'Clark Kent', email: 'clark@dailyplanet.press', phone: '+1 (555) 438-1920', company: 'Daily Planet', status: 'New' as LeadStatus, source: 'Web', notes: 'Inquired about digital subscription models and ad placements.', gender: 'Male' },
  { name: 'Diana Prince', email: 'diana@themyscira.org', phone: '+1 (555) 728-1039', company: 'Themyscira Museum', status: 'Qualified' as LeadStatus, source: 'Partner', notes: 'Budget approved for historical preservation software suite.', gender: 'Female' },
  { name: 'Barry Allen', email: 'barry.speed@ccpd.gov', phone: '+1 (555) 283-9481', company: 'Central City Police Dept', status: 'Contacted' as LeadStatus, source: 'Social Media', notes: 'Demonstrated forensic tracking tool. Follow-up scheduled next Tuesday.', gender: 'Male' },
  { name: 'Tony Stark', email: 'tony@stark.industries', phone: '+1 (555) 382-0192', company: 'Stark Industries', status: 'Converted' as LeadStatus, source: 'Referral', notes: 'Purchased enterprise clean-energy grids package.', gender: 'Male' },
  { name: 'Peter Parker', email: 'peter@dailybugle.com', phone: '+1 (555) 739-1029', company: 'Daily Bugle', status: 'Lost' as LeadStatus, source: 'Web', notes: 'Pricing too high for freelance photojournalism tracking.', gender: 'Male' },
  { name: 'Hal Jordan', email: 'hal@ferris.aero', phone: '+1 (555) 392-1082', company: 'Ferris Aircraft', status: 'New' as LeadStatus, source: 'Partner', notes: 'Looking for flight testing logs management system.', gender: 'Male' },
  { name: 'Arthur Curry', email: 'arthur@atlantisshipping.net', phone: '+1 (555) 902-8347', company: 'Atlantis Shipping', status: 'Contacted' as LeadStatus, source: 'Cold-Call', notes: 'Sent quote for deep-sea navigation logs tracker.', gender: 'Male' },
  { name: 'Wanda Maximoff', email: 'wanda@westview.net', phone: '+1 (555) 293-1029', company: 'Westview Co', status: 'Qualified' as LeadStatus, source: 'Social Media', notes: 'Wants integration with scheduling platforms.', gender: 'Female' }
];

const Settings: React.FC = () => {
  const [seeding, setSeeding] = useState(false);

  // Profile preferences
  const [profile, setProfile] = useState({
    name: 'Himesh Mehta',
    email: 'himesh@example.com',
    role: 'Super Administrator'
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    leadIntake: true,
    dealClosings: true,
    weeklySummaries: false
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Administrator profile updated successfully!');
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    let successCount = 0;
    try {
      // Fetch current leads to see if emails overlap
      await getLeads({ limit: 5 });
      
      for (const lead of MOCK_LEADS) {
        try {
          await createLead(lead);
          successCount++;
        } catch (e: any) {
          console.warn(`Skipped email ${lead.email}:`, e.message);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Seeded ${successCount} mock prospects in Neon PostgreSQL`);
      } else {
        toast.error('All mock emails already exist in database');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete seeder');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in pb-24">
      {/* Page Header */}
      <div className="border-b border-gray-150 dark:border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          System Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Manage system configurations, profiles, seeder utilities, and notify rules
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Settings form */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-155 dark:border-slate-800 rounded-2xl shadow-soft space-y-4">
          <h2 className="text-sm font-semibold text-gray-950 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <User size={16} className="text-indigo-500" />
            <span>Profile Settings</span>
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-205 dark:border-slate-800 rounded-xl bg-transparent text-xs text-gray-855 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Role Position
                </label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full px-3.5 py-2 border border-gray-150 dark:border-slate-855 rounded-xl bg-gray-50 dark:bg-slate-850 text-xs text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-555 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-transparent text-xs text-gray-800 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>


        {/* Notification preferences */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-805 rounded-2xl shadow-soft space-y-4">
          <h2 className="text-sm font-semibold text-gray-955 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <Bell size={16} className="text-indigo-500" />
            <span>Notification Rules</span>
          </h2>

          <div className="space-y-4 divide-y divide-gray-50 dark:divide-slate-850">
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-slate-250">New Lead Intake</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">Email alerts when prospective web forms are qualified</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.leadIntake}
                onChange={() => setNotifications({ ...notifications, leadIntake: !notifications.leadIntake })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-slate-250">Deal Closings</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">Push notifications immediately on closed won conversion states</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dealClosings}
                onChange={() => setNotifications({ ...notifications, dealClosings: !notifications.dealClosings })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-605 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Database Seeding Utility */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-950 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
              <Database size={16} className="text-indigo-500" />
              <span>Sandbox Data Seeder</span>
            </h2>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded">
              Demo Environment
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <p className="text-xs text-gray-505 dark:text-slate-400 max-w-md">
                Insert 10 unique pre-configured prospects with realistic funnel states (New, Contacted, Converted, Lost) and note entries to populate metrics charts.
              </p>
            </div>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 rounded-xl shadow-md active:scale-95 transition-all self-start sm:self-center"
            >
              {seeding ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Seeding PostgreSQL...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Seed Mock Leads</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
