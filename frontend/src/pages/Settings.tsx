import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Settings as SettingsIcon, Database, RefreshCw, Cpu, Server, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const { token, user, logout, isAdmin } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFullReset = async () => {
    if (!window.confirm("Are you sure you want to restore the default database state? This will delete custom customer uploads and orders, rebuild tables, and retrain ML models from scratch.")) return;
    
    setResetting(true);
    setSuccessMsg(null);
    try {
      // 1. Re-generate data and re-train models on backend
      const response = await fetch('http://localhost:8000/api/analytics/train', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessMsg("System initialization initiated in the background! Please reload the page in 5-10 seconds.");
      } else {
        setSuccessMsg("Error sending reset command to server.");
      }
    } catch (e) {
      setSuccessMsg("Failed to connect to backend server.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure server endpoints, execute system resets, and manage employee accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Details */}
        <div className="glass-panel border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-xs pb-3 border-b border-slate-800">
            <Lock size={16} />
            User Account Profile
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Account Name</span>
              <span className="text-sm font-semibold text-white mt-0.5">{user?.full_name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Email Address</span>
              <span className="text-sm text-slate-350 mt-0.5">{user?.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Assigned Permission</span>
              <span className="mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${user?.role === 'admin' ? 'text-brand-400 bg-brand-500/10 border-brand-500/25' : 'text-violet-400 bg-violet-500/10 border-violet-500/25'}`}>
                  {user?.role} Access
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 text-rose-450 hover:text-rose-400 font-semibold py-2 rounded-lg text-xs transition-all mt-4"
          >
            Sign Out of Account
          </button>
        </div>

        {/* Right Columns - Developer Seeding Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Seeding panel */}
          <div className="glass-panel border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-xs pb-3 border-b border-slate-800">
              <Database size={16} />
              Demo Data Seeding Lab
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              If you want to clear your changes (uploaded files, new entries) and restore the original 500-customer clean seed database:
            </p>

            {successMsg && (
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <div className="pt-2">
              {isAdmin ? (
                <button
                  onClick={handleFullReset}
                  disabled={resetting}
                  className="bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-lg text-xs shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center gap-2"
                >
                  <RefreshCw className={resetting ? 'animate-spin' : ''} size={14} />
                  Restore Seed Database
                </button>
              ) : (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-lg text-xs flex items-center gap-2">
                  <Shield size={14} />
                  <span>Only system Administrators can trigger data restorations. Log in as Admin to reset.</span>
                </div>
              )}
            </div>
          </div>

          {/* Connection Logs */}
          <div className="glass-panel border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-xs pb-3 border-b border-slate-800">
              <Server size={16} />
              API Connection Status
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850/50">
                <span className="text-slate-500">FastAPI backend gateway</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  http://localhost:8000
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850/50">
                <span className="text-slate-500">SQLite Database engine</span>
                <span className="text-slate-300 font-medium">customer.db</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Security model</span>
                <span className="text-slate-350">JWT Auth Headers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
