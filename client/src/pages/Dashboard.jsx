import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, ShieldAlert, ArrowRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStats, getLeads } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, leadsData] = await Promise.all([
          getStats(),
          getLeads({ page: 1, limit: 5, sort: 'created_at' }),
        ]);
        
        setStats(statsData.stats);
        setRecentLeads(leadsData.leads || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-800 rounded-lg"></div>
          <div className="h-28 bg-slate-800 rounded-lg"></div>
          <div className="h-28 bg-slate-800 rounded-lg"></div>
          <div className="h-28 bg-slate-800 rounded-lg"></div>
        </div>
        <div className="h-64 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  const total = stats?.total || 0;
  const converted = stats?.byStatus?.Converted || 0;
  const active = total - (converted + (stats?.byStatus?.Lost || 0));

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome to LeadFlow CRM</h1>
          <p className="text-sm text-slate-400">Here is a summary of your lead pipeline health today</p>
        </div>
        <button
          onClick={() => navigate('/leads/add')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shadow-lg shadow-indigo-650/15"
        >
          <Plus size={16} />
          Create New Lead
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value={total} 
          icon={Users} 
          color="indigo" 
          subtitle="All database contacts" 
        />
        <StatCard 
          title="Converted Leads" 
          value={converted} 
          icon={UserCheck} 
          color="green" 
          subtitle="Deals closed won" 
        />
        <StatCard 
          title="Active Leads" 
          value={active < 0 ? 0 : active} 
          icon={Clock} 
          color="blue" 
          subtitle="Leads in progress" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={stats?.conversionRate || '0.0%'} 
          icon={ShieldAlert} 
          color="yellow" 
          subtitle="Overall success rate" 
        />
      </div>

      {/* Recent Leads Panel */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 uppercase tracking-wider text-sm">
            Recently Added Leads
          </h3>
          <button
            onClick={() => navigate('/leads')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View All Leads
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {recentLeads.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              No leads registered yet. Start by creating a lead.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-750/30 cursor-pointer transition-colors text-slate-200 text-sm"
                    onClick={() => navigate(`/leads/edit/${lead.id}`)}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-100">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-350">{lead.company}</td>
                    <td className="px-6 py-4 text-slate-400">{lead.email}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-450">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
