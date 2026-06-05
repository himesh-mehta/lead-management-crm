import React from 'react';
import { 
  Users, UserCheck, UserX, TrendingUp, HelpCircle, 
  BarChart3, Clock, Sparkles, Zap, Shield, Globe
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import { useStatsQuery, useLeadsQuery } from '../hooks/useLeads';
import StatCard from '../components/StatCard';

const STATUS_COLORS = {
  New: 'rgb(59, 130, 246)',       // Blue
  Contacted: 'rgb(245, 158, 11)', // Orange
  Qualified: 'rgb(139, 92, 246)', // Purple
  Converted: 'rgb(16, 185, 129)', // Green
  Lost: 'rgb(239, 68, 68)',       // Red
};

const Stats: React.FC = () => {
  // Queries
  const { data: statsRes, isLoading: statsLoading } = useStatsQuery();
  const { data: leadsRes, isLoading: leadsLoading } = useLeadsQuery({ limit: 100 });

  const loading = statsLoading || leadsLoading;

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
          <div className="h-80 bg-gray-250 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-gray-250 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = statsRes?.stats;
  const leads = leadsRes?.leads || [];
  const totalLeads = stats?.total || 0;

  if (totalLeads === 0) {
    return (
      <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150/40 rounded-3xl text-indigo-650 dark:text-indigo-400 mb-4 animate-pulse">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Analytics Data</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Lead velocities, response times, and funnel graphs will generate once leads are registered in the pipeline.
        </p>
      </div>
    );
  }

  const convertedLeads = stats?.byStatus?.Converted || 0;
  const qualifiedLeads = stats?.byStatus?.Qualified || 0;
  const lostLeads = stats?.byStatus?.Lost || 0;
  const conversionRate = stats?.conversionRate || '0.0%';

  // 1. Leads by status donut chart data
  const statusData = stats?.byStatus
    ? Object.keys(stats.byStatus).map((status) => ({
        name: status,
        value: stats.byStatus[status as keyof typeof stats.byStatus] || 0,
      }))
    : [];

  // 2. Leads monthly growth area chart data
  const monthlyData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 7 },
    { name: 'Mar', count: 5 },
    { name: 'Apr', count: 12 },
    { name: 'May', count: stats?.thisMonth || 8 },
    { name: 'Jun', count: totalLeads },
  ];

  // 3. Lead Source Performance
  const sourceMap: Record<string, number> = {
    'Web': 0,
    'Referral': 0,
    'Cold-Call': 0,
    'Social Media': 0,
    'Partner': 0
  };
  leads.forEach(lead => {
    const src = lead.source || 'Web';
    if (sourceMap[src] !== undefined) {
      sourceMap[src]++;
    } else {
      sourceMap['Web']++;
    }
  });
  const sourceData = Object.keys(sourceMap).map(src => ({
    source: src,
    count: sourceMap[src]
  }));

  // 4. Revenue Forecast (Mocked dynamically: Qualified leads worth $4,000, Converted worth $12,000)
  const activeForecast = (qualifiedLeads * 4000) + (convertedLeads * 12000);
  const forecastData = [
    { month: 'Q1 Actual', revenue: convertedLeads * 8000 },
    { month: 'Q2 Target', revenue: activeForecast * 0.7 },
    { month: 'Q3 Forecast', revenue: activeForecast },
    { month: 'Q4 Forecast', revenue: activeForecast * 1.3 },
  ];

  // Widgets details
  const widgets = {
    responseTime: '1.8 hrs',
    leadVelocity: '+24.5% MoM',
    pipelineHealth: '94% Excellent'
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in pb-24">
      {/* Title Header */}
      <div className="border-b border-gray-150 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="text-indigo-650" size={24} />
          <span>Pipeline Analytics</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Monitor acquisition velocity, lead conversion ratios, and corporate revenue forecasts
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Opportunities"
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

      {/* Primary Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Leads by Status Donut */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-md transition-all duration-300">
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
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || 'rgb(79, 70, 229)'}
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

        {/* Monthly Intake Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-md transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span>Monthly Growth Intake (Leads Added)</span>
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(79, 70, 229)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="rgb(79, 70, 229)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.12)" />
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
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="rgb(79, 70, 229)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#indigoGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Graphs: Sources & Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Source performance */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-md transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Globe size={16} className="text-indigo-500" />
            <span>Lead Source Distribution</span>
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.12)" />
                <XAxis
                  dataKey="source"
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
                  }}
                />
                <Bar dataKey="count" fill="rgb(99, 102, 241)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-md transition-all duration-300">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span>Revenue Pipeline Forecast</span>
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.12)" />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(15, 21, 33)',
                    borderColor: 'rgb(31, 41, 55)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`$${val}`, 'Projected Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Performance Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Response times */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Avg Response Time</p>
            <p className="text-xl font-bold text-gray-905 dark:text-white mt-0.5">{widgets.responseTime}</p>
          </div>
        </div>

        {/* Lead Velocity */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Lead Velocity Rate</p>
            <p className="text-xl font-bold text-gray-905 dark:text-white mt-0.5">{widgets.leadVelocity}</p>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pipeline Health Score</p>
            <p className="text-xl font-bold text-gray-905 dark:text-white mt-0.5">{widgets.pipelineHealth}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
