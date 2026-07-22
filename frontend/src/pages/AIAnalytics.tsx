import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';
import { 
  Sparkles, Sliders, Play, TrendingUp, RefreshCw, 
  HelpCircle, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, 
  MessageSquare, BrainCircuit, Loader2, Sun, Moon
} from 'lucide-react';

interface Insight {
  type: string;
  title: string;
  message: string;
  impact: string;
}

export const AIAnalytics: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const [animationKey, setAnimationKey] = useState(0);

  // Run Sandbox Simulation
  const handleSimulate = async () => {
    setSimLoading(true);
    // Add artificial delay to show calculation spinner
    const delayPromise = new Promise(resolve => setTimeout(resolve, 650));
    try {
      const url = `${API_BASE_URL}/api/analytics/simulate?age=${simAge}&recency=${simRecency}&frequency=${simFrequency}&monetary=${simMonetary}&avg_rating=${simRating}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Wait for both the API response and our visual delay to finish
        await delayPromise;
        setSimResult(data);
        // Increment key to trigger complete reflow and entrance animation for cards
        setAnimationKey(prev => prev + 1);
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

  // Dynamic colors for guidelines based on active theme
  const INSIGHT_STYLES = {
    success: { 
      border: theme === 'dark' ? 'border-emerald-500/30' : 'border-emerald-500/40', 
      bg: theme === 'dark' ? 'bg-emerald-500/5' : 'bg-emerald-50/50', 
      text: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600 font-semibold', 
      icon: <CheckCircle2 className="text-emerald-500" size={18} /> 
    },
    warning: { 
      border: theme === 'dark' ? 'border-amber-500/30' : 'border-amber-500/40', 
      bg: theme === 'dark' ? 'bg-amber-500/5' : 'bg-amber-50/50', 
      text: theme === 'dark' ? 'text-amber-400' : 'text-amber-600 font-semibold', 
      icon: <AlertCircle className="text-amber-550" size={18} /> 
    },
    danger: { 
      border: theme === 'dark' ? 'border-rose-500/30' : 'border-rose-500/40', 
      bg: theme === 'dark' ? 'bg-rose-500/5' : 'bg-rose-50/50', 
      text: theme === 'dark' ? 'text-rose-400' : 'text-rose-600 font-semibold', 
      icon: <AlertCircle className="text-rose-550" size={18} /> 
    },
    info: { 
      border: theme === 'dark' ? 'border-brand-500/30' : 'border-brand-500/40', 
      bg: theme === 'dark' ? 'bg-brand-500/5' : 'bg-brand-50/50', 
      text: theme === 'dark' ? 'text-brand-400' : 'text-brand-600 font-semibold', 
      icon: <BrainCircuit className="text-brand-500" size={18} /> 
    }
  };

  const CHURN_BADGES = {
    Low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    Medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
    High: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-850/50 transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors">AI Intelligence Lab</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 transition-colors">Simulate customer parameters and view auto-generated business guidelines</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-center">
          {isAdmin && (
            <button
              onClick={handleRetrain}
              disabled={training}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 px-4 py-2.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-semibold transition-all disabled:opacity-40 shadow-sm"
            >
              <RefreshCw className={`text-brand-500 ${training ? 'animate-spin' : ''}`} size={14} />
              Retrain Models
            </button>
          )}
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        
        {/* Sandbox Simulation Panel */}
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-xs mb-4">
              <Sliders size={16} />
              Customer Simulator Sandbox
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
              Adjust demographic sliders and commercial transactions parameters. The sandboxed models will dynamically classify the simulated profile.
            </p>
            
            {/* Sliders Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4.5">
                {/* Age */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-550 dark:text-slate-400">Demographic Age</span>
                    <span className="text-slate-900 dark:text-white font-bold">{simAge} years old</span>
                  </div>
                  <input
                    type="range" min={18} max={80} value={simAge} onChange={e => setSimAge(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600 dark:accent-brand-500"
                  />
                </div>

                {/* Recency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-555 dark:text-slate-400">Recency (Days Since Last Order)</span>
                    <span className="text-slate-900 dark:text-white font-bold">{simRecency} days</span>
                  </div>
                  <input
                    type="range" min={1} max={365} value={simRecency} onChange={e => setSimRecency(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600 dark:accent-brand-500"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-555 dark:text-slate-400">Purchase Frequency (Total Orders)</span>
                    <span className="text-slate-900 dark:text-white font-bold">{simFrequency} orders</span>
                  </div>
                  <input
                    type="range" min={1} max={30} value={simFrequency} onChange={e => setSimFrequency(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600 dark:accent-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-4.5">
                {/* Monetary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-555 dark:text-slate-400">Monetary Value (Total Spend)</span>
                    <span className="text-slate-900 dark:text-white font-bold">${simMonetary}</span>
                  </div>
                  <input
                    type="range" min={10} max={3000} step={10} value={simMonetary} onChange={e => setSimMonetary(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600 dark:accent-brand-500"
                  />
                </div>

                {/* Average Review Rating */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-555 dark:text-slate-400">Average Review Rating</span>
                    <span className="text-slate-900 dark:text-white font-bold">{simRating.toFixed(1)} Stars</span>
                  </div>
                  <input
                    type="range" min={1.0} max={5.0} step={0.5} value={simRating} onChange={e => setSimRating(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600 dark:accent-brand-500"
                  />
                </div>

                {/* Trigger Button */}
                <button
                  onClick={handleSimulate}
                  disabled={simLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 dark:disabled:bg-brand-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-8 transition-all border border-brand-400/20 shadow-lg shadow-brand-500/15"
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
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 transition-colors">Simulation Analytics Output</h4>
            
            {simResult ? (
              <div key={animationKey} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CLV Card - Immediate Entrance */}
                <div 
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-center transition-colors shadow-sm animate-slide-up"
                  style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">Predicted CLV (12-Mo)</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 transition-colors">${simResult.predicted_clv.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 transition-colors">Expected forward revenue</span>
                </div>

                {/* Churn Probability Card - Delayed Entrance */}
                <div 
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-center transition-colors shadow-sm animate-slide-up"
                  style={{ animationDelay: '150ms', animationFillMode: 'both' }}
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">Churn Risk Probability</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors">{Math.round(simResult.churn_probability * 100)}%</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${CHURN_BADGES[simResult.churn_risk as keyof typeof CHURN_BADGES] || ''}`}>
                      {simResult.churn_risk}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 transition-colors">Probability of target churn</span>
                </div>

                {/* Next Best Recommendations Card - Delayed Entrance */}
                <div 
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-center transition-colors shadow-sm animate-slide-up"
                  style={{ animationDelay: '300ms', animationFillMode: 'both' }}
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">Recommended Cross-Sells</span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {simResult.recommendations.map((item, i) => (
                      <span key={i} className="text-xs text-brand-650 dark:text-brand-400 font-bold flex items-center gap-1.5 transition-colors animate-fade-in" style={{ animationDelay: `${350 + (i * 100)}ms`, animationFillMode: 'both' }}>
                        <ArrowRight size={10} className="text-brand-500" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-600 text-xs">
                Run simulator to examine predictive outputs.
              </div>
            )}
          </div>
        </div>

        {/* Business Insights Output */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-xs mb-4">
              <Sparkles size={16} />
              Auto-Generated Insights
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-5 leading-relaxed">
              Guideline recommendations compiled programmatically by the rule engine based on current database state.
            </p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[50vh] pr-1">
            {insightsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl animate-pulse" />
              ))
            ) : insights.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-650 text-xs">
                No active guidelines available. Populate database with customer data.
              </div>
            ) : (
              insights.map((item, idx) => {
                const style = INSIGHT_STYLES[item.type as keyof typeof INSIGHT_STYLES] || INSIGHT_STYLES.info;
                return (
                  <div key={idx} className={`border rounded-xl p-4 space-y-2 transition-all duration-300 ${style.border} ${style.bg}`}>
                    <div className="flex items-start gap-2.5">
                      {style.icon}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight transition-colors">{item.title}</h4>
                    </div>
                    <p className="text-slate-700 dark:text-slate-350 text-[11px] leading-relaxed transition-colors">{item.message}</p>
                    <div className="border-t border-slate-200 dark:border-slate-800/40 pt-2 flex justify-between items-center text-[10px] transition-colors">
                      <span className="text-slate-500">Suggested Action:</span>
                      <span className={`font-bold transition-colors ${style.text}`}>{item.impact}</span>
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
