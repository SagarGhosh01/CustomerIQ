import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { AIAnalytics } from './pages/AIAnalytics';
import { ModelPerformance } from './pages/ModelPerformance';
import { Settings } from './pages/Settings';
import { 
  LayoutDashboard, Users, Sparkles, Activity, Settings as SettingsIcon, 
  LogOut, Shield, ChevronRight, Menu, X, Sun, Moon, Bell, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from './config';

const MainLayout: React.FC = () => {
  const { user, logout, token, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'ai-analytics' | 'performance' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // alerts: Stores high-churn risk profiles retrieved from the customer database
  const [alerts, setAlerts] = useState<any[]>([]);
  // alertsOpen: Controls the visibility dropdown menu state for critical notification alerts
  const [alertsOpen, setAlertsOpen] = useState(false);

  /**
   * Proactively polls the SQLite backend to pull high-churn risk profiles.
   * This updates the notification bell badge count dynamically in the background.
   */
  useEffect(() => {
    // Only query backend if the user is successfully authenticated
    if (!isAuthenticated || !token) return;
    
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/customers/?limit=25&churn_risk=High`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Extract items from query results and save to states
          setAlerts(data.items || []);
        }
      } catch (e) {
        console.error('Failed to load risk notification alerts:', e);
      }
    };
    
    // Execute immediately on component mount
    fetchAlerts();
    
    // Poll the database endpoint every 60 seconds (60000ms) to sync active customer threats
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'customers', label: 'Customer Database', icon: <Users size={18} /> },
    { id: 'ai-analytics', label: 'AI Intelligence Lab', icon: <Sparkles size={18} /> },
    { id: 'performance', label: 'Model Performance', icon: <Activity size={18} /> },
    { id: 'settings', label: 'System Settings', icon: <SettingsIcon size={18} /> },
  ] as const;

  const renderContent = () => {
    // Wrap page content inside an animate-fade-in container for smooth view transitions
    return (
      <div key={activeTab} className="animate-fade-in p-6 md:p-8">
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return <Dashboard />;
            case 'customers':
              return <Customers />;
            case 'ai-analytics':
              return <AIAnalytics />;
            case 'performance':
              return <ModelPerformance />;
            case 'settings':
              return <Settings />;
            default:
              return <Dashboard />;
          }
        })()}
      </div>
    );
  };

  const getPageTitle = () => {
    const matched = menuItems.find(item => item.id === activeTab);
    return matched ? matched.label : 'Overview';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 justify-between shrink-0 transition-colors duration-300">
        <div className="space-y-6 pt-6">
          {/* Logo / Brand header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-slate-200 dark:border-slate-800 transition-colors relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/10 border border-brand-400/20">
                <span className="text-sm font-bold text-white tracking-wider">CIQ</span>
              </div>
              <div>
                <h2 className="text-md font-bold text-slate-900 dark:text-white leading-none transition-colors">CustomerIQ</h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase transition-colors">SaaS Analytics</span>
              </div>
            </div>
            
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-all border border-slate-200 dark:border-slate-800 relative shadow-sm"
                title="View High Risk Churn Threats"
              >
                <Bell size={15} />
                {alerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
              
              {alertsOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-slide-up">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-850">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-500 animate-bounce" />
                      Critical Churn Threats ({alerts.length})
                    </span>
                    <button onClick={() => setAlertsOpen(false)} className="text-[10px] text-slate-400 hover:text-slate-600">Close</button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {alerts.length === 0 ? (
                      <div className="text-center py-4 text-slate-550 text-[10px]">
                        No high-risk threats detected.
                      </div>
                    ) : (
                      alerts.map((c, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 flex justify-between items-center text-[10px]">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 dark:text-white block truncate text-left">{c.name}</span>
                            <span className="text-[9px] text-slate-400 block truncate text-left">{c.email}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-450 font-bold block">
                              {Math.round(c.churn_probability * 100)}%
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User profile card */}
          <div className="mx-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 flex items-center gap-3 transition-colors">
            <div className="w-9 h-9 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center font-bold text-sm text-brand-500 dark:text-brand-400">
              {user?.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-snug transition-colors">{user?.full_name}</h4>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-1 transition-colors">
                <Shield size={10} className="text-brand-500" />
                {user?.role} Mode
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-3">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                  activeTab === item.id 
                    ? 'bg-brand-600 border-brand-500/30 text-white shadow-md shadow-brand-600/10' 
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-850/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer log out */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-850/50 transition-colors">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-850 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 font-semibold py-2 rounded-lg text-xs transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & SLIDE NAVIGATION */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* MOBILE HEADER */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shrink-0">
          <span className="font-bold text-slate-900 dark:text-white text-sm">CustomerIQ</span>
          <div className="flex items-center gap-2">
            
            {/* Mobile Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white relative shadow-sm"
              >
                <Bell size={16} />
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
              
              {alertsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-slide-up">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-850">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-500 animate-bounce" />
                      Critical Alerts ({alerts.length})
                    </span>
                    <button onClick={() => setAlertsOpen(false)} className="text-[10px] text-slate-400 hover:text-slate-600">Close</button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {alerts.length === 0 ? (
                      <div className="text-center py-4 text-slate-500 text-[10px]">
                        No high-risk threats detected.
                      </div>
                    ) : (
                      alerts.map((c, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 flex justify-between items-center text-[10px]">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 dark:text-white block truncate text-left">{c.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-450 font-bold block">
                              {Math.round(c.churn_probability * 100)}%
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>



        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
            <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-full animate-slide-in transition-colors duration-300">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white text-md">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-555 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                        activeTab === item.id 
                          ? 'bg-brand-600 border-brand-500/20 text-white' 
                          : 'bg-transparent border-transparent text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-850 text-rose-500 dark:text-rose-450 border border-slate-200 dark:border-slate-800 py-2.5 rounded-lg text-xs transition-all"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* MAIN DISPLAY PANEL */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 focus:outline-none transition-colors duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center animate-pulse border border-brand-400/20">
          <span className="text-sm font-bold text-white">CIQ</span>
        </div>
        <span className="text-xs text-slate-500 animate-pulse font-semibold">Resolving SaaS session claims...</span>
      </div>
    );
  }

  return isAuthenticated ? <MainLayout /> : <Login />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
