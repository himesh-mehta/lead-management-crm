import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Target, TrendingUp, XCircle, 
  ArrowRight, PhoneCall, Calendar, AlertCircle, 
  Globe, Clock, Phone, Mail, Building2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useStatsQuery, useLeadsQuery } from '../hooks/useLeads';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { getAvatarUrl, formatDate } from '../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
} as const;

const STATUS_COLORS = {
  New: '#ff7a59',       // HubSpot Orange
  Contacted: '#F59E0B', // Amber
  Qualified: '#8B5CF6', // Purple
  Converted: '#10B981', // Emerald
  Lost: '#EF4444',       // Red
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Load stats and recent leads via React Query
  const { data: statsRes, isLoading: statsLoading } = useStatsQuery();
  const { data: leadsRes, isLoading: leadsLoading } = useLeadsQuery({ page: 1, limit: 8, sort: 'created_at' });

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

  // 1. Leads growth accumulative trends (mocked based on total)
  const growthData = [
    { name: 'Jan', count: 3 },
    { name: 'Feb', count: 6 },
    { name: 'Mar', count: 5 },
    { name: 'Apr', count: 10 },
    { name: 'May', count: Math.max(3, total - 4) },
    { name: 'Jun', count: total },
  ];

  // 2. Horizontal Funnel Data
  const funnelData = [
    { stage: 'Prospecting', count: newLeads + contacted, rate: '100%', fill: '#ff7a59' },
    { stage: 'Qualified Stage', count: qualified, rate: `${total > 0 ? ((qualified / total) * 100).toFixed(0) : 0}%`, fill: '#8B5CF6' },
    { stage: 'Won Deals', count: converted, rate: conversionRate, fill: '#10B981' },
  ];

  // 3. Status Pie Distribution
  const pieData = stats?.byStatus
    ? Object.keys(stats.byStatus).map((status) => ({
        name: status,
        value: stats.byStatus[status as keyof typeof stats.byStatus] || 0,
      }))
    : [];

  // 4. Monthly Target vs Actual
  const performanceData = [
    { month: 'Apr', Target: 10, Actual: 8 },
    { month: 'May', Target: 12, Actual: 10 },
    { month: 'Jun', Target: 15, Actual: total },
  ];

  // 5. Source Breakdown mapping
  const sourceBreakdown = [
    { name: 'Web Intake', count: recentLeads.filter(l => l.source === 'Web').length + 3, pct: 45, color: 'bg-indigo-500' },
    { name: 'Referral Direct', count: recentLeads.filter(l => l.source === 'Referral').length + 2, pct: 30, color: 'bg-emerald-500' },
    { name: 'Cold Call', count: recentLeads.filter(l => l.source === 'Cold-Call').length + 1, pct: 15, color: 'bg-amber-500' },
    { name: 'Other Channels', count: 2, pct: 10, color: 'bg-slate-400' }
  ];

  // Dynamic pipeline health calculation
  const lostRatio = total > 0 ? (lost / total) : 0;
  const healthScore = Math.max(50, Math.round(100 - (lostRatio * 150)));

  // Mocked follow-up tasks linked to actual leads
  const mockFollowUps = recentLeads
    .filter(lead => lead.status === 'Contacted' || lead.status === 'Qualified')
    .slice(0, 3)
    .map((lead, index) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      gender: lead.gender,
      priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low',
      date: index === 0 ? 'Today, 3:30 PM' : 'Tomorrow, 10:00 AM',
      type: index === 0 ? 'Discovery Call' : 'Proposal Review'
    }));

  // Activity Feed logs
  const activityLogs = recentLeads.slice(0, 4).map((lead, idx) => {
    let action = 'registered as a new lead';
    let detail = `Company: ${lead.company}`;
    let badgeColor = 'bg-indigo-500';

    if (lead.status === 'Converted') {
      action = 'converted to Won Customer 🎉';
      detail = 'Enterprise tier package closed';
      badgeColor = 'bg-emerald-500';
    } else if (lead.status === 'Qualified') {
      action = 'qualified for proposal review';
      detail = 'Budget verified and authorized';
      badgeColor = 'bg-purple-500';
    } else if (lead.status === 'Contacted') {
      action = 'contacted via direct channel';
      detail = 'Demo meeting scheduled';
      badgeColor = 'bg-amber-500';
    }

    return {
      id: lead.id,
      name: lead.name,
      action,
      detail,
      time: idx === 0 ? 'Just now' : idx === 1 ? '45m ago' : `${idx * 2}h ago`,
      badgeColor,
      gender: lead.gender
    };
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-24"
    >
      {/* Header section */}
      <motion.div 
        variants={itemVariants} 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <span>Executive Workspace</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">
            Real-time aggregate conversion metrics and sales funnel velocity diagnostics
          </p>
        </div>

        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-xs"
        >
          <span>Leads Pipeline</span>
          <ArrowRight size={13} />
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

      {/* Analytics: Top Row Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cumulative Lead Growth Area Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Lead Acquisition Velocity
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
                Cumulative leads added over the last 6 months
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              MoM +24%
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="indigoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7a59" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ff7a59" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#ff7a59" strokeWidth={1.8} fillOpacity={1} fill="url(#indigoAreaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Funnel Visualizer */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft">
          <div className="mb-5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pipeline Funnel Performance
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
              Conversion yields across primary CRM pipeline stages
            </p>
          </div>

          <div className="h-56 flex flex-col justify-center space-y-4">
            {funnelData.map((item) => {
              const pct = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-650 dark:text-slate-300">{item.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-850 dark:text-white">{item.count} leads</span>
                      <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.2 rounded font-mono">
                        Yield: {item.rate}
                      </span>
                    </div>
                  </div>
                  <div className="h-3.5 w-full bg-slate-50 dark:bg-slate-850 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800/60">
                    <div 
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[8px] font-bold text-white"
                      style={{ 
                        width: `${Math.max(12, pct)}%`,
                        backgroundColor: item.fill
                      }}
                    >
                      {pct >= 20 && `${pct.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </motion.div>

      {/* Analytics: Bottom Row Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Conversion Rate Circle Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft flex flex-col justify-between h-72">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Deals Conversion Ratio
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
              Proportion of total leads successfully won
            </p>
          </div>

          <div className="flex justify-center items-center relative py-4">
            {/* Custom SVG Circular indicator */}
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(241, 245, 249, 0.9)" strokeWidth="8" fill="transparent" className="dark:stroke-slate-800" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#10B981" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (parseFloat(conversionRate) || 0)) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{conversionRate}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Win Rate</span>
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-450 dark:text-slate-400 font-semibold border-t border-slate-50 dark:border-slate-850 pt-3">
            Benchmark: <span className="text-indigo-600 dark:text-indigo-400 font-bold">14 days avg conversion cycles</span>
          </div>
        </div>

        {/* Lead Status Distribution Pie Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft flex flex-col justify-between h-72">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Status Distribution
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
              Proportion of leads in each stage
            </p>
          </div>

          <div className="h-40 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#ff7a59'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    fontSize: '10px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Legend Dot counts */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-md font-extrabold text-slate-900 dark:text-white">{total}</span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Total</span>
            </div>
          </div>

          {/* Simple custom inline legend grid */}
          <div className="grid grid-cols-5 gap-1 text-[8px] font-bold uppercase text-slate-450 dark:text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-3 text-center">
            {Object.keys(STATUS_COLORS).slice(0, 5).map(status => (
              <div key={status} className="flex flex-col items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }} />
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance (Target vs Actual) Bar Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft flex flex-col justify-between h-72">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Monthly Deal Goals
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
              Current performance compared to monthly targets
            </p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    fontSize: '10px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="Target" fill="#cbd5e1" radius={[3, 3, 0, 0]} className="dark:fill-slate-800" />
                <Bar dataKey="Actual" fill="#ff7a59" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold border-t border-slate-50 dark:border-slate-850 pt-3">
            <span className="text-slate-400">Status</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp size={12} /> Target Met (87% yield)
            </span>
          </div>
        </div>

      </motion.div>

      {/* Grid: Activity Timeline, Upcoming Followups, Additional Widgets */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle spans: Recent Leads Table & Activity timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Leads Table Widget */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Sales Opportunities
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
                  Most recently registered prospects in the pipeline
                </p>
              </div>
              <button 
                onClick={() => navigate('/leads')}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 pb-2">Name</th>
                    <th className="py-2.5 pb-2">Company</th>
                    <th className="py-2.5 pb-2">Status</th>
                    <th className="py-2.5 pb-2 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {recentLeads.slice(0, 5).map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-slate-50/20 dark:hover:bg-slate-850/10 transition-colors cursor-pointer"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <td className="py-2.5 font-bold text-slate-905 dark:text-white flex items-center gap-2">
                        <img src={getAvatarUrl(lead.name, lead.gender)} alt="" className="w-6 h-6 rounded-full border border-slate-100 shadow-xs flex-shrink-0" />
                        <span>{lead.name}</span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{lead.company}</td>
                      <td className="py-2.5">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="py-2.5 text-right text-slate-400 font-medium">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">
              Intake & Activity Log
            </h3>
            
            <div className="relative border-l border-slate-100 dark:border-slate-850 ml-3.5 pl-6 space-y-5">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  {/* Timeline Badge */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center">
                    <span className={`h-1.5 w-1.5 rounded-full ${log.badgeColor}`} />
                  </span>

                  <div className="flex items-start gap-3">
                    <img src={getAvatarUrl(log.name, log.gender)} alt="" className="w-7 h-7 rounded-full border border-slate-100 shadow-xs flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-slate-800 dark:text-slate-300 leading-normal">
                          <span 
                            className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
                            onClick={() => navigate(`/leads/${log.id}`)}
                          >
                            {log.name}
                          </span>{' '}
                          {log.action}
                        </p>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                          <Clock size={9} /> {log.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold mt-0.5">
                        {log.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right timeline and widgets list */}
        <div className="space-y-6">
          
          {/* Upcoming follow-ups widget */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <PhoneCall size={14} className="text-indigo-500" />
              <span>Upcoming Follow-Ups</span>
            </h3>

            <div className="space-y-3">
              {mockFollowUps.map(task => (
                <div 
                  key={task.id} 
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/20 hover:-translate-y-0.5 hover:shadow-xs hover:border-indigo-300 transition-all duration-300 cursor-pointer relative group"
                  onClick={() => navigate(`/leads/${task.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <img src={getAvatarUrl(task.name, task.gender)} alt="" className="w-8 h-8 rounded-full border border-slate-100 shadow-xs flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate pr-14">{task.name}</p>
                        {/* Priority Badge */}
                        <span className={`absolute top-3 right-3 text-[8px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider border ${
                          task.priority === 'High' 
                            ? 'text-red-600 bg-red-50/50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30' 
                            : task.priority === 'Medium'
                              ? 'text-amber-600 bg-amber-50/50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30'
                              : 'text-blue-600 bg-blue-50/50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold mt-0.5 flex items-center gap-1">
                        <Building2 size={11} />
                        <span>{task.company}</span>
                      </p>

                      <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400 font-semibold border-t border-slate-100/50 dark:border-slate-800/50 pt-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {task.date}</span>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <a href={`tel:${task.phone}`} className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-650" title="Call Client">
                            <Phone size={10} />
                          </a>
                          <a href={`mailto:${task.email}`} className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-650" title="Email Client">
                            <Mail size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {mockFollowUps.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                  <AlertCircle size={18} className="text-slate-305" />
                  <span>No scheduled follow-up tasks</span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Widgets (Pipeline Health & Response Times) */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Pipeline Health Score
            </h3>

            {/* Health Score Ring and values */}
            <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <div className="relative flex items-center justify-center flex-shrink-0">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(241, 245, 249, 0.9)" strokeWidth="10" fill="transparent" className="dark:stroke-slate-800" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#ff7a59" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-slate-850 dark:text-white">{healthScore}%</span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-850 dark:text-white uppercase tracking-wider">Excellent Rating</p>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                  Archived Lost ratios are currently within healthy 15% boundaries.
                </p>
              </div>
            </div>

            {/* Additional details (Avg response, top channels) */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-slate-50/40 dark:bg-slate-850/10 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Avg Response</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white mt-1 block flex items-center gap-1">
                  <Clock size={12} className="text-indigo-500" /> 1.8 hrs
                </span>
              </div>

              <div className="p-3 bg-slate-50/40 dark:bg-slate-850/10 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Acquisition channel</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white mt-1 block flex items-center gap-1">
                  <Globe size={12} className="text-indigo-500" /> Web Forms
                </span>
              </div>
            </div>

            {/* Lead channels bar details */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <p className="text-[9px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest">Channel Breakdown</p>
              
              <div className="space-y-2">
                {sourceBreakdown.map(ch => (
                  <div key={ch.name} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 dark:text-slate-400">
                      <span>{ch.name}</span>
                      <span>{ch.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className={`h-full ${ch.color} rounded-full`} style={{ width: `${ch.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
