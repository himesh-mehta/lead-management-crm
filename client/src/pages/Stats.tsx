import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, UserX, TrendingUp, HelpCircle, 
  Sparkles, Zap, Globe, 
  DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  Building2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
  LineChart, Line
} from 'recharts';
import { useStatsQuery } from '../hooks/useLeads';
import { formatDate } from '../utils/helpers';

const STATUS_COLORS = {
  New: '#ff7a59',       // HubSpot Orange
  Contacted: '#3b82f6', // Indigo/Blue
  Qualified: '#a855f7', // Purple
  Converted: '#10b981', // Green/Emerald
  Lost: '#ef4444',       // Red/Rose
};

const SOURCE_COLORS = [
  '#ff7a59',  // Brand Orange
  '#3b82f6',  // Blue
  '#10b981',  // Green
  '#a855f7',  // Purple
  '#f59e0b',  // Amber
  '#ef4444',  // Red
];

interface KPIValProps {
  title: string;
  value: string | number;
  growth: number;
  icon: React.ComponentType<any>;
  color: 'orange' | 'green' | 'red' | 'blue';
  sparklineData: number[];
}

const KPICard: React.FC<KPIValProps> = ({ title, value, growth, icon: Icon, color, sparklineData }) => {
  const isPositive = growth >= 0;
  const growthColor = isPositive ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20' : 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20';
  const iconColorMap = {
    orange: 'text-[#ff7a59] bg-orange-50 dark:text-[#ff8d6f] dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30',
    green: 'text-emerald-650 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
    red: 'text-rose-650 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30',
    blue: 'text-blue-650 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30',
  };

  const sparkChartData = sparklineData.map((v, i) => ({ index: i, value: v }));
  const sparkStroke = color === 'orange' ? '#ff7a59' : color === 'green' ? 'rgb(16, 185, 129)' : color === 'red' ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)';

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-4 shadow-soft hover:shadow-md transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon size={14} />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <div>
          <span className="text-xl font-bold text-gray-950 dark:text-white tracking-tight">{value}</span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${growthColor}`}>
              {isPositive ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
              {Math.abs(growth)}%
            </span>
            <span className="text-[9px] text-gray-400 font-medium">vs prev period</span>
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="h-8 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkChartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sparkStroke} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={sparkStroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={sparkStroke} 
                fill={`url(#grad-${color})`} 
                strokeWidth={1.5} 
                dot={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // Fetch stats via React Query
  const { data: statsRes, isLoading } = useStatsQuery({
    timeframe,
    startDate: timeframe === 'custom' ? startDate : undefined,
    endDate: timeframe === 'custom' ? endDate : undefined
  });

  const stats = statsRes?.stats;

  const handleExportPDF = async () => {
    const element = document.getElementById('analytics-report-content');
    if (!element) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      
      // Margins and available page height
      const topMargin = 22;
      const availableHeight = pageHeight - topMargin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Page 1 Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 122, 89); // HubSpot Orange theme color
      pdf.text('LeadBridge', 10, 12);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // Slate-500
      pdf.text(`Pipeline Analytics Report • Generated: ${new Date().toLocaleString()}`, 10, 17);
      
      pdf.setDrawColor(226, 232, 240); // Slate-200 border line
      pdf.setLineWidth(0.4);
      pdf.line(10, 20, 200, 20);

      let heightLeft = imgHeight;
      let position = topMargin;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= availableHeight;

      while (heightLeft >= 0) {
        position = (heightLeft - imgHeight) + topMargin;
        pdf.addPage();
        
        // Subsequent Page Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 122, 89); // HubSpot Orange theme color
        pdf.text('LeadBridge', 10, 10);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text('Pipeline Analytics Report', 200, 10, { align: 'right' });
        
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.4);
        pdf.line(10, 12, 200, 12);
        
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= availableHeight;
      }

      pdf.save(`Pipeline-Analytics-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-[1400px] mx-auto animate-pulse pb-24">
        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-14 bg-gray-100 dark:bg-slate-900 rounded-xl" />
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

  // Handle empty state gracefully
  const totalLeads = stats?.kpis?.total?.value || 0;
  if (!stats || totalLeads === 0) {
    return (
      <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        {/* Filter bar so users can toggle back to other periods if current timeframe has 0 records */}
        <div className="w-full max-w-xl mb-6">
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-150 dark:border-slate-800 p-2 rounded-2xl">
            {['7d', '30d', '90d', '12m', 'custom'].map((tf) => (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-[#ff7a59] text-white shadow-sm shadow-orange-500/10'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850'
                }`}
              >
                {tf === '7d' && 'Last 7 Days'}
                {tf === '30d' && 'Last 30 Days'}
                {tf === '90d' && 'Last 90 Days'}
                {tf === '12m' && 'Last 12 Months'}
                {tf === 'custom' && 'Custom Range'}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="p-5 bg-orange-50 dark:bg-orange-950/20 border border-orange-100/40 rounded-3xl text-[#ff7a59] mb-4 animate-pulse">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">No Analytics Data For Selected Period</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          There are no lead lifecycle events or active opportunities registered within this specific date range filter. Try selecting a broader timeframe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1400px] mx-auto animate-fade-in pb-24">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Pipeline Analytics
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Real-time pipeline lifecycle metrics, stage conversions, and revenue forecasts.
          </p>
        </div>
        <motion.button
          whileHover={exporting ? {} : { scale: 1.04 }}
          whileTap={exporting ? {} : { scale: 0.96 }}
          onClick={handleExportPDF}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#ff8d6f] to-[#ff7a59] hover:opacity-95 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer self-start sm:self-center"
        >
          {exporting ? 'Generating Report...' : 'Download Report (PDF)'}
        </motion.button>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-150 dark:border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {['7d', '30d', '90d', '12m', 'custom'].map((tf) => (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-[#ff7a59] text-white shadow-sm shadow-orange-500/10'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850'
              }`}
            >
              {tf === '7d' && 'Last 7 Days'}
              {tf === '30d' && 'Last 30 Days'}
              {tf === '90d' && 'Last 90 Days'}
              {tf === '12m' && 'Last 12 Months'}
              {tf === 'custom' && 'Custom Range'}
            </motion.button>
          ))}
        </div>

        {timeframe === 'custom' && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1.5 rounded-xl self-start md:self-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-xs bg-transparent focus:outline-none dark:text-white"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-xs bg-transparent focus:outline-none dark:text-white"
            />
          </div>
        )}
      </div>

      {/* KPI Stats Strip wrapper for PDF capture */}
      <div id="analytics-report-content" className="space-y-6 md:space-y-8 p-1">
        {/* KPI Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KPICard
            title="Total Opportunities"
            value={stats.kpis.total.value}
            growth={stats.kpis.total.growth}
            icon={Users}
            color="orange"
            sparklineData={stats.sparklines.opportunities}
          />
          <KPICard
            title="Closed Won"
            value={stats.kpis.won.value}
            growth={stats.kpis.won.growth}
            icon={UserCheck}
            color="green"
            sparklineData={stats.sparklines.won}
          />
          <KPICard
            title="Closed Lost"
            value={stats.kpis.lost.value}
            growth={stats.kpis.lost.growth}
            icon={UserX}
            color="red"
            sparklineData={stats.sparklines.lost}
          />
          <KPICard
            title="Conversion Rate"
            value={`${stats.kpis.conversionRate.value}%`}
            growth={stats.kpis.conversionRate.growth}
            icon={TrendingUp}
            color="blue"
            sparklineData={stats.sparklines.won}
          />
        </div>

        {/* ROW 1: Status Distribution & Growth Intake */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Status Distribution Donut */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff7a59]" />
              <span>Lead Status Distribution</span>
            </h3>
            <div className="h-64 relative flex items-center justify-center">
              {/* Glassmorphic Center Total label */}
              <div className="absolute flex flex-col items-center justify-center text-center bg-gray-55 bg-opacity-5 dark:bg-slate-950/40 backdrop-blur-xs w-24 h-24 rounded-full border border-gray-100/50 dark:border-slate-800/40 shadow-inner z-10">
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{totalLeads}</span>
                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Total Leads</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.statusDistribution.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#ff7a59'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const fillCol = payload[0].payload.fill || STATUS_COLORS[data.name as keyof typeof STATUS_COLORS] || '#ff7a59';
                        return (
                          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-50">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fillCol }} />
                              <span className="text-xs font-semibold text-slate-300">{data.name}:</span>
                              <span className="text-xs font-bold text-white">{data.value} leads ({data.percentage}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth Intake Area */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Activity size={16} className="text-[#ff7a59]" />
              <span>Monthly Growth Intake (Leads Added)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyGrowth} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7a59" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#ff7a59" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#ff7a59]" />
                              <span className="text-xs font-semibold text-slate-300">New Leads:</span>
                              <span className="text-xs font-bold text-white">{data.count} leads</span>
                            </div>
                            {data.growthMoM !== undefined && (
                              <p className="text-[10px] font-medium text-emerald-400 mt-1 pl-4.5">
                                {data.growthMoM >= 0 ? '+' : ''}{data.growthMoM}% MoM Growth
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#ff7a59"
                    strokeWidth={2.5}
                    fill="url(#growthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 2: Pipeline Funnel Performance & Lead Conversion Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Funnel Performance */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Zap size={16} className="text-[#ff7a59]" />
              <span>Pipeline Funnel Performance</span>
            </h3>
            <div className="space-y-3 mt-4">
              {stats.funnel.map((item: any, idx: number) => (
                <div key={item.stage} className="relative">
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-900/40 rounded-xl border border-gray-150 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#ff7a59] flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.stage}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.count} leads reached</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-xs font-bold text-gray-950 dark:text-gray-100">{item.conversion}%</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Conversion</p>
                      </div>
                      {idx > 0 && (
                        <div className="border-l border-gray-200 dark:border-slate-800 pl-4">
                          <p className="text-xs font-bold text-rose-500">{item.dropoff}%</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Drop-off</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < stats.funnel.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <div className="w-0.5 h-3 bg-gray-200 dark:bg-slate-800" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lead Conversion Trend */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#ff7a59]" />
              <span>Lead Conversion Trend (%)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.conversionTrend} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.05)" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#ff7a59]" />
                              <span className="text-xs font-semibold text-slate-300">Conversion Rate:</span>
                              <span className="text-xs font-bold text-white">{payload[0].value}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="#ff7a59"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, stroke: '#ff7a59', fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#ff7a59' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 3: Lead Source Distribution & Revenue Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Source Distribution (Redesigned as Horizontal Rounded Bars) */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Globe size={16} className="text-[#ff7a59]" />
              <span>Lead Source Distribution</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats.sourceDistribution}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="source" type="category" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={90} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{data.source}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-350">Leads:</span>
                              <span className="text-xs font-bold text-white">{data.count} ({data.percentage}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {stats.sourceDistribution.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Forecast */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <DollarSign size={16} className="text-[#10b981]" />
              <span>Revenue Pipeline Forecast</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.05)" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const total = payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0);
                        return (
                          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl z-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                            <div className="space-y-1.5">
                              {payload.map((entry: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-xs font-semibold text-slate-300">{entry.name}:</span>
                                  <span className="text-xs font-bold text-white">${entry.value.toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value:</span>
                                <span className="text-xs font-extrabold text-[#ff7a59]">${total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{value} Value</span>
                    )}
                  />
                  <Bar dataKey="Qualified" fill="#a855f7" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Converted" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 4: Recent Activities & Top Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Recent Pipeline Activities */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft flex flex-col h-[380px]">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[#ff7a59]" />
              <span>Recent Pipeline Activity</span>
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {stats.recentActivities.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs py-12">
                  No recent database activities logged.
                </div>
              ) : (
                stats.recentActivities.map((act: any) => (
                  <div key={act.id} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        act.action === 'Converted'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : act.action === 'Created'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                            : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {act.action[0]}
                      </div>
                      <div className="flex-1 w-0.5 bg-gray-100 dark:bg-slate-800 my-1" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{act.leadName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{formatDate(act.createdAt)}</span>
                      </div>
                      <p className="text-gray-500 dark:text-slate-400 text-[11px] mt-0.5">{act.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Companies Table */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-soft h-[380px] flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-[#ff7a59]" />
              <span>Top Performing Companies</span>
            </h3>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Company</th>
                    <th className="py-2.5 text-center">Opportunities</th>
                    <th className="py-2.5 text-center text-purple-500">Qualified</th>
                    <th className="py-2.5 text-center text-emerald-500">Won</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                  {stats.topCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-450 text-xs">
                        No companies with registered leads.
                      </td>
                    </tr>
                  ) : (
                    stats.topCompanies.map((c: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 font-bold text-gray-900 dark:text-gray-200">{c.company}</td>
                        <td className="py-3 text-center text-gray-600 dark:text-gray-400 font-semibold">{c.count}</td>
                        <td className="py-3 text-center text-purple-600 dark:text-purple-400 font-bold">{c.qualified}</td>
                        <td className="py-3 text-center text-emerald-650 dark:text-emerald-400 font-bold">{c.converted}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
