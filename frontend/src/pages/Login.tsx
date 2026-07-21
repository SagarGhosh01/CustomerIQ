import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { ShieldCheck, UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token);
      } else {
        setError(data.detail || 'Incorrect credentials. Please try again.');
      }
    } catch (e) {
      setError('Cannot connect to the backend server. Please verify it is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (role: 'admin' | 'employee') => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@customeriq.com');
      setPassword('admin123');
    } else {
      setEmail('employee@customeriq.com');
      setPassword('employee123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-4">
      {/* Premium background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 p-8 z-10 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 border border-brand-400/30">
            <span className="text-xl font-bold text-white tracking-wider">CIQ</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to CustomerIQ</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered Customer Intelligence</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@customeriq.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-medium rounded-lg py-2.5 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 border border-brand-400/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-3 text-slate-500 font-medium">Demo Access</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg py-2 text-xs font-semibold text-slate-300 transition-all"
          >
            <ShieldCheck className="text-brand-500" size={14} />
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('employee')}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg py-2 text-xs font-semibold text-slate-300 transition-all"
          >
            <UserCheck className="text-violet-500" size={14} />
            Employee Demo
          </button>
        </div>
      </div>
    </div>
  );
};
