import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  Sparkles, Sliders, Play, TrendingUp, RefreshCw, 
  HelpCircle, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, 
  MessageSquare, BrainCircuit, Loader2 
} from 'lucide-react';

interface Insight {
  type: string;
  title: string;
  message: string;
  impact: string;
}

export const AIAnalytics: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [training, setTraining] = useState(false);

  // Simulation Sliders State
  const [simAge, setSimAge] = useState(35);
  const [simRecency, setSimRecency] = useState(45);
  const [simFrequency, setSimFrequency] = useState(5);
  const [simMonetary, setSimMonetary] = useState(350);
  const [simRating, setSimRating] = useState(4.0);

  // Simulation outputs
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{
    churn_probability: number;
    churn_risk: string;
    predicted_clv: number;
    recommendations: string[];
  } | null>(null);

  // Fetch Business Insights
  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    handleSimulate();
  }, [token]);

  // Run Sandbox Simulation
  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const url = `${API_BASE_URL}/api/analytics/simulate?age=${simAge}&recency=${simRecency}&frequency=${simFrequency}&monetary=${simMonetary}&avg_rating=${simRating}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSimResult(data);
      }
    } catch (e) {
      console.error('Simulation connection failed:', e);
    } finally {
      setSimLoading(false);
    }
  };

  // Trigger Retraining
  const handleRetrain = async () => {
    if (!window.confirm("Do you want to re-execute model training on the backend? This runs in the background.")) return;
    setTraining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/train`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Model training initiated in background. Predictions will update shortly!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTraining(false);
    }
  };

  const INSIGHT_STYLES = {
    success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', icon: <CheckCircle2 className="text-emerald-500" size={18} /> },
    warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', icon: <AlertCircle className="text-amber-400" size={18} /> },
    danger: { border: 'border-rose-500/30', bg: 'bg-rose-500/5', text: 'text-rose-400', icon: <AlertCircle className="text-rose-400" size={18} /> },
    info: { border: 'border-brand-500/30', bg: 'bg-brand-500/5', text: 'text-brand-400', icon: <BrainCircuit className="text-brand-400" size={18} /> }
  };

  const CHURN_BADGES = {
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    High: 'text-rose-400 bg-rose-500/10 border-rose-500/25'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Intelligence Lab</h1>
          <p className="text-slate-400 mt-1">Simulate customer parameters and view auto-generated business guidelines</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={handleRetrain}
            disabled={training}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-lg text-sm text-slate-300 font-semibold transition-all disabled:opacity-40"
          >
            <RefreshCw className={`text-brand-500 ${training ? 'animate-spin' : ''}`} size={16} />
            Retrain Models
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sandbox Simulation Panel */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-xs mb-4">
              <Sliders size={16} />
              Customer Simulator Sandbox
            </div>
            
            <p className="text-slate-400 text-xs mb-6">
              Adjust demographic sliders and commercial transactions parameters. The sandboxed models will dynamically classify the simulated profile.
            </p>
            
            {/* Sliders Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4.5">
                {/* Age */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Demographic Age</span>
                    <span className="text-white">{simAge} years old</span>
                  </div>
                  <input
                    type="range" min={18} max={80} value={simAge} onChange={e => setSimAge(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Recency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Recency (Days Since Last Order)</span>
                    <span className="text-white">{simRecency} days</span>
                  </div>
                  <input
                    type="range" min={1} max={365} value={simRecency} onChange={e => setSimRecency(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Purchase Frequency (Total Orders)</span>
                    <span className="text-white">{simFrequency} orders</span>
                  </div>
                  <input
                    type="range" min={1} max={30} value={simFrequency} onChange={e => setSimFrequency(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-4.5">
                {/* Monetary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Monetary Value (Total Spend)</span>
                    <span className="text-white">${simMonetary}</span>
                  </div>
                  <input
                    type="range" min={10} max={3000} step={10} value={simMonetary} onChange={e => setSimMonetary(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Average Review Rating */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Average Review Rating</span>
                    <span className="text-white">{simRating.toFixed(1)} Stars</span>
                  </div>
                  <input
                    type="range" min={1.0} max={5.0} step={0.5} value={simRating} onChange={e => setSimRating(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Trigger Button */}
                <button
                  onClick={handleSimulate}
                  disabled={simLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-8 transition-all border border-brand-400/20 shadow-lg shadow-brand-500/15"
                >
                  {simLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Play size={16} className="fill-white" />
                  )}
                  Simulate Predictions
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output Area */}
          <div className="border-t border-slate-800 pt-6 mt-8">
            <h4 className="text-sm font-bold text-white mb-4">Simulation Analytics Output</h4>
            
            {simResult ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CLV */}
                <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Predicted CLV (12-Mo)</span>
                  <span className="text-2xl font-bold text-white mt-1">${simResult.predicted_clv.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 mt-1">Expected forward revenue value</span>
                </div>

                {/* Churn Probability */}
                <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Churn Risk Probability</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-2xl font-bold text-white">{Math.round(simResult.churn_probability * 100)}%</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${CHURN_BADGES[simResult.churn_risk as keyof typeof CHURN_BADGES] || ''}`}>
                      {simResult.churn_risk}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Probability of target customer churn</span>
                </div>

                {/* Next Best Recommendations */}
                <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recommended Cross-Sells</span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {simResult.recommendations.map((item, i) => (
                      <span key={i} className="text-xs text-brand-400 font-semibold flex items-center gap-1.5">
                        <ArrowRight size={10} className="text-brand-500" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600 text-xs">
                Run simulator to examine predictive outputs.
              </div>
            )}
          </div>
        </div>

        {/* Business Insights Output */}
        <div className="glass-panel border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-xs mb-4">
            <Sparkles size={16} />
            Auto-Generated Insights
          </div>
          
          <p className="text-slate-400 text-xs mb-5">
            Guideline recommendations compiled programmatically by the rule engine based on current database state.
          </p>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[50vh] pr-1">
            {insightsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-900 border border-slate-850 rounded-xl animate-pulse" />
              ))
            ) : insights.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-xs">
                No active guidelines available. Populate database with customer data.
              </div>
            ) : (
              insights.map((item, idx) => {
                const style = INSIGHT_STYLES[item.type as keyof typeof INSIGHT_STYLES] || INSIGHT_STYLES.info;
                return (
                  <div key={idx} className={`border rounded-xl p-4 space-y-2 ${style.border} ${style.bg}`}>
                    <div className="flex items-start gap-2.5">
                      {style.icon}
                      <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                    </div>
                    <p className="text-slate-350 text-[11px] leading-relaxed">{item.message}</p>
                    <div className="border-t border-slate-800/40 pt-1.5 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Suggested Action:</span>
                      <span className={`font-bold ${style.text}`}>{item.impact}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
