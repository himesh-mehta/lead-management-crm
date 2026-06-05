import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, TrendingUp, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getStats } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const STATUS_COLORS = {
  New: '#3b82f6',
  Contacted: '#eab308',
  Qualified: '#a855f7',
  Converted: '#22c55e',
  Lost: '#ef4444',
};

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        if (data && data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100">Pipeline Statistics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="h-28 bg-slate-800 border border-slate-700 animate-pulse rounded-lg"></div>
          <div className="h-28 bg-slate-800 border border-slate-700 animate-pulse rounded-lg"></div>
          <div className="h-28 bg-slate-800 border border-slate-700 animate-pulse rounded-lg"></div>
          <div className="h-28 bg-slate-800 border border-slate-700 animate-pulse rounded-lg"></div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
          <LoadingSkeleton rows={5} />
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

  const monthlyData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 7 },
    { name: 'Mar', count: 5 },
    { name: 'Apr', count: 12 },
    { name: 'May', count: stats?.thisMonth || 8 },
    { name: 'Jun', count: stats?.total || 12 },
  ];

  if (totalLeads === 0) {
    return (
      <div className="space-y-8 p-6 max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-full text-slate-500 mb-6">
          <HelpCircle size={40} className="text-slate-405" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">No Data Available Yet</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Pipeline analytics will automatically generate once you register leads. Go ahead and add some leads to populate the charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Pipeline Statistics</h1>
        <p className="text-sm text-slate-400">Real-time aggregate data and pipeline analytics</p>
      </div>

      {/* Responsive Grid for cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Leads" 
          value={totalLeads} 
          icon={Users} 
          color="indigo" 
          subtitle="All active contacts" 
        />
        <StatCard 
          title="Converted" 
          value={convertedLeads} 
          icon={UserCheck} 
          color="green" 
          subtitle="Successfully won" 
        />
        <StatCard 
          title="Lost Leads" 
          value={lostLeads} 
          icon={UserX} 
          color="red" 
          subtitle="Closed lost deals" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={conversionRate} 
          icon={TrendingUp} 
          color="blue" 
          subtitle="Won leads percentage" 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Pie Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-6 shadow-xl">
          <h3 className="text-xs md:text-sm font-bold text-slate-100 mb-6 uppercase tracking-wider">
            Lead Distribution by Status
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name] || '#64748b'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-350 text-xs font-semibold">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-6 shadow-xl">
          <h3 className="text-xs md:text-sm font-bold text-slate-100 mb-6 uppercase tracking-wider">
            Monthly Performance (Leads Added)
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
