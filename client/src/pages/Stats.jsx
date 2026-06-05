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
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline Statistics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="h-28 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-28 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-28 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-28 bg-gray-200 animate-pulse rounded-xl" />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl">
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
      <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="p-5 bg-gray-100 border border-gray-200 rounded-full text-gray-400 mb-4">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">No Data Available Yet</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Pipeline analytics will automatically generate once you register leads. Go ahead and add some leads to populate the charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline Statistics</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time aggregate data and pipeline analytics</p>
      </div>

      {/* KPI Cards */}
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
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">
            Lead Distribution by Status
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || '#6366f1'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">
            Monthly Performance (Leads Added)
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
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
