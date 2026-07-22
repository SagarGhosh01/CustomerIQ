import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { ShieldCheck, UserCheck, Eye, EyeOff, Loader2, UserPlus, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthConnecting, setOauthConnecting] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Sign Up API call
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            role: selectedRole,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Auto-login after registration
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);

          const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });

          const loginData = await loginRes.json();
          if (loginRes.ok) {
            login(loginData.access_token);
          } else {
            setError('Registration successful! Please sign in manually.');
            setIsSignUp(false);
          }
        } else {
          setError(data.detail || 'Registration failed. Email might already be taken.');
        }
      } else {
        // Sign In API call
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
          setError(data.detail || 'Incorrect email or password.');
        }
      }
    } catch (e) {
      setError('Cannot connect to the backend server. Please verify it is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setError(null);
    setOauthConnecting(provider);
    
    // Simulate OAuth consent screen handshake loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const formData = new URLSearchParams();
      // Authenticate as employee for OAuth demo simplicity
      formData.append('username', 'employee@customeriq.com');
      formData.append('password', 'employee123');

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
        setError('OAuth authentication failed. Fallback to demo credentials.');
      }
    } catch (e) {
      setError('Cannot connect to authentication servers. Please verify backend is running.');
    } finally {
      setOauthConnecting(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      {/* OAuth Handshake Modal Overlay */}
      {oauthConnecting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-8 text-center space-y-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-sm font-bold text-white">CIQ</span>
              </div>
              <span className="text-slate-400">⚡</span>
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center animate-bounce">
                {oauthConnecting === 'Google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.86 3C6.02 7.73 8.78 5.04 12 5.04z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58v2.98h3.84c2.25-2.07 3.59-5.12 3.59-8.66z"/>
                    <path fill="#FBBC05" d="M5.1 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.24 6.72C.44 8.3.01 10.1.01 12s.43 3.7 1.23 5.28l3.86-3z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.84-2.98c-1.07.72-2.44 1.15-4.12 1.15-3.22 0-5.98-2.69-6.96-5.68l-3.86 3C3.2 20.27 7.24 23 12 23z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">Connecting to {oauthConnecting}</h3>
              <p className="text-slate-555 dark:text-slate-400 text-xs">Securing session token and authentication keys...</p>
            </div>
            <Loader2 className="animate-spin text-brand-500 mx-auto" size={24} />
          </div>
        </div>
      )}

      {/* Premium background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-8 z-10 shadow-2xl relative animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 border border-brand-400/30">
            <span className="text-xl font-bold text-white tracking-wider">CIQ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">
            {isSignUp ? 'Create CIQ Account' : 'Welcome to CustomerIQ'}
          </h1>
          <p className="text-slate-555 dark:text-slate-400 text-sm mt-1 transition-colors">
            {isSignUp ? 'Register administrative workspace credentials' : 'AI-Powered Customer Intelligence'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/35 text-rose-650 dark:text-rose-200 text-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Workspace Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-xs font-semibold"
                >
                  <option value="employee">Employee / Staff Analyst</option>
                  <option value="admin">Administrator / Manager</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah.j@example.com"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 pr-11 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold rounded-lg py-2.5 mt-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 border border-brand-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                {isSignUp ? <UserPlus size={14} /> : <LogIn size={14} />}
                {isSignUp ? 'Create Workspace Account' : 'Sign In'}
              </span>
            )}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up modes */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsSignUp(!isSignUp);
            }}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "New to CustomerIQ? Sign Up"}
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 transition-colors">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('Google')}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800 rounded-lg py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.86 3C6.02 7.73 8.78 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58v2.98h3.84c2.25-2.07 3.59-5.12 3.59-8.66z"/>
              <path fill="#FBBC05" d="M5.1 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.24 6.72C.44 8.3.01 10.1.01 12s.43 3.7 1.23 5.28l3.86-3z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.84-2.98c-1.07.72-2.44 1.15-4.12 1.15-3.22 0-5.98-2.69-6.96-5.68l-3.86 3C3.2 20.27 7.24 23 12 23z"/>
            </svg>
            Google
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthSignIn('GitHub')}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800 rounded-lg py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};
