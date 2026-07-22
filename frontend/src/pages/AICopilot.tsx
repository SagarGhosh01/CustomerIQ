import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  Sparkles, Send, Bot, User, Loader2, Award, AlertTriangle, 
  Mail, ArrowRight, ClipboardCheck, CornerDownLeft
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  data?: any[]; // optional customer items returned
  type?: 'text' | 'customers' | 'template';
}

export const AICopilot: React.FC = () => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your AI Customer Intelligence Assistant. How can I help you optimize retention today?\n\nYou can click on one of the common queries below or ask your own question in plain English.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollChat = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollChat();
  }, [messages, loading]);

  const handleSuggestClick = (suggestion: string) => {
    if (loading) return;
    submitQuery(suggestion);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    submitQuery(query);
    setQuery('');
  };

  const submitQuery = async (userText: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: timeNow,
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const normalized = userText.toLowerCase();
      
      // 1. VIP Query Router
      if (normalized.includes('vip') || normalized.includes('loyal')) {
        const res = await fetch(`${API_BASE_URL}/api/customers/?limit=6&segment=VIP`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender: 'ai',
            text: `Here are the top K-Means segmented **VIP customers** currently in the SQLite registry:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            data: data.items || [],
            type: 'customers'
          }]);
        } else {
          throw new Error('Failed to retrieve VIP data');
        }
      } 
      // 2. High Churn Risk Router
      else if (normalized.includes('churn') || normalized.includes('risk') || normalized.includes('leave')) {
        const res = await fetch(`${API_BASE_URL}/api/customers/?limit=6&churn_risk=High`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender: 'ai',
            text: `I've compiled the customers flagged with **High Churn Risk** based on the Random Forest predictions:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            data: data.items || [],
            type: 'customers'
          }]);
        } else {
          throw new Error('Failed to retrieve Churn data');
        }
      } 
      // 3. Email Draft / Marketing Template Router
      else if (normalized.includes('template') || normalized.includes('email') || normalized.includes('campaign') || normalized.includes('discount')) {
        // Mock a copyable marketing coupon draft template
        const emailTemplate = `Subject: Special VIP Reward: We appreciate you!

Dear [Customer Name],

As one of our most valued VIP customers here in [City], we want to say thank you for your support. 

Enjoy 20% off your next purchase of your favorite electronics with code: VIPLOYAL20.

Best,
Retention Operations Team`;

        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: emailTemplate,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'template'
        }]);
      } 
      // 4. Default helpful chat responder
      else {
        // Delay to feel like a real conversational chatbot
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: `I'm here to translate customer data metrics. Try asking me:\n\n* **"Show VIP customers"**\n* **"List high churn risk accounts"**\n* **"Draft a retention discount email template"**`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: "I encountered an error querying the customer database. Please verify your connection status and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <Sparkles className="text-brand-500" size={20} />
            AI Copilot Lab
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Conversational intelligence and marketing automation helper</p>
        </div>
      </div>

      {/* Chat Conversation Thread */}
      <div className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'ai' 
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                  : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-350'
              }`}>
                {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>

              {/* Message Box */}
              <div className="space-y-2">
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-sm font-medium'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-slate-300 shadow-sm'
                }`}>
                  {msg.type === 'template' ? (
                    <div className="space-y-3 font-mono">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                        <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Mail size={12} /> Email Template Drafted
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            alert("Template copied to clipboard!");
                          }}
                          className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-650 hover:text-slate-900 dark:text-slate-350 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-705 cursor-pointer transition-colors"
                        >
                          <ClipboardCheck size={10} /> Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-[10.5px] leading-relaxed select-all bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-750 dark:text-slate-300">
                        {msg.text}
                      </pre>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>

                {/* Optional Customer cards render */}
                {msg.type === 'customers' && msg.data && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {msg.data.slice(0, 4).map((c: any) => (
                      <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 shadow-sm space-y-2 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{c.name}</span>
                            <span className="text-[10px] text-slate-400 block">{c.email}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider ${
                            c.churn_risk === 'High' ? 'text-rose-500 bg-rose-500/5 border-rose-500/10' : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'
                          }`}>
                            {c.churn_risk} Risk
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 dark:border-slate-850 pt-2 text-slate-500">
                          <span>Spend: ${c.predicted_clv ? c.predicted_clv.toFixed(0) : '0'} CLV</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{c.segment} Segment</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-[9px] text-slate-400 px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-brand-500/10 border border-brand-500/30 text-brand-650 dark:text-brand-400">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 className="animate-spin text-brand-500" size={14} />
                <span>AI Agent querying SQLite registry...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Bubbles */}
        <div className="px-6 pb-3 flex flex-wrap gap-2 shrink-0 bg-gradient-to-t from-slate-50/10 to-transparent">
          {[
            "Show VIP customers",
            "List High Churn Risk accounts",
            "Draft retention discount email"
          ].map((sug, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSuggestClick(sug)}
              className="text-[10px] font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 hover:text-brand-650 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              {sug} <ArrowRight size={10} />
            </button>
          ))}
        </div>

        {/* Chat Input form footer */}
        <form 
          onSubmit={handleFormSubmit}
          className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shrink-0 flex gap-3 items-center"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Ask AI Copilot (e.g. 'Show VIP customers')..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl p-3 shrink-0 disabled:opacity-40 transition-colors shadow-lg shadow-brand-500/10 flex items-center justify-center cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>

      </div>
    </div>
  );
};
