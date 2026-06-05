import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Target, TrendingUp, XCircle, Activity, 
  ArrowRight, PhoneCall, Calendar, AlertCircle
} from 'lucide-react';
import { useStatsQuery, useLeadsQuery } from '../hooks/useLeads';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { getAvatarUrl } from '../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
} as const;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Load stats and recent leads via React Query
  const { data: statsRes, isLoading: statsLoading } = useStatsQuery();
  const { data: leadsRes, isLoading: leadsLoading } = useLeadsQuery({ page: 1, limit: 6, sort: 'created_at' });

  const loading = statsLoading || leadsLoading;

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-slate-800">
          <div className="h-7 bg-gray-250 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-slate-805 rounded w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-gray-255 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-250 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-gray-250 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = statsRes?.stats;
  const recentLeads = leadsRes?.leads || [];
  const total = stats?.total || 0;

  if (total === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <EmptyState 
          title="No Sales Pipeline Data" 
          description="Qualify contacts or generate sandbox mock accounts inside System Settings to view metric logs."
          onActionClick={() => navigate('/leads?add=true')}
        />
      </div>
    );
  }

  const newLeads = stats?.byStatus?.New || 0;
  const contacted = stats?.byStatus?.Contacted || 0;
  const qualified = stats?.byStatus?.Qualified || 0;
  const converted = stats?.byStatus?.Converted || 0;
  const lost = stats?.byStatus?.Lost || 0;
  const conversionRate = stats?.conversionRate || '0.0%';

  // Mocked follow-up tasks for realistic CRM experience
  const mockFollowUps = recentLeads
    .filter(lead => lead.status === 'Contacted' || lead.status === 'Qualified')
    .slice(0, 3)
    .map((lead, index) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      date: index === 0 ? 'Today, 3:30 PM' : 'Tomorrow, 10:00 AM',
      type: index === 0 ? 'Discovery Call' : 'Proposal Review'
    }));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto"
    >
      {/* Header welcome banner */}
      <motion.div 
        variants={itemVariants} 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <span>Executive Workspace</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Real-time aggregate logs and customer conversion diagnostics
          </p>
        </div>

        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <span>Leads Directory</span>
          <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* KPI Cards Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Contacts"
          value={total}
          growth="+14%"
          trend="up"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="New Prospects"
          value={newLeads}
          growth="+8%"
          trend="up"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Qualified Deals"
          value={qualified}
          growth="+24%"
          trend="up"
          icon={Target}
          color="orange"
        />
        <StatCard
          title="Won Customers"
          value={converted}
          growth="+32%"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Closed Lost"
          value={lost}
          growth="-3%"
          trend="down"
          icon={XCircle}
          color="red"
        />
      </motion.div>

      {/* Main split dashboard section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel chart card */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-905 dark:text-gray-100 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              <span>Pipeline Stage Conversion Funnel</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-6">
              Distribution of sales opportunities across system stages
            </p>

            <div className="space-y-5">
              {[
                { name: 'Prospecting (New & Contacted)', count: newLeads + contacted, color: 'bg-blue-500' },
                { name: 'Qualified Stage', count: qualified, color: 'bg-indigo-500' },
                { name: 'Won Deals (Converted Customers)', count: converted, color: 'bg-emerald-500' },
                { name: 'Closed Lost Accounts', count: lost, color: 'bg-red-500' },
              ].map((stage) => {
                const pct = total > 0 ? ((stage.count / total) * 100).toFixed(0) : 0;
                return (
                  <div key={stage.name}>
                    <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-slate-350 mb-1.5">
                      <span>{stage.name}</span>
                      <span className="text-gray-500 dark:text-slate-400">
                        {stage.count} leads ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-850 rounded-full overflow-hidden border border-gray-200/20">
                      <div 
                        className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion rate indicator */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 dark:text-slate-450 uppercase tracking-widest font-bold">
                  Sales Conversion Rate
                </span>
                <h4 className="text-lg font-bold text-gray-905 dark:text-white leading-tight">
                  {conversionRate}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Cycle benchmark duration
              </p>
              <p className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 mt-0.5">
                Won leads average 14 days
              </p>
            </div>
          </div>
        </div>

        {/* Right timeline and follow ups */}
        <div className="space-y-6">
          
          {/* Upcoming follow-ups widget */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <PhoneCall size={15} className="text-indigo-500" />
              <span>Upcoming Follow-Ups</span>
            </h3>

            <div className="space-y-3">
              {mockFollowUps.map(task => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/30 hover:-translate-y-0.5 hover:shadow-sm hover:border-indigo-300 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/leads/${task.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{task.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 font-semibold">
                      {task.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-450 mt-1">{task.company}</p>
                  
                  <div className="flex items-center justify-between mt-3 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {task.date}</span>
                    <span>{task.phone}</span>
                  </div>
                </div>
              ))}

              {mockFollowUps.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400 flex flex-col items-center gap-1.5">
                  <AlertCircle size={18} className="text-gray-300" />
                  <span>No scheduled follow-up tasks</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit activities feed */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
            <h3 className="text-sm font-bold text-gray-950 dark:text-gray-100 mb-4 border-b border-gray-50 dark:border-slate-850 pb-2.5">
              Intake Audit Log
            </h3>

            <div className="pl-1 space-y-4 max-h-52 overflow-y-auto">
              {recentLeads.slice(0, 3).map((lead, idx) => (
                <div key={lead.id} className="relative text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="relative flex-shrink-0">
                      <img src={getAvatarUrl(lead.name, lead.gender)} alt="" className="w-7 h-7 rounded-full border border-gray-205 shadow-sm" />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full border border-white bg-white items-center justify-center">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          lead.status === 'Converted' ? 'bg-emerald-500' :
                          lead.status === 'Qualified' ? 'bg-indigo-500' :
                          lead.status === 'Lost' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-800 dark:text-slate-300 leading-normal">
                        <span className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                          {lead.name}
                        </span>{' '}
                        registered from <span className="font-semibold">{lead.company}</span>
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {idx === 0 ? 'Just now' : `${idx * 4}h ago`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
