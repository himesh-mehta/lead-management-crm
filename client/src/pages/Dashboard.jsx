import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStats, getLeads } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';

/* ── Greeting helper ──────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 👋';
  if (h < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
};

/* ── Skeleton loader ──────────────────────────────────── */
const Skeleton = () => (
  <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }} className="animate-pulse space-y-6">
      <div style={{ height: 36, background: '#E2E8F0', borderRadius: 8, width: '25%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 120, background: '#E2E8F0', borderRadius: 12 }} />
        ))}
      </div>
      <div style={{ height: 80, background: '#E2E8F0', borderRadius: 12 }} />
      <div style={{ height: 320, background: '#E2E8F0', borderRadius: 12 }} />
    </div>
  </div>
);

/* ── Main component ───────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]           = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, leadsData] = await Promise.all([
          getStats(),
          getLeads({ page: 1, limit: 5, sort: 'created_at' }),
        ]);
        setStats(statsData.stats);
        setRecentLeads(leadsData.leads || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Skeleton />;

  const total            = stats?.total || 0;
  const converted        = stats?.byStatus?.Converted || 0;
  const active           = Math.max(0, total - converted - (stats?.byStatus?.Lost || 0));
  const conversionRate   = stats?.conversionRate || '0.0%';
  const conversionPct    = Math.min(parseFloat(conversionRate) || 0, 100);

  /* Shared button style */
  const btnStyle = {
    background: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(79,70,229,0.3)',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: 32 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 28,
          }}
        >
          <div>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4, margin: '0 0 4px' }}>
              {getGreeting()}
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Pipeline Overview
            </h1>
          </div>

          <button
            style={btnStyle}
            onClick={() => navigate('/leads/add')}
            onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
            onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
          >
            <Plus size={16} />
            Create New Lead
          </button>
        </div>

        {/* ── Stat cards grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            marginBottom: 28,
          }}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard title="Total Leads"      value={total}           icon={Users}     color="indigo" subtitle="All database contacts" />
          <StatCard title="Converted Leads"  value={converted}       icon={UserCheck} color="green"  subtitle="Deals closed won"       />
          <StatCard title="Active Leads"     value={active}          icon={Clock}     color="yellow" subtitle="Leads in progress"       />
          <StatCard title="Conversion Rate"  value={conversionRate}  icon={TrendingUp} color="purple" subtitle="Overall success rate"  />
        </div>

        {/* ── Conversion Progress ── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginBottom: 20,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
              Conversion Progress
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#4F46E5' }}>
              {conversionRate}
            </span>
          </div>

          {/* Bar */}
          <div
            style={{
              background: '#F1F5F9',
              borderRadius: 100,
              height: 8,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                borderRadius: 100,
                height: 8,
                width: `${conversionPct}%`,
                transition: 'width 0.5s ease',
              }}
            />
          </div>

          {/* Label */}
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8, marginBottom: 0 }}>
            {converted} of {total} leads converted
          </p>
        </div>

        {/* ── Recent Leads Table ── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Table header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
              Recently Added Leads
            </span>
            <button
              onClick={() => navigate('/leads')}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#4F46E5',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#4338CA')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4F46E5')}
            >
              View All Leads
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Table */}
          {recentLeads.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#94A3B8',
                fontSize: 14,
              }}
            >
              No leads registered yet. Start by creating a lead.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {['Name', 'Company', 'Email', 'Status', 'Created At'].map(col => (
                      <th
                        key={col}
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/edit/${lead.id}`)}
                      style={{
                        borderBottom: idx < recentLeads.length - 1 ? '1px solid #F8FAFC' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name + avatar */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#EEF2FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#4F46E5',
                            }}
                          >
                            {lead.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748B' }}>{lead.company}</td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748B' }}>{lead.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <StatusBadge status={lead.status} />
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 13, color: '#94A3B8' }}>
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
