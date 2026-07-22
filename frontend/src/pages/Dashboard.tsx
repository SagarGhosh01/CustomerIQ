import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 dark:bg-slate-900 rounded w-64 animate-pulse" />
          <div className="h-10 bg-slate-200 dark:bg-slate-900 rounded w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-250 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-250 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse lg:col-span-2" />
          <div className="h-80 bg-slate-250 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <AlertTriangle className="text-amber-500 mb-4 animate-bounce" size={48} />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Failed to Load Dashboard</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4 transition-colors">{error || 'Unknown error occurred.'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg shadow-lg shadow-brand-500/10 transition-all"
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

  const CHURN_COLORS = {
    Low: '#10b981',
    Medium: '#eab308',
    High: '#f43f5e'
  };

  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.total_revenue);

  // Dynamic Chart Theme configs
  const chartGridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const chartAxisColor = theme === 'dark' ? '#64748b' : '#94a3b8';
  const chartTooltipStyle = theme === 'dark' 
    ? { backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: 8 } 
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
  const chartTooltipItemColor = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const chartTooltipLabelColor = theme === 'dark' ? '#38a9f8' : '#026fc7';

  return (
    <div className="space-y-6">
      {/* Top Info Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-850/50 transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors">Platform Summary</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 transition-colors">Real-time analytical insights and machine learning outputs</p>
        </div>
        <div className="flex items-center self-start sm:self-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
          <TrendingUp className="text-brand-500" size={14} />
          <span>Active Period: Live Demo</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 animate-slide-up">
        {/* Total Customers */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden card-gradient-blue shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider transition-colors">Total Customers</span>
            <Users className="text-brand-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{data.total_customers}</span>
            <div className="text-[10px] text-brand-600 dark:text-brand-400 mt-1 font-semibold transition-colors">
              <span>+100% initial seed</span>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden card-gradient-emerald shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider transition-colors">Active Base</span>
            <UserCheck className="text-emerald-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{data.active_customers}</span>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold transition-colors">
              <span>{Math.round((data.active_customers / data.total_customers) * 100)}% of total</span>
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden card-gradient-purple shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider transition-colors">New Signups</span>
            <Users className="text-violet-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{data.new_customers}</span>
            <div className="text-[10px] text-violet-600 dark:text-violet-400 mt-1 font-semibold transition-colors">
              <span>Last 180 days</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden card-gradient-blue sm:col-span-2 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider transition-colors">Total Sales Revenue</span>
            <DollarSign className="text-brand-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{formattedRevenue}</span>
            <div className="text-[10px] text-brand-650 dark:text-brand-400 mt-1 font-semibold transition-colors">
              <span>Accumulated overall gross sales</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden card-gradient-rose shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider transition-colors">Avg Order Value</span>
            <ShoppingBag className="text-rose-500" size={18} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">${data.avg_order_value}</span>
            <div className="text-[10px] text-rose-600 dark:text-rose-450 mt-1 font-semibold transition-colors">
              <span>Per transaction value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up animation-delay-100">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="mb-4">
            <h3 className="text-md font-bold text-slate-900 dark:text-white transition-colors">Revenue Growth Trends</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 transition-colors">Monthly gross revenue stream</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartAxisColor} style={{ fontSize: 11 }} />
                <YAxis stroke={chartAxisColor} style={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  itemStyle={{ color: chartTooltipItemColor }}
                  labelStyle={{ fontWeight: 'bold', color: chartTooltipLabelColor }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0e8de9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segmentation Pie Chart */}
        <div className="glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-md font-bold text-slate-900 dark:text-white transition-colors">Customer Segments</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 transition-colors">RFM K-Means clusters distribution</p>
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
                  contentStyle={chartTooltipStyle}
                  itemStyle={{ color: chartTooltipItemColor }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute flex flex-col items-center">
              <span className="text-slate-500 dark:text-slate-450 text-[10px] uppercase font-bold transition-colors">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white transition-colors">{data.total_customers}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {data.segments.map((item, idx) => {
              const name = item.segment as keyof typeof COLORS;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[name] }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-750 dark:text-slate-300 truncate transition-colors">{item.segment} ({item.count})</span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 transition-colors">Avg CLV: ${Math.round(item.avg_clv)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up animation-delay-200">
        {/* Category Sales Bar Chart */}
        <div className="glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-md font-bold text-slate-900 dark:text-white transition-colors">Sales by Category</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 transition-colors">Top performing product lines</p>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_sales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="category" stroke={chartAxisColor} style={{ fontSize: 10 }} />
                <YAxis stroke={chartAxisColor} style={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={{ color: chartTooltipItemColor }}
                  labelStyle={{ fontWeight: 'bold', color: chartTooltipLabelColor }}
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
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="mb-4">
            <h3 className="text-md font-bold text-slate-900 dark:text-white transition-colors">Top High-Value Customers</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 transition-colors">Ranked by total historical purchase volume</p>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 font-bold text-xs uppercase transition-colors">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">Total Spent</th>
                  <th className="pb-3 text-center">Churn Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 transition-colors">
                {data.top_customers.map((c) => (
                  <tr key={c.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white transition-colors">{c.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-450 transition-colors">{c.email}</span>
                    </td>
                    <td className="py-3.5 text-center font-semibold text-slate-900 dark:text-white transition-colors">{c.orders_count}</td>
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white transition-colors">${c.total_spent.toFixed(2)}</td>
                    <td className="py-3.5 text-center">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border transition-colors"
                        style={{ 
                          color: CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS],
                          borderColor: `${CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS]}30`,
                          backgroundColor: `${CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS]}15` 
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
