import React, { useState } from 'react';
import { 
  Megaphone, Users, Award, Percent, DollarSign, ArrowUpRight, 
  Layers, CheckCircle, Mail, Sparkles, Sliders
} from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<'VIP' | 'Regular' | 'New' | 'Inactive'>('VIP');
  const [discountVal, setDiscountVal] = useState<number>(20);
  const [conversionRate, setConversionRate] = useState<number>(15); // slider 5% to 50%
  const [couponCode, setCouponCode] = useState<string>('VIPLOYAL20');
  const [campaignName, setCampaignName] = useState<string>('Summer VIP Appreciation Campaign');
  const [campaignsList, setCampaignsList] = useState<any[]>([
    {
      id: 1,
      name: 'Q2 Win-Back Campaign',
      segment: 'Inactive',
      discount: '15% Off',
      roi: '$1,840.00',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Spring Electronics Bundle Offer',
      segment: 'VIP',
      discount: 'Points Multiplier',
      roi: '$4,250.00',
      status: 'Completed'
    }
  ]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Simple dynamic calculations based on selected segment
  const segmentStats = {
    VIP: { size: 28, totalClv: 48500, avgSpent: 1730 },
    Regular: { size: 64, totalClv: 62000, avgSpent: 968 },
    New: { size: 18, totalClv: 22000, avgSpent: 1222 },
    Inactive: { size: 14, totalClv: 12800, avgSpent: 914 }
  };

  const currentStats = segmentStats[selectedSegment];
  const totalAudienceClv = currentStats.totalClv;
  const projectedRevenueRetained = Math.round(totalAudienceClv * (conversionRate / 100));
  const campaignCost = Math.round(projectedRevenueRetained * (discountVal / 100));
  const netRoi = projectedRevenueRetained - campaignCost;

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp = {
      id: Date.now(),
      name: campaignName,
      segment: selectedSegment,
      discount: `${discountVal}% Discount`,
      roi: `$${netRoi.toLocaleString()}`,
      status: 'Active'
    };
    setCampaignsList(prev => [newCamp, ...prev]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <Megaphone className="text-brand-500" size={20} />
            Marketing Campaign Intelligence
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs">Personalize email campaigns, allocate loyalty rewards, and simulate CLV conversion ROI</p>
        </div>
      </div>

      {submitted && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-650 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 transition-all">
          <CheckCircle size={16} /> Campaign launched successfully! Target audience email blasts dispatched.
        </div>
      )}

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Simulation Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-brand-500" />
              Campaign Configuration Builder
            </h2>

            <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Campaign Name</label>
                  <input 
                    type="text" required value={campaignName} onChange={e => setCampaignName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Target Segment Audience</label>
                  <select 
                    value={selectedSegment} onChange={e => setSelectedSegment(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-semibold"
                  >
                    <option value="VIP">VIP Segment ({segmentStats.VIP.size} accounts)</option>
                    <option value="Regular">Regular Segment ({segmentStats.Regular.size} accounts)</option>
                    <option value="New">New Segment ({segmentStats.New.size} accounts)</option>
                    <option value="Inactive">Inactive Segment ({segmentStats.Inactive.size} accounts)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Coupon Code</label>
                  <input 
                    type="text" required value={couponCode} onChange={e => setCouponCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Discount Incentive (%)</label>
                  <select 
                    value={discountVal} onChange={e => setDiscountVal(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-semibold"
                  >
                    <option value={10}>10% Discount Coupon</option>
                    <option value={15}>15% Discount Coupon</option>
                    <option value={20}>20% Discount Coupon</option>
                    <option value={25}>25% Discount Coupon</option>
                  </select>
                </div>
              </div>

              {/* Conversion rate Slider */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-550 dark:text-slate-400 uppercase tracking-wider">Simulated Conversion Rate</span>
                  <span className="text-brand-600 dark:text-brand-400 font-extrabold">{conversionRate}%</span>
                </div>
                <input 
                  type="range" min={5} max={50} step={1} value={conversionRate} onChange={e => setConversionRate(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 block leading-relaxed">Adjust slider to simulate estimated coupon redemption conversion rates across target segment.</span>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <Mail size={14} /> Launch Targeted Email Campaign
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: ROI & Revenue Projection Board */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-850 text-white rounded-xl p-6 shadow-md space-y-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-6">
                <Sparkles size={14} className="text-amber-400" />
                Campaign ROI Forecast
              </h2>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audience Segment</span>
                  <span className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-semibold border border-slate-700">{selectedSegment}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audience Size</span>
                  <span className="text-xs font-bold text-slate-100">{currentStats.size} Customers</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Segment CLV</span>
                  <span className="text-xs font-bold text-slate-100">${totalAudienceClv.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-400" /> Revenue Retained
                  </span>
                  <span className="text-md font-extrabold text-emerald-400 flex items-center gap-0.5">
                    ${projectedRevenueRetained.toLocaleString()}
                    <ArrowUpRight size={14} />
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Discount Cost</span>
                  <span className="font-semibold text-rose-400">-${campaignCost.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-wide">Net ROI Return</span>
                  <span className="text-lg font-black text-brand-400">${netRoi.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-4 mt-6">
              * Calculations dynamically model discount margins against overall segment CLV profiles to prevent cost overruns.
            </div>
          </div>
        </div>

      </div>

      {/* Active & History Campaigns List */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Layers size={16} className="text-brand-500" />
          Active Campaigns Registry
        </h2>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-55 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-450 font-bold uppercase">
                <th className="px-4 py-3">Campaign Name</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Discount Type</th>
                <th className="px-4 py-3 text-right">Projected ROI</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {campaignsList.map(c => (
                <tr key={c.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/20 text-slate-650 dark:text-slate-350 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 font-medium">{c.segment}</td>
                  <td className="px-4 py-3">{c.discount}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-450">{c.roi}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      c.status === 'Active' 
                        ? 'text-brand-600 border-brand-500/20 bg-brand-500/5' 
                        : 'text-slate-500 border-slate-200 bg-slate-100 dark:text-slate-450 dark:border-slate-800 dark:bg-slate-900/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
