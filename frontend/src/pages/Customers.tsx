import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, 
  Plus, Edit, Trash, Upload, Loader2, Sparkles, User, Calendar, 
  MapPin, AlertTriangle, ShieldCheck, Mail, ShoppingBag, FileText, CheckCircle,
  Star 
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  city: string;
  join_date: string;
  segment: string;
  churn_probability: number;
  churn_risk: string;
  predicted_clv: number;
  avg_sentiment: number;
}

interface Order {
  id: number;
  product: string;
  category: string;
  price: number;
  quantity: number;
  date: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  sentiment_score: number;
  sentiment_label: string;
  date: string;
}

interface CustomerDetails extends Customer {
  orders: Order[];
  reviews: Review[];
}

export const Customers: React.FC = () => {
  const { token, isAdmin } = useAuth();
  
  // Lists & Pagination
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('');
  const [churnRisk, setChurnRisk] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Details Panel State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  // Modals & Forms State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAge, setFormAge] = useState(30);
  const [formGender, setFormGender] = useState('Male');
  const [formCity, setFormCity] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch list of customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/customers/?skip=${skip}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (segment) url += `&segment=${encodeURIComponent(segment)}`;
      if (churnRisk) url += `&churn_risk=${encodeURIComponent(churnRisk)}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.items);
        setTotal(data.total);
      } else {
        setError('Failed to fetch customers list.');
      }
    } catch (e) {
      setError('Cannot connect to backend services.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single customer detail
  const fetchCustomerDetails = async (id: number) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
        
        // Fetch recommendations & simulation outputs
        const recResponse = await fetch(`${API_BASE_URL}/api/analytics/simulate?age=${data.age}&recency=${data.churn_risk === 'High' ? 200 : 30}&frequency=${data.orders.length}&monetary=${data.orders.reduce((acc: number, o: any) => acc + (o.price * o.quantity), 0)}&avg_rating=${data.avg_sentiment >= 0.5 ? 4.5 : 3.0}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (recResponse.ok) {
          const recData = await recResponse.json();
          setRecommendations(recData.recommendations);
        }
      }
    } catch (e) {
      console.error('Error fetching details:', e);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [skip, segment, churnRisk, sortBy, sortOrder, token]);

  useEffect(() => {
    if (selectedCustomerId !== null) {
      fetchCustomerDetails(selectedCustomerId);
    } else {
      setDetails(null);
    }
  }, [selectedCustomerId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchCustomers();
  };

  // CSV file upload handler
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        triggerToast(data.detail || 'Customers imported successfully!');
        fetchCustomers();
      } else {
        triggerToast(data.detail || 'Failed to import CSV.', 'error');
      }
    } catch (err) {
      triggerToast('Network error during file upload.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add customer submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          age: formAge,
          gender: formGender,
          city: formCity,
          join_date: new Date().toISOString().split('T')[0]
        })
      });
      if (response.ok) {
        setShowAddModal(false);
        triggerToast('Customer added successfully!');
        fetchCustomers();
        // Clear
        setFormName('');
        setFormEmail('');
        setFormCity('');
      } else {
        const errData = await response.json();
        setFormError(errData.detail || 'Validation error. Please verify input data.');
      }
    } catch (e) {
      setFormError('Failed to add customer. Server offline.');
    }
  };

  // Edit customer open
  const handleEditOpen = (c: Customer) => {
    setEditCustomer(c);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormAge(c.age);
    setFormGender(c.gender);
    setFormCity(c.city);
    setShowEditModal(true);
  };

  // Edit customer submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${editCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          age: formAge,
          gender: formGender,
          city: formCity
        })
      });
      if (response.ok) {
        setShowEditModal(false);
        triggerToast('Customer profile updated!');
        fetchCustomers();
      } else {
        const errData = await response.json();
        setFormError(errData.detail || 'Failed to update customer details.');
      }
    } catch (e) {
      setFormError('Error communicating with server.');
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer? This will permanently remove all order and review history.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        triggerToast('Customer deleted.');
        if (selectedCustomerId === id) setSelectedCustomerId(null);
        fetchCustomers();
      } else {
        triggerToast('Failed to delete customer.', 'error');
      }
    } catch (e) {
      triggerToast('Error connecting to backend.', 'error');
    }
  };

  // Helpers
  const CHURN_COLORS = { Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25', High: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };
  const SEGMENT_COLORS = { VIP: 'text-brand-400 bg-brand-500/10 border-brand-500/25', Regular: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', New: 'text-violet-400 bg-violet-500/10 border-violet-500/25', Inactive: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };

  return (
    <div className="p-6 relative">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 border px-4 py-3 rounded-lg shadow-xl animate-bounce ${toast.type === 'success' ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-rose-500/30 text-rose-400'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Database</h1>
          <p className="text-slate-400 mt-1">Manage profiles, analyze transactions, and examine ML tags</p>
        </div>
        
        {/* Admin actions */}
        {isAdmin && (
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCSVUpload} 
              accept=".csv" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2.5 rounded-lg text-sm text-slate-300 font-semibold transition-all"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              Import CSV
            </button>
            <button 
              onClick={() => { setFormError(null); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 px-4 py-2.5 rounded-lg text-sm text-white font-semibold shadow-lg shadow-brand-500/15 hover:shadow-brand-500/30 transition-all border border-brand-400/20"
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>
        )}
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="glass-panel border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, city..."
            className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        </div>

        {/* Segment Filter */}
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Segments</option>
          <option value="VIP">VIP Segment</option>
          <option value="Regular">Regular Segment</option>
          <option value="New">New Segment</option>
          <option value="Inactive">Inactive Segment</option>
        </select>

        {/* Churn Risk Filter */}
        <select
          value={churnRisk}
          onChange={(e) => setChurnRisk(e.target.value)}
          className="bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Churn Risks</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-white py-2 rounded-lg text-sm font-semibold transition-all border border-slate-700/50"
        >
          <SlidersHorizontal size={14} />
          Apply Filters
        </button>
      </form>

      {/* Main Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedCustomerId !== null ? 'lg:col-span-2' : 'lg:col-span-3'} glass-panel border border-slate-800 rounded-xl overflow-hidden shadow-xl`}>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 font-semibold text-xs uppercase">
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Segment</th>
                  <th className="px-6 py-4 text-center">Churn Risk</th>
                  <th className="px-6 py-4 text-right">CLV Est.</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4.5"><div className="h-4 bg-slate-900 rounded w-48" /></td>
                      <td className="px-6 py-4.5"><div className="h-4 bg-slate-900 rounded w-24" /></td>
                      <td className="px-6 py-4.5"><div className="h-6 bg-slate-900 rounded w-16" /></td>
                      <td className="px-6 py-4.5"><div className="h-6 bg-slate-900 rounded w-20 mx-auto" /></td>
                      <td className="px-6 py-4.5"><div className="h-4 bg-slate-900 rounded w-16 ml-auto" /></td>
                      {isAdmin && <td className="px-6 py-4.5" />}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No customer records found matching search filters.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedCustomerId(selectedCustomerId === c.id ? null : c.id)}
                      className={`text-slate-350 hover:bg-slate-900/40 transition-colors cursor-pointer ${selectedCustomerId === c.id ? 'bg-slate-900/60' : ''}`}
                    >
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-brand-500">
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className="text-xs text-slate-500">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-medium text-slate-300">{c.city}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${SEGMENT_COLORS[c.segment as keyof typeof SEGMENT_COLORS] || ''}`}>
                          {c.segment}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CHURN_COLORS[c.churn_risk as keyof typeof CHURN_COLORS] || ''}`}>
                          {c.churn_risk} ({Math.round(c.churn_probability * 100)}%)
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-white">${c.predicted_clv.toFixed(2)}</td>
                      {isAdmin && (
                        <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEditOpen(c)}
                              className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCustomer(c.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="border-t border-slate-800 px-6 py-3.5 bg-slate-900/20 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-300">{customers.length}</span> of <span className="font-semibold text-slate-300">{total}</span> records
            </span>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - limit))}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 p-1.5 rounded transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={skip + limit >= total}
                onClick={() => setSkip(skip + limit)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 p-1.5 rounded transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Side Details Panel */}
        {selectedCustomerId !== null && (
          <div className="glass-panel border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-y-auto max-h-[75vh]">
            <button 
              onClick={() => setSelectedCustomerId(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
            >
              <X size={18} />
            </button>

            {detailsLoading || !details ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <Loader2 className="animate-spin text-brand-500" size={24} />
                <span className="text-xs text-slate-500">Calculating AI Insights...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center font-bold text-lg text-brand-400">
                    {details.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-snug">{details.name}</h2>
                    <span className="text-xs text-slate-400">Customer ID: #{details.id}</span>
                  </div>
                </div>

                {/* Demographics Card */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-850 px-3 py-2 rounded-lg">
                    <Mail size={14} className="text-slate-500" />
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] text-slate-500">Email</span>
                      <span className="text-slate-300 font-medium truncate">{details.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-850 px-3 py-2 rounded-lg">
                    <MapPin size={14} className="text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500">Location</span>
                      <span className="text-slate-300 font-medium">{details.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-850 px-3 py-2 rounded-lg">
                    <User size={14} className="text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500">Age / Gender</span>
                      <span className="text-slate-300 font-medium">{details.age}y / {details.gender}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-850 px-3 py-2 rounded-lg">
                    <Calendar size={14} className="text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500">Member Since</span>
                      <span className="text-slate-300 font-medium">{details.join_date}</span>
                    </div>
                  </div>
                </div>

                {/* AI Predictions */}
                <div className="bg-slate-900/35 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-brand-400 font-bold uppercase tracking-wider">
                    <Sparkles size={14} />
                    AI Intelligence Insights
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Lifetime Value (CLV)</span>
                      <span className="text-xl font-bold text-white mt-0.5">${details.predicted_clv.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Churn Risk Badge</span>
                      <span className="mt-1"><span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${CHURN_COLORS[details.churn_risk as keyof typeof CHURN_COLORS] || ''}`}>{details.churn_risk} Risk</span></span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-2">Recommended Next Products</span>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.map((prod, idx) => (
                        <span key={idx} className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs px-2.5 py-1 rounded-md font-medium">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-slate-400" />
                      Order History ({details.orders.length})
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-lg text-xs">
                    {details.orders.length === 0 ? (
                      <div className="p-4 text-center text-slate-600">No orders recorded.</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                            <th className="px-3 py-2">Item</th>
                            <th className="px-3 py-2 text-center">Qty</th>
                            <th className="px-3 py-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {details.orders.map(o => (
                            <tr key={o.id} className="text-slate-350 hover:bg-slate-900/20">
                              <td className="px-3 py-2 flex flex-col">
                                <span className="font-semibold text-white">{o.product}</span>
                                <span className="text-[10px] text-slate-500">{o.date}</span>
                              </td>
                              <td className="px-3 py-2 text-center">{o.quantity}</td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-200">${(o.price * o.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Feedback Reviews */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" />
                    Review Feedback ({details.reviews.length})
                  </span>
                  <div className="space-y-3">
                    {details.reviews.length === 0 ? (
                      <div className="p-4 text-center text-slate-600 border border-slate-800 rounded-lg text-xs">No feedback commentaries.</div>
                    ) : (
                      details.reviews.map(r => (
                        <div key={r.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/20 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
                              ))}
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${r.sentiment_label === 'Positive' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : r.sentiment_label === 'Negative' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 'text-slate-400 border-slate-700 bg-slate-800/10'}`}>
                              {r.sentiment_label}
                            </span>
                          </div>
                          <p className="text-slate-300 italic font-medium">"{r.comment}"</p>
                          <div className="text-[10px] text-slate-500 text-right">{r.date}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CRUD Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-350"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Add New Customer</h2>
            <p className="text-slate-400 text-xs mb-5">Register a new client profile in the database</p>
            
            {formError && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs mb-4">{formError}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input 
                  type="text" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. John Doe"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input 
                  type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="e.g. john@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Age</label>
                  <input 
                    type="number" required value={formAge} onChange={e => setFormAge(parseInt(e.target.value))} min={18} max={100}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gender</label>
                  <select 
                    value={formGender} onChange={e => setFormGender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">City</label>
                <input 
                  type="text" required value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="e.g. New York"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-850 text-slate-350 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg font-semibold transition-all shadow-lg shadow-brand-500/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Edit Customer Modal */}
      {showEditModal && editCustomer && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-350"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Edit Customer Profile</h2>
            <p className="text-slate-400 text-xs mb-5">Update details for customer #{editCustomer.id}</p>
            
            {formError && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs mb-4">{formError}</div>}
            
            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input 
                  type="text" required value={formName} onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input 
                  type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Age</label>
                  <input 
                    type="number" required value={formAge} onChange={e => setFormAge(parseInt(e.target.value))} min={18} max={100}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gender</label>
                  <select 
                    value={formGender} onChange={e => setFormGender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">City</label>
                <input 
                  type="text" required value={formCity} onChange={e => setFormCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-850 text-slate-350 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg font-semibold transition-all shadow-lg shadow-brand-500/20"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
