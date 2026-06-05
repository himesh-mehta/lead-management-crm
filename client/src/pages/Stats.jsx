import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, TrendingUp, HelpCircle, BarChart3, Clock, Calendar, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getStats, getLeads } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const STATUS_COLORS = {
  New: 'rgb(59, 130, 246)',       // Blue
  Contacted: 'rgb(245, 158, 11)', // Orange
  Qualified: 'rgb(139, 92, 246)', // Purple
  Converted: 'rgb(16, 185, 129)', // Green
  Lost: 'rgb(239, 68, 68)',       // Red
};

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsData, leadsData] = await Promise.all([
          getStats(),
          getLeads({ page: 1, limit: 5, sort: 'created_at' }),
        ]);
        if (statsData && statsData.stats) {
          setStats(statsData.stats);
        }
        setRecentLeads(leadsData.leads || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load analytics details');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalLeads = stats?.total || 0;
  const convertedLeads = stats?.byStatus?.Converted || 0;
  const lostLeads = stats?.byStatus?.Lost || 0;
  const conversionRate = stats?.conversionRate || '0.0%';

  const statusData = stats?.byStatus
    ? Object.keys(stats.byStatus).map((status) => ({
        name: status,
        value: stats.byStatus[status],
      }))
    : [];

  // Monthly Lead Intake Data
  const monthlyData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 7 },
    { name: 'Mar', count: 5 },
    { name: 'Apr', count: 12 },
    { name: 'May', count: stats?.thisMonth || 8 },
    { name: 'Jun', count: totalLeads },
  ];

  if (totalLeads === 0) {
    return (
      <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150/40 rounded-3xl text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Analytics Data Available Yet</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Pipeline metrics and lead intake volumes will generate automatically once you add contacts in the directory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-gray-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={24} />
          <span>Pipeline Analytics</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Detailed metrics, conversion rates, and monthly intake performance logs
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Contacts"
          value={totalLeads}
          growth="+14.2%"
          trend="up"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Closed Won"
          value={convertedLeads}
          growth="+22.1%"
          trend="up"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Closed Lost"
          value={lostLeads}
          growth="-3.4%"
          trend="down"
          icon={UserX}
          color="red"
        />
        <StatCard
          title="Conversion Rate"
          value={conversionRate}
          growth="+8.3%"
          trend="up"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Charts Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Leads by Status Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <span>Leads by Pipeline Status</span>
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || 'rgb(79, 70, 229)'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(15, 21, 33)',
                    borderColor: 'rgb(31, 41, 55)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-gray-500 dark:text-slate-400 text-xs font-semibold">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span>Monthly Growth Intake (Leads Added)</span>
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(79, 70, 229)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="rgb(79, 70, 229)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(15, 21, 33)',
                    borderColor: 'rgb(31, 41, 55)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="rgb(79, 70, 229)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#indigoGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conversion Rate Card & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion rate card */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2">Performance Targets</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">Aggregate closed won conversions progress against monthly goals</p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-semibold text-gray-700 dark:text-slate-350">
                <span>Monthly Conversion Rate Target (25%)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{conversionRate} achieved</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-slate-850 rounded-full overflow-hidden border border-gray-100/10">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(parseFloat(conversionRate) * 4, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-slate-850">
              <div className="p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-gray-100 dark:border-slate-800">
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold tracking-wider">Average Deal Lifecycle</p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">14 Days</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-gray-100 dark:border-slate-800">
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold tracking-wider">Sales Pipeline Quality</p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">Excellent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2">Recent Audit Logs</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">Chronological transaction logs inside the sales pipelines</p>
          
          <div className="relative border-l border-gray-100 dark:border-slate-800 pl-4 ml-2.5 space-y-4 max-h-48 overflow-y-auto">
            {recentLeads.map((lead, idx) => (
              <div key={lead.id} className="relative">
                <span className="absolute -left-[22.5px] top-1 flex h-4.5 w-4.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 items-center justify-center">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    lead.status === 'Converted' ? 'bg-emerald-500' :
                    lead.status === 'Qualified' ? 'bg-indigo-500' :
                    lead.status === 'Lost' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                </span>
                
                <div className="text-xs text-gray-700 dark:text-slate-300">
                  <span className="font-bold text-gray-900 dark:text-white">{lead.name}</span>{' '}
                  from <span className="font-semibold">{lead.company}</span> was updated to status{' '}
                  <span className="font-bold">{lead.status}</span>.
                  <div className="text-[9px] text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {idx === 0 ? 'Just now' : `${idx * 2} hours ago`}
                  </div>
                </div>
              </div>
            ))}

            {recentLeads.length === 0 && (
              <div className="py-4 text-center text-xs text-gray-400">
                No pipeline activity to log.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
