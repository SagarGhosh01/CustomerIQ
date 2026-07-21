import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  Users, DollarSign, ShoppingBag, Star, 
  ArrowUpRight, ShieldCheck, UserCheck, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

interface DashboardData {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  total_revenue: number;
  avg_order_value: number;
  avg_review_rating: number;
  revenue_trend: Array<{ date: string; revenue: number }>;
  segments: Array<{ segment: string; count: number; avg_clv: number }>;
  churn_distribution: Array<{ risk: string; count: number }>;
  category_sales: Array<{ category: string; revenue: number; quantity: number }>;
  top_customers: Array<{
    id: number;
    name: string;
    email: string;
    total_spent: number;
    orders_count: number;
    churn_risk: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        } else {
          setError('Failed to fetch dashboard metrics.');
        }
      } catch (e) {
        setError('Error connecting to backend services.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-900 rounded w-64 animate-pulse" />
          <div className="h-10 bg-slate-900 rounded w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900 rounded-xl border border-slate-800 animate-pulse lg:col-span-2" />
          <div className="h-80 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="text-amber-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h3>
        <p className="text-slate-400 mb-4">{error || 'Unknown error occurred.'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // Color mappings
  const COLORS = {
    VIP: '#0e8de9',      // Blue
    Regular: '#10b981',  // Emerald
    New: '#8b5cf6',      // Purple
    Inactive: '#f43f5e'  // Rose
  };
  const SEGMENT_COLORS = data.segments.map(s => {
    const name = s.segment as keyof typeof COLORS;
    return COLORS[name] || '#64748b';
  });

  const CHURN_COLORS = {
    Low: '#10b981',
    Medium: '#eab308',
    High: '#f43f5e'
  };

  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.total_revenue);

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time analytical insights and machine learning outputs</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 px-4 py-2 rounded-lg text-sm text-slate-300">
          <TrendingUp className="text-brand-500" size={16} />
          <span>Active Period: Live Demo</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {/* Total Customers */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden card-gradient-blue">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <Users className="text-brand-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{data.total_customers}</span>
            <div className="text-xs text-brand-400 mt-1 flex items-center gap-1">
              <span>+100% initial seed</span>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden card-gradient-emerald">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Base</span>
            <UserCheck className="text-emerald-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{data.active_customers}</span>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>{Math.round((data.active_customers / data.total_customers) * 100)}% of total</span>
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden card-gradient-purple">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">New Signups</span>
            <Users className="text-violet-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{data.new_customers}</span>
            <div className="text-xs text-violet-400 mt-1">
              <span>Last 180 days</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden card-gradient-blue lg:col-span-2">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
            <DollarSign className="text-brand-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{formattedRevenue}</span>
            <div className="text-xs text-brand-400 mt-1">
              <span>Accumulated overall gross sales</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 relative overflow-hidden card-gradient-rose">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <ShoppingBag className="text-rose-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">${data.avg_order_value}</span>
            <div className="text-xs text-rose-400 mt-1">
              <span>Per transaction value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Growth Trends</h3>
              <p className="text-slate-400 text-xs mt-0.5">Monthly gross revenue stream</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e8de9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0e8de9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bae2fd', borderRadius: 8 }}
                  itemStyle={{ color: '#000000' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0e8de9' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0e8de9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segmentation Pie Chart */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Customer Segments</h3>
            <p className="text-slate-400 text-xs mt-0.5">RFM K-Means clusters distribution</p>
          </div>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="segment"
                >
                  {data.segments.map((entry, index) => {
                    const name = entry.segment as keyof typeof COLORS;
                    return <Cell key={`cell-${index}`} fill={COLORS[name] || '#64748b'} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bae2fd', borderRadius: 8 }}
                  itemStyle={{ color: '#000000' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase font-semibold">Total</span>
              <span className="text-2xl font-bold text-white">{data.total_customers}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.segments.map((item, idx) => {
              const name = item.segment as keyof typeof COLORS;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[name] }} />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-350">{item.segment} ({item.count})</span>
                    <span className="text-[10px] text-slate-500">Avg CLV: ${item.avg_clv}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Sales Bar Chart */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Sales by Category</h3>
            <p className="text-slate-400 text-xs mt-0.5">Top performing product lines</p>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_sales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" style={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bae2fd', borderRadius: 8 }}
                  itemStyle={{ color: '#000000' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0e8de9' }}
                  formatter={(val: any) => [`$${val}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {data.category_sales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0e8de9' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Top High-Value Customers</h3>
              <p className="text-slate-400 text-xs mt-0.5">Ranked by total historical purchase volume</p>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">Total Spent</th>
                  <th className="pb-3 text-center">Churn Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {data.top_customers.map((c) => (
                  <tr key={c.id} className="text-slate-300 hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 flex flex-col">
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-xs text-slate-500">{c.email}</span>
                    </td>
                    <td className="py-3.5 text-center font-medium">{c.orders_count}</td>
                    <td className="py-3.5 text-right font-semibold text-white">${c.total_spent.toFixed(2)}</td>
                    <td className="py-3.5 text-center">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{ 
                          color: CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS],
                          borderColor: `${CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS]}30`,
                          backgroundColor: `${CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS]}10` 
                        }}
                      >
                        {c.churn_risk} Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
