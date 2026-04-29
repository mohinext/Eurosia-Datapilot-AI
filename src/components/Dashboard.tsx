import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Zap, 
  Settings, 
  History as HistoryIcon, 
  Search, 
  Bell, 
  ChevronDown,
  Download,
  Share2,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  Table as TableIcon,
  AlertCircle,
  Globe,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { DataTable } from './DataTable';

const chartData = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 3 },
  { name: 'Wed', value: 6 },
  { name: 'Thu', value: 8 },
  { name: 'Fri', value: 5 },
  { name: 'Sat', value: 9 },
  { name: 'Sun', value: 7 },
];

export const Dashboard = ({ onNotify }: { onNotify: (m: string, t?: 'success' | 'error') => void }) => {
  const [activeView, setActiveView] = useState('overview');
  const [isExtracting, setIsExtracting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchUsage();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/extractions/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user/usage');
      const data = await res.json();
      if (data.success) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  };

  const handleExtract = async () => {
    if (!prompt.trim()) return;
    setIsExtracting(true);
    setResult(null);
    try {
      const response = await fetch('/api/extractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: prompt,
          url: targetUrl || undefined
        })
      });

      const res = await response.json();
      
      if (res.success) {
        setResult(res.data);
        onNotify("Extraction completed successfully!");
        fetchHistory();
        fetchUsage();
      } else {
        throw new Error(res.error?.message || 'Extraction failed');
      }
    } catch (error: any) {
      console.error(error);
      onNotify(error.message, 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    onNotify("JSON copied to clipboard!");
  };

  const downloadCSV = (data: any) => {
    if (!data || !data.rows.length) return;
    const fields = data.fields;
    const csvContent = [
      fields.join(","),
      ...data.rows.map((row: any) => fields.map((f: string) => `"${String(row[f] || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "extracted_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("CSV download started");
  };

  return (
    <div className="flex h-screen bg-app-bg text-app-fg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-app-border flex flex-col pt-6">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">D</div>
          <span className="font-bold tracking-tight text-app-fg">Datapilot AI</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
            { id: 'extractions', icon: <Database size={18} />, label: 'Extractions' },
            { id: 'api_keys', icon: <Zap size={18} />, label: 'API Keys' },
            { id: 'billing', icon: <Download size={18} />, label: 'Billing & Usage' },
            { id: 'history', icon: <HistoryIcon size={18} />, label: 'History' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-app-muted-fg hover:text-app-fg hover:bg-app-card border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-app-border space-y-4">
          {usage && (
            <div className="px-4 py-3 bg-app-card rounded-xl border border-app-border">
              <div className="flex justify-between text-[10px] font-bold text-app-muted-fg uppercase mb-2">
                <span>Credits</span>
                <span className="text-blue-400">{usage.credits_remaining}/{usage.credits_limit}</span>
              </div>
              <div className="h-1 w-full bg-app-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${(usage.credits_remaining / usage.credits_limit) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
              activeView === 'settings' ? 'text-blue-400 bg-blue-600/10' : 'text-app-muted-fg hover:text-app-fg'
            }`}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-app-border flex items-center justify-between px-8 sticky top-0 bg-app-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 text-sm text-app-muted-fg">
            <span>Project</span>
            <ChevronDown size={14} />
            <span className="text-app-fg font-medium">Default Project</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted-fg" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-app-card border border-app-border rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500/50 transition-all w-64 text-app-fg"
              />
            </div>
            <button className="p-2 text-app-muted-fg hover:text-app-fg transition-all">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-app-border"></div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Extractions', value: history.length, trend: '+12%', color: 'text-blue-400' },
                    { label: 'Credits Remaining', value: usage?.credits_remaining || 0, trend: usage?.plan || 'Free', color: 'text-green-400' },
                    { label: 'Success Rate', value: '100%', trend: 'Healthy', color: 'text-purple-400' },
                    { label: 'API Calls', value: history.length, trend: 'Healthy', color: 'text-app-muted-fg' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-app-card border border-app-border p-6 rounded-2xl">
                      <div className="text-xs font-bold text-app-muted-fg uppercase tracking-widest mb-2">{stat.label}</div>
                      <div className="flex items-end justify-between">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] font-bold text-app-muted-fg bg-app-bg px-2 py-1 rounded">{stat.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* AI Interaction Box */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-app-card border border-app-border rounded-2xl p-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles size={120} className="text-blue-500" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Sparkles size={20} className="text-blue-500" />
                        AI Extraction Engine
                      </h3>
                      
                      <div className="mb-4 text-[10px] text-app-muted-fg flex items-center gap-1.5 bg-app-muted w-max px-2 py-1 rounded border border-app-border">
                        <AlertCircle size={10} />
                        Compliance: Use only on websites where you have permission or legal rights.
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted-fg" size={16} />
                          <input 
                            type="text" 
                            placeholder="URL to extract from (e.g. amazon.com/product/123)"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            className="w-full bg-app-bg border border-app-border rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all font-mono text-app-fg"
                          />
                        </div>
                        <div className="relative">
                          <textarea
                            placeholder="Example: Extract all product names, prices, and ratings from this page..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 bg-app-bg border border-app-border rounded-xl p-4 text-sm outline-none focus:border-blue-500/50 transition-all resize-none text-app-fg"
                          />
                          <button 
                            onClick={handleExtract}
                            disabled={isExtracting || !prompt.trim()}
                            className="absolute bottom-4 right-4 px-6 py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale text-white"
                          >
                            {isExtracting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                            {isExtracting ? 'Analyzing...' : 'Run Extraction'}
                          </button>
                        </div>
                      </div>

                      {result && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-8 pt-8 border-t border-app-border"
                        >
                          <DataTable 
                            fields={result.fields} 
                            rows={result.rows} 
                            onCopy={() => copyToClipboard(result)}
                            onDownload={() => downloadCSV(result)}
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Chart Card */}
                    <div className="bg-app-card border border-app-border rounded-2xl p-8">
                       <h3 className="text-sm font-bold text-app-muted-fg uppercase tracking-widest mb-8">Data Extraction Activity</h3>
                       <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="#888888" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              dy={10}
                            />
                            <YAxis 
                              stroke="#888888" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              dx={-10}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'var(--card)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '12px',
                                fontSize: '10px',
                                color: 'var(--foreground)'
                              }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3b82f6" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorValue)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                       </div>
                    </div>
                  </div>

                  {/* Activity/Sidebar */}
                  <div className="space-y-8">
                    <div className="bg-app-card border border-app-border rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-app-muted-fg uppercase tracking-widest">Active Jobs</h3>
                        <div className="text-[10px] text-blue-400 font-bold bg-blue-400/10 px-2 py-1 rounded">3 Running</div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { name: 'Amazon Monitor', status: 'Running', progress: 65 },
                          { name: 'LinkedIn Leads', status: 'Pending', progress: 0 },
                          { name: 'Zillow Alerts', status: 'Finished', progress: 100 },
                        ].map((job, i) => (
                          <div key={i} className="p-4 bg-app-bg border border-app-border rounded-xl space-y-3">
                            <div className="flex justify-between items-center text-xs">
                               <span className="font-bold text-app-fg">{job.name}</span>
                               <span className={job.status === 'Running' ? 'text-blue-400 animate-pulse' : 'text-app-muted-fg'}>{job.status}</span>
                            </div>
                            <div className="h-1.5 w-full bg-app-muted rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-blue-600 transition-all duration-1000" 
                                 style={{ width: `${job.progress}%` }}
                               ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-app-card border border-app-border rounded-2xl p-6">
                       <h3 className="text-sm font-bold text-app-muted-fg uppercase tracking-widest mb-6">History</h3>
                       <div className="space-y-4">
                          {isLoadingHistory ? (
                            <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-app-muted-fg" /></div>
                          ) : history.length === 0 ? (
                            <div className="text-[10px] text-app-muted-fg text-center py-4">No recent activity</div>
                          ) : history.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs group cursor-pointer" onClick={() => setResult(item)}>
                               <div className="w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors"></div>
                               <div className="flex-1">
                                  <div className="font-medium text-app-fg truncate w-32">{item.instruction}</div>
                                  <div className="text-[10px] text-app-muted-fg">{new Date(item.timestamp).toLocaleTimeString()}</div>
                               </div>
                               <ExternalLink size={12} className="text-app-muted-fg group-hover:text-app-fg" />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeView === 'api_keys' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl space-y-8"
              >
                <div className="bg-app-card border border-app-border rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-bold mb-1">API Keys</h3>
                      <p className="text-xs text-app-muted-fg">Manage your keys to access Eurosia via our developer API.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold active:scale-95 transition-all text-white">
                      <Plus size={16} /> Create Key
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Production Key', key: 'eu_live_xxxxxxxxxxxxxxx', status: 'Active', created: '2 days ago' },
                    ].map((key, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-app-bg border border-app-border rounded-2xl">
                        <div className="space-y-1">
                          <div className="text-sm font-bold flex items-center gap-2 text-app-fg">
                             {key.name} 
                             <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase">{key.status}</span>
                          </div>
                          <div className="text-xs font-mono text-app-muted-fg">{key.key}</div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-app-muted-fg">
                           <span>Created {key.created}</span>
                           <button className="p-2 text-app-muted-fg hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-6 flex items-start gap-4 text-blue-400">
                  <div className="p-2 bg-blue-600/10 rounded-lg">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1">Developer Documentation</h4>
                    <p className="text-xs opacity-60 leading-relaxed">
                      Our API allows you to programmatically trigger extractions and retrieve data in real-time. 
                      Check our <span className="underline cursor-pointer">API Reference</span> for more details.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {activeView === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl space-y-8"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-app-card border border-app-border rounded-3xl p-8 border-l-4 border-l-blue-500">
                    <h3 className="text-sm font-bold text-app-muted-fg uppercase tracking-widest mb-6">Current Plan</h3>
                    <div className="text-3xl font-bold mb-2 text-app-fg">{usage?.plan || 'Free'} Tier</div>
                    <p className="text-app-muted-fg text-sm mb-8">You are currently using the {usage?.plan || 'free'} version of Eurosia Datapilot AI.</p>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all">Upgrade Plan</button>
                  </div>

                  <div className="bg-app-card border border-app-border rounded-3xl p-8">
                    <h3 className="text-sm font-bold text-app-muted-fg uppercase tracking-widest mb-6">Usage Summary</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2 text-app-fg">
                           <span>Extraction Credits</span>
                           <span>{usage?.credits_remaining || 0} / {usage?.credits_limit || 10}</span>
                        </div>
                        <div className="h-2 w-full bg-app-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            style={{ width: `${(usage?.credits_remaining / usage?.credits_limit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2 text-app-fg">
                           <span>API Requests</span>
                           <span>42 / 1,000</span>
                        </div>
                        <div className="h-2 w-full bg-app-muted rounded-full overflow-hidden">
                          <div className="h-full w-[5%] bg-blue-600"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-app-card border border-app-border rounded-3xl p-8">
                   <h3 className="text-sm font-bold text-app-muted-fg uppercase tracking-widest mb-8">Invoices & History</h3>
                   <div className="space-y-4">
                      {[
                        { date: 'Apr 01, 2024', amount: '$0.00', status: 'Paid' },
                        { date: 'Mar 01, 2024', amount: '$0.00', status: 'Paid' },
                        { date: 'Feb 01, 2024', amount: '$0.00', status: 'Paid' },
                      ].map((inv, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-app-bg border border-app-border rounded-xl hover:border-app-border transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-app-muted flex items-center justify-center text-app-muted-fg">
                                 <Download size={18} />
                              </div>
                              <span className="text-sm font-bold text-app-fg">{inv.date}</span>
                           </div>
                           <div className="flex gap-12 items-center">
                              <span className="text-sm font-mono text-app-fg">{inv.amount}</span>
                              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded uppercase">{inv.status}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
            {activeView === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl space-y-8"
              >
                <div className="bg-app-card border border-app-border rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-8 text-app-fg">Settings</h3>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8 pb-8 border-b border-app-border">
                      <div>
                        <label className="block text-xs font-bold text-app-muted-fg uppercase mb-2">Display Name</label>
                        <input type="text" defaultValue="Demo User" className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all text-app-fg" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-app-muted-fg uppercase mb-2">Email Address</label>
                        <input type="email" defaultValue="user@example.com" className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all text-app-fg" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold mb-4 text-app-fg">Export Preferences</h4>
                      <div className="flex gap-4">
                        {['CSV', 'JSON', 'Excel'].map(format => (
                          <div key={format} className="flex-1 p-4 bg-app-bg border border-app-border rounded-xl flex items-center gap-3 cursor-pointer hover:border-blue-500/30 transition-all text-app-fg">
                            <div className="w-4 h-4 rounded-full border border-blue-600/30"></div>
                            <span className="text-sm font-medium">{format}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button className="px-8 py-2.5 bg-blue-600 rounded-xl text-sm font-bold active:scale-95 transition-all text-white">Save Changes</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
