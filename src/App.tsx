/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Download, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Database, 
  Globe, 
  Table, 
  Cpu, 
  Layout, 
  MousePointer2, 
  FileSpreadsheet, 
  Code2, 
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Play,
  Star,
  Quote,
  Users,
  Award,
  ChevronDown,
  Sparkles,
  Chrome,
  Copy,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { DataTable } from './components/DataTable';
import { ThemeToggle } from './components/ThemeToggle';
import { Tooltip } from './components/ui/Tooltip';
import { useAutosave } from './hooks/useAutosave';

const Navbar = ({ onLogin }: { onLogin: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ["products", "use-cases", "pricing", "resources"];
      let currentSection = "";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Pricing", href: "#pricing" },
    { label: "Resources", href: "#resources" },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-app-bg/90 backdrop-blur-md shadow-sm py-3 border-b border-app-border' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 text-white">
              D
            </div>
            <span className="font-bold text-xl tracking-tight text-app-fg hidden sm:block">
              Eurosia <span className="text-blue-500 font-heading">Datapilot AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`transition-all duration-300 relative py-1 ${
                  activeSection === link.href.replace("#", "")
                    ? "text-blue-500 font-bold"
                    : "text-app-muted-fg hover:text-blue-500"
                }`}
              >
                {link.label}
                {activeSection === link.href.replace("#", "") && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={onLogin}
              className="hidden sm:block text-sm font-semibold text-app-muted-fg hover:text-app-fg transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onLogin}
              className="rounded-full bg-app-fg text-app-bg px-6 py-2.5 text-sm font-bold active:scale-95 transition-all shadow-lg hover:opacity-90"
            >
              Start Free
            </button>
            <button 
              className="md:hidden text-app-fg p-1 hover:bg-app-card rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-app-bg border-b border-app-border absolute top-full left-0 right-0 shadow-2xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={`text-xl font-bold transition-colors ${
                    activeSection === link.href.replace("#", "")
                      ? "text-blue-500"
                      : "text-app-fg"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-app-border" />
              <div className="flex items-center justify-between">
                <button onClick={onLogin} className="text-lg font-bold text-app-fg">Login</button>
                <button onClick={onLogin} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Get Started</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AISandbox = ({ onNotify }: { onNotify: (m: string, t?: 'success' | 'error') => void }) => {
  const [prompt, setPrompt] = useAutosave("sandbox_prompt", "");
  const [targetUrl, setTargetUrl] = useAutosave("sandbox_url", "");
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [extractionStatus, setExtractionStatus] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const steps = [
    { key: 'parsing', label: 'Parsing HTML', icon: <Code2 size={14} /> },
    { key: 'analyzing', label: 'AI Analyzing', icon: <Cpu size={14} /> },
    { key: 'extracting', label: 'Extracting Data', icon: <Table size={14} /> },
  ];

  const [currentStep, setCurrentStep] = useState<string>("");

  const handleExtract = async () => {
    if (!prompt.trim()) return;
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsExtracting(true);
    setResult(null);
    setCurrentStep("parsing");
    setExtractionStatus("Reading page structure...");
    
    // Simulate step progression for better UX since the backend is one atomic call
    const stepTimer = setTimeout(() => {
      setCurrentStep("analyzing");
      setExtractionStatus("Reasoning about data patterns...");
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setCurrentStep("extracting");
      setExtractionStatus("Converting to structured JSON...");
    }, 4000);
    
    try {
      const response = await fetch("/api/extractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ 
          instruction: prompt,
          url: targetUrl || window.location.href,
          html: targetUrl ? undefined : document.documentElement.outerHTML
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        onNotify("Extraction completed!");
      } else {
        onNotify(data.error?.message || "Extraction failed", 'error');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onNotify("Extraction cancelled", 'error');
      } else {
        onNotify("Connection error", 'error');
        console.error("Error calling extraction API:", err);
      }
    } finally {
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      setIsExtracting(false);
      setExtractionStatus("");
      setCurrentStep("");
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
    onNotify("Result copied as JSON!");
  };

  const downloadJSON = () => {
    if (!result || !result.rows.length) return;
    const blob = new Blob([JSON.stringify(result.rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "extracted_data.json");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("JSON exported successfully!");
  };

  const showLiveAPI = () => {
    const mockApiUrl = `https://api.eurosia.ai/v1/extract?url=${encodeURIComponent(targetUrl || "current")}&id=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(mockApiUrl);
    onNotify("Live API endpoint copied to clipboard!");
  };

  const downloadCSV = () => {
    if (!result || !result.rows.length) return;
    const fields = result.fields;
    const csvContent = [
      fields.join(","),
      ...result.rows.map((row: any) => fields.map((f: string) => `"${String(row[f] || '').replace(/"/g, '""')}"`).join(","))
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
  };

  return (
    <section className="px-4 sm:px-10 py-24 bg-app-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full -z-10"></div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight font-sans text-app-fg">Ask AI to Extract Anything</h2>
          <p className="text-app-muted-fg text-lg max-w-xl mx-auto font-sans">Describe what you want to extract from any web page in plain English. No code, no selectors, just results.</p>
        </div>

        <div className="glass-card-premium p-1 rounded-2xl border-gradient-blue group hover:shadow-blue-500/10 transition-shadow">
          <div className="bg-app-card rounded-[15px] p-6 md:p-8 text-white">
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted-fg" size={18} />
                <Tooltip content="The URL of the website you want to scrape" position="top">
                  <input 
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="URL to extract from (leave blank for current page)"
                    className="w-full bg-app-bg border border-app-border rounded-xl pl-12 pr-6 py-4 text-sm text-app-fg placeholder-app-muted-fg outline-none focus:border-blue-500/50 transition-all font-mono"
                  />
                </Tooltip>
              </div>
              <div className="relative">
                <Tooltip content="Describe the fields and data points to extract in plain English" position="top">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Extract product names, prices, and ratings from this Amazon results page"
                    className="w-full bg-app-bg border border-app-border rounded-xl px-6 py-6 text-app-fg placeholder-app-muted-fg outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none text-lg leading-relaxed shadow-inner font-sans"
                    disabled={isExtracting}
                  />
                </Tooltip>
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  {isExtracting && (
                    <Tooltip content="Stop the current processing job" position="top">
                      <button
                        onClick={handleCancel}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-3 rounded-lg font-bold transition-all flex items-center gap-2 active:scale-95 font-sans border border-red-500/20"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip content="Analyze and extract structured data" position="top">
                    <button
                      onClick={handleExtract}
                      disabled={isExtracting || !prompt.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 font-sans"
                    >
                      {isExtracting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin font-sans"></div>
                      ) : (
                        <Zap size={18} />
                      )}
                      {isExtracting ? "Processing..." : "Run AI Extraction"}
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Progress Indicators */}
              <AnimatePresence>
                {isExtracting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-app-border mt-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          {steps.map((step, idx) => {
                            const isPast = steps.findIndex(s => s.key === currentStep) > idx;
                            const isActive = currentStep === step.key;
                            
                            return (
                              <div key={step.key} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-500 ${
                                  isPast ? 'bg-emerald-500 text-white' : 
                                  isActive ? 'bg-blue-600 text-white animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 
                                  'bg-app-bg border border-app-border text-app-muted-fg'
                                }`}>
                                  {isPast ? <CheckCircle2 size={12} /> : step.icon}
                                </div>
                                <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:block ${
                                  isActive ? 'text-blue-500' : 
                                  isPast ? 'text-emerald-500' : 
                                  'text-app-muted-fg'
                                }`}>
                                  {step.label}
                                </span>
                                {idx < steps.length - 1 && (
                                  <div className="w-4 h-px bg-app-border mx-1 hidden sm:block"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-xs font-medium text-blue-500/80 font-mono animate-pulse">
                          {extractionStatus}
                        </div>
                      </div>
                      
                      {/* Detailed Progress Bar */}
                      <div className="w-full h-2 bg-app-bg rounded-full overflow-hidden border border-app-border relative">
                        <motion.div 
                          className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                          initial={{ width: "0%" }}
                          animate={{ 
                            width: currentStep === "parsing" ? "25%" : 
                                   currentStep === "analyzing" ? "60%" : 
                                   currentStep === "extracting" ? "90%" : "0%"
                          }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        {/* Scanning shine effect */}
                        <motion.div 
                          className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ 
                            left: ["-20%", "120%"]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-mono text-app-muted-fg">Process ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        <span className="text-[10px] font-mono text-blue-500 font-bold">
                          {currentStep === "parsing" ? "25%" : 
                           currentStep === "analyzing" ? "60%" : 
                           currentStep === "extracting" ? "90%" : "0%"} Complete
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <DataTable 
                    fields={result.fields} 
                    rows={result.rows} 
                    onCopy={copyToClipboard}
                    onDownload={downloadCSV}
                    onDownloadJSON={downloadJSON}
                    onLiveAPI={showLiveAPI}
                  />
                  <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-app-muted-fg uppercase tracking-widest">
                    <span>Confidence: {Math.round((result.confidence || 0.9) * 100)}%</span>
                    <span className="w-1 h-1 rounded-full bg-app-border"></span>
                    <span>Provider: {result.summary?.includes("OpenAI") ? "OpenAI" : "Gemini"}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductDemo = () => {
  const steps = [
    { label: "Website", icon: <Globe size={20} />, color: "bg-blue-500" },
    { label: "Eurosia AI", icon: <Cpu size={20} />, color: "bg-purple-500" },
    { label: "Clean Data", icon: <Table size={20} />, color: "bg-emerald-500" },
    { label: "Export", icon: <Download size={20} />, color: "bg-orange-500" },
  ];

  return (
    <section className="px-4 sm:px-10 py-20 bg-app-card/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center z-10"
              >
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-lg shadow-${step.color.split('-')[1]}-500/20 mb-4 transform hover:scale-110 transition-transform cursor-pointer text-white`}>
                  {step.icon}
                </div>
                <span className="text-sm font-bold text-app-muted-fg">{step.label}</span>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-app-border via-blue-500/50 to-app-border relative">
                  <motion.div
                    animate={{ x: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 blur-sm rounded-full"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-xl text-app-muted-fg">Understand your data flow in 3 seconds. Simple. Powerful. Automatic.</p>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { label: "Website", icon: <Globe size={26} />, color: "bg-blue-600" },
    { label: "Eurosia AI", icon: <Cpu size={26} />, color: "bg-purple-600" },
    { label: "Clean Data", icon: <Table size={26} />, color: "bg-emerald-600" },
    { label: "Export", icon: <Download size={26} />, color: "bg-orange-600" },
  ];

  return (
    <section className="px-4 sm:px-10 py-32 bg-app-bg relative overflow-hidden border-b border-app-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-center gap-6 sm:gap-16 md:gap-20 lg:gap-28 mb-16 overflow-x-auto pb-4 no-scrollbar">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-5 group shrink-0"
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ${step.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-all duration-500 cursor-default shadow-blue-500/10`}>
                    {step.icon}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-app-muted-fg group-hover:text-app-fg transition-colors tracking-tight uppercase tracking-wider">{step.label}</span>
                </motion.div>
                
                {i < steps.length - 1 && (
                  <div className="flex-1 min-w-[40px] max-w-[120px] h-px bg-app-border relative hidden sm:block">
                    <motion.div 
                      className="absolute inset-0 bg-blue-500/30 blur-[6px]"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute top-1/2 left-0 w-8 h-8 rounded-full bg-blue-400/20 blur-xl -translate-y-1/2"
                      animate={{ 
                        left: ["0%", "100%"],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: i * 1
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-app-muted-fg text-center max-w-2xl text-xl font-medium leading-relaxed font-sans"
          >
            Understand your data flow in 3 seconds. Simple. Powerful. Automatic.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Mark Thompson",
      role: "Sales Manager at TechFlow",
      text: "We used to spend hours manually copying lead info from LinkedIn. With Eurosia Datapilot, our sales team has reclaimed 15 hours a week. The field mapping is scarily accurate and has transformed our prospecting efficiency.",
      avatar: "https://picsum.photos/seed/mark/100/100",
      stats: "15h saved/week"
    },
    {
      name: "Dr. Elena Rodriguez",
      role: "Market Researcher at GlobalInsight",
      text: "Competitive analysis used to be a nightmare of broken scrapers. Now, I just describe what I want in plain English. Eurosia handles the messy HTML and gives me a clean CSV instantly. It's a game changer for our agility.",
      avatar: "https://picsum.photos/seed/elena/100/100",
      stats: "10x research speed"
    },
    {
      name: "David Park",
      role: "Lead Data Analyst at RetailMetrics",
      text: "Integrating web data into our ETL pipeline was always the bottleneck. The Datapilot API turned any retailer site into a structured feed overnight. The quality of data extraction is superior to any DIY solution we tried.",
      avatar: "https://picsum.photos/seed/david/100/100",
      stats: "Zero manual entry"
    }
  ];

  return (
    <section id="testimonials" className="px-4 sm:px-10 py-32 bg-app-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 blur-[160px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 uppercase tracking-widest"
          >
            <Star size={14} fill="currentColor" /> Trusted by Industry Leaders
          </motion.div>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-app-fg font-heading">
            Success Stories <br />
            <span className="text-blue-500 font-heading uppercase">Powered by AI.</span>
          </h2>
          <p className="text-app-muted-fg text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            See how data-driven teams are using Eurosia Datapilot to eliminate manual work and scale their intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-premium p-8 flex flex-col justify-between group hover:border-blue-500/40 transition-all duration-500 relative"
            >
              <div className="text-blue-500 mb-8 scale-125 origin-left">
                <Quote size={24} fill="currentColor" className="opacity-20" />
              </div>
              
              <p className="text-app-fg text-lg italic mb-10 leading-relaxed font-sans relative z-10">
                "{t.text}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-app-border group-hover:border-blue-500/50 transition-colors shadow-lg">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-app-bg">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-app-fg font-heading">{t.name}</div>
                  <div className="text-xs text-app-muted-fg uppercase tracking-widest font-bold mb-1">{t.role}</div>
                  <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">{t.stats}</div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-app-fg font-heading">50K+</span>
              <span className="text-xs text-app-muted-fg uppercase font-bold tracking-widest mt-2">Active Users</span>
            </div>
            <div className="w-px h-12 bg-app-border hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-app-fg font-heading">100M+</span>
              <span className="text-xs text-app-muted-fg uppercase font-bold tracking-widest mt-2">Points Extracted</span>
            </div>
            <div className="w-px h-12 bg-app-border hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-app-fg font-heading">4.9/5</span>
              <span className="text-xs text-app-muted-fg uppercase font-bold tracking-widest mt-2 flex items-center gap-1">
                <Star size={10} fill="currentColor" className="text-yellow-500" /> Average Rating
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = () => {
  const demoData = [
    { name: "Nike Air Zoom", price: "$120", rating: "4.5", stock: "In Stock" },
    { name: "Adidas Ultraboost", price: "$180", rating: "4.7", stock: "In Stock" },
    { name: "Puma Runner", price: "$95", rating: "4.3", stock: "Low Stock" },
    { name: "Reebok Classic", price: "$110", rating: "4.4", stock: "Out of Stock" },
    { name: "New Balance 574", price: "$85", rating: "4.6", stock: "In Stock" },
    { name: "Asics Gel-Kayano", price: "$160", rating: "4.8", stock: "In Stock" },
  ];

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4 sm:px-10 bg-app-bg">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 uppercase tracking-widest"
          >
            <Sparkles size={14} /> AI-Powered Web Extraction
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8 text-app-fg font-heading"
          >
            The Data Pilot <br />
            <span className="text-blue-500 text-glow-blue uppercase font-heading">For Every Website.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-app-muted-fg mb-10 max-w-lg leading-relaxed font-sans"
          >
            Extract product data, prices, ratings, and more in seconds — no code required. Turn the web into your personal API.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-4 text-white"
          >
            <button className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group">
              Start Free Today <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="rounded-xl border border-app-border bg-app-card px-8 py-4 font-bold text-lg hover:opacity-80 transition-all flex items-center justify-center gap-2 text-app-fg">
              <Chrome size={18} /> Install Extension
            </button>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-app-muted-fg font-medium flex items-center gap-4"
          >
            <span>Free plan • No credit card required • Works on any website</span>
            <span className="flex items-center gap-1 text-yellow-500/80"><Star size={12} fill="currentColor" /> 5.0 (1k+ users)</span>
          </motion.p>
        </div>

        <div className="lg:w-1/2 w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-3xl bg-app-card/30 border border-app-border p-4 shadow-xl group hover:border-blue-500/30 transition-all duration-500">
              <div className="rounded-2xl bg-app-card p-5 border border-app-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-10 border-b border-app-border pb-4">
                  <div className="text-xs font-bold text-app-muted-fg uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Extraction Result
                  </div>
                  <div className="flex gap-2 text-white">
                    <button className="text-[10px] bg-app-bg px-2 py-1 rounded border border-app-border hover:bg-app-muted transition-colors flex items-center gap-1 font-bold text-app-fg">
                      <Copy size={10} /> Copy
                    </button>
                    <button className="text-[10px] bg-blue-600 px-2 py-1 rounded hover:bg-blue-500 transition-colors flex items-center gap-1 font-bold shadow-lg shadow-blue-500/20">
                      <Download size={10} /> Download
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-app-border text-app-muted-fg font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Product Name</th>
                        <th className="py-3 px-2 text-center">Price</th>
                        <th className="py-3 px-2 text-center">Rating</th>
                        <th className="py-3 px-2 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                      {[
                        { name: "Nike Air Zoom", price: "$120", rating: "4.5", stock: "In Stock" },
                        { name: "Adidas Ultraboost", price: "$180", rating: "4.7", stock: "In Stock" },
                        { name: "Puma Runner", price: "$95", rating: "4.3", stock: "Low Stock" },
                        { name: "Reebok Classic", price: "$110", rating: "4.4", stock: "Out of Stock" },
                        { name: "New Balance 574", price: "$85", rating: "4.6", stock: "In Stock" },
                        { name: "Asics Gel-Kayano", price: "$160", rating: "4.8", stock: "In Stock" },
                        { name: "Under Armour Hover", price: "$140", rating: "4.4", stock: "Low Stock" },
                        { name: "Saucony Endorphin", price: "$170", rating: "4.9", stock: "In Stock" }
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-app-muted/50 transition-colors group/row">
                          <td className="py-3 px-2 text-app-fg group-hover/row:text-blue-400 font-medium">{item.name}</td>
                          <td className="py-3 px-2 text-center text-app-muted-fg font-mono">{item.price}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="flex items-center justify-center gap-1 text-yellow-500/80">
                              <Star size={10} fill="currentColor" /> {item.rating}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              item.stock === 'In Stock' ? 'text-blue-400' :
                              item.stock === 'Low Stock' ? 'text-orange-400' :
                              'text-red-400'
                            }`}>
                              {item.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Simulated Loading Overlay (Visual Only) */}
                <div className="absolute bottom-4 right-4 bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 text-[10px] font-bold text-blue-400 group-hover:scale-105 transition-transform">
                  <Zap size={10} /> Extraction Active
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { title: "AI Web Extraction", desc: "Automate messy data workflows and turn raw web pages into usable business data.", icon: <Zap size={24} /> },
    { title: "Data Cleaning", desc: "Standardize addresses, fix typos, and remove duplicates automatically.", icon: <CheckCircle2 size={24} /> },
    { title: "AI Enrichment", desc: "Enrich leads with LinkedIn data and search for business emails.", icon: <Users size={24} /> },
    { title: "Scheduled Automation", desc: "Run your workflows hourly without manual work in the cloud.", icon: <Zap size={24} className="text-orange-500" /> },
    { title: "Google Sheets Export", desc: "Sync extracted data directly to Google Sheets or Airtable in real-time.", icon: <FileSpreadsheet size={24} className="text-emerald-500" /> },
    { title: "API Access", desc: "Turn any website into a live JSON API for your software applications.", icon: <Code2 size={24} className="text-blue-500" /> },
  ];

  return (
    <section id="products" className="px-4 sm:px-10 py-24 bg-app-bg text-app-fg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-heading">
            More Than Scraping. <br />
            <span className="text-blue-500 text-glow-blue uppercase font-heading">Full Data Intelligence.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -8, borderColor: 'rgba(59, 130, 246, 0.4)' }}
              className="rounded-2xl border border-app-border bg-app-card p-8 transition-all relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight font-heading text-app-fg">{f.title}</h3>
              <p className="text-app-muted-fg text-sm leading-relaxed">
                {f.desc}
              </p>
              <div className="mt-6 flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ProductTour = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "login",
      title: "Secure Login",
      desc: "Enterprise-grade authentication with SSO and Google integration.",
      icon: <CheckCircle2 size={18} />,
      ui: (
        <div className="bg-app-card p-8 rounded-2xl border border-app-border shadow-2xl max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">D</div>
            <span className="font-bold text-app-fg">Eurosia Datapilot</span>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-white text-black rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:bg-gray-100 transition-colors">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Continue with Google
            </div>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-app-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-app-muted-fg font-bold"><span className="bg-app-card px-2">Or</span></div>
            </div>
            <input type="email" placeholder="Email address" className="w-full bg-app-bg border border-app-border p-3 rounded-lg text-sm text-app-fg focus:border-blue-500 outline-none transition-colors" />
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">Sign In</button>
          </div>
        </div>
      )
    },
    {
      id: "scanner",
      title: "Smart Scanner",
      desc: "Real-time analysis of DOM structures and page patterns.",
      icon: <Zap size={18} />,
      ui: (
        <div className="bg-app-card p-6 rounded-2xl border border-app-border shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 border-b border-app-border pb-4">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="text-[10px] text-app-muted-fg font-bold uppercase tracking-widest">Scanning Page...</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 rounded-xl bg-blue-500/5 border border-blue-500/20 relative animate-pulse">
               <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-[8px] font-bold text-white rounded">Table Found</div>
            </div>
            <div className="h-32 rounded-xl bg-app-bg border border-app-border relative">
               <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-500 text-[8px] font-bold text-white rounded">List Pattern</div>
            </div>
            <div className="col-span-2 h-16 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center px-4 justify-between">
               <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase">Pagination Detected</span>
               <div className="text-[10px] text-app-muted-fg">12 Pages Available</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ai-detection",
      title: "AI Field Detection",
      desc: "Neural networks automatically map fields to schema types.",
      icon: <Cpu size={18} />,
      ui: (
        <div className="bg-app-card p-6 rounded-2xl border border-app-border shadow-2xl">
          <h4 className="text-xs font-bold text-app-muted-fg mb-6 uppercase tracking-widest">Automatic Mapping</h4>
          <div className="space-y-3">
             {[
               { field: "price_text", type: "Currency", score: "99.8%" },
               { field: "item_title", type: "String", score: "100%" },
               { field: "stock_count", type: "Integer", score: "96.4%" }
             ].map((f, i) => (
               <div key={i} className="p-3 bg-app-bg rounded-xl border border-app-border flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-app-fg font-mono">{f.field}</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-[10px] text-blue-400 uppercase font-bold">{f.type}</span>
                    <span className="text-[10px] text-app-muted-fg font-mono italic">{f.score}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )
    },
    {
      id: "preview",
      title: "Data Preview",
      desc: "Excel-like interface to review and modify data before extraction.",
      icon: <Table size={18} />,
      ui: (
        <div className="bg-app-card rounded-2xl border border-app-border shadow-2xl overflow-hidden">
          <div className="p-4 bg-app-card/50 flex justify-between items-center border-b border-app-border">
             <span className="text-[10px] font-bold text-app-muted-fg uppercase">Live Preview (2,400 Rows)</span>
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-app-muted"></div>
                <div className="w-2 h-2 rounded-full bg-app-muted"></div>
             </div>
          </div>
          <div className="divide-y divide-app-border">
             {[
               ["iPhone 15 Pro", "$999.00", "In Stock"],
               ["Pixel 8 Pro", "$899.00", "Low Stock"],
               ["Galaxy S24", "$799.00", "Out of Stock"]
             ].map((row, i) => (
               <div key={i} className="grid grid-cols-3 p-3 gap-4">
                  <div className="text-[11px] font-bold text-app-fg truncate">{row[0]}</div>
                  <div className="text-[11px] text-blue-400 font-mono">{row[1]}</div>
                  <div className="text-[11px] text-app-muted-fg">{row[2]}</div>
               </div>
             ))}
          </div>
        </div>
      )
    },
    {
      id: "export",
      title: "Export Anywhere",
      desc: "Native connectors to the tools you use every day.",
      icon: <Download size={18} />,
      ui: (
        <div className="grid grid-cols-2 gap-4">
           {[
             { name: "Google Sheets", icon: <FileSpreadsheet className="text-emerald-500" /> },
             { name: "Live API", icon: <Code2 className="text-blue-500" /> },
             { name: "Webhook", icon: <Zap className="text-orange-500" /> },
             { name: "CSV / Excel", icon: <Download className="text-app-muted-fg" /> }
           ].map(opt => (
             <div key={opt.name} className="bg-app-bg p-4 rounded-2xl border border-app-border flex flex-col items-center gap-3 hover:border-blue-500/30 transition-colors group cursor-pointer shadow-lg hover:shadow-blue-500/10">
                <div className="w-10 h-10 rounded-full bg-app-card flex items-center justify-center group-hover:scale-110 transition-transform">{opt.icon}</div>
                <span className="text-[10px] font-bold text-app-muted-fg uppercase group-hover:text-app-fg">{opt.name}</span>
             </div>
           ))}
        </div>
      )
    },
    {
      id: "templates",
      title: "Saved Templates",
      desc: "One click to re-run complex extractions across similar sites.",
      icon: <Layout size={18} />,
      ui: (
        <div className="space-y-3">
           {[
             { name: "Amazon Product Details", count: "14 fields", active: true },
             { name: "LinkedIn Lead List", count: "8 fields", active: false },
             { name: "Zillow Home Info", count: "22 fields", active: false }
           ].map((t, i) => (
             <div key={i} className={`p-4 rounded-xl border ${t.active ? 'bg-blue-600/10 border-blue-500/30' : 'bg-app-bg border-app-border'} flex items-center justify-between`}>
                <div>
                   <div className="text-xs font-bold text-app-fg mb-1">{t.name}</div>
                   <div className="text-[10px] text-app-muted-fg">{t.count}</div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.active ? 'bg-blue-600 text-white' : 'bg-app-card text-app-muted-fg'}`}>
                   <CheckCircle2 size={14} />
                </div>
             </div>
           ))}
        </div>
      )
    },
    {
      id: "automation",
      title: "Automation Scheduler",
      desc: "Run background crawls on an hourly, daily, or custom schedule.",
      icon: <Zap size={18} className="text-orange-500" />,
      ui: (
        <div className="bg-app-card p-6 rounded-2xl border border-app-border shadow-2xl">
           <div className="flex justify-between items-center mb-10">
              <div>
                 <div className="text-xs font-bold text-app-fg">Daily Stock Check</div>
                 <div className="text-[10px] text-app-muted-fg">12:00 AM PST</div>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase font-bold text-app-muted-fg tracking-tighter">
                 <span>Mon</span><span>Tue</span><span className="text-blue-400">Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="h-2 w-full bg-app-bg rounded-full overflow-hidden">
                 <div className="h-full w-2/3 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-blue-400 font-bold">
                 <span>Automation Cycle Active</span>
                 <span>68% Complete</span>
              </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <section className="px-4 sm:px-10 py-32 bg-app-bg relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-8 text-app-fg font-heading">
              Engineered for <br/>
              <span className="text-blue-500 font-heading">Data Perfection.</span>
            </h2>
            <div className="space-y-3">
              {features.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex items-center gap-4 ${
                    activeTab === i 
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                    : 'border-app-border bg-transparent hover:bg-app-card/50 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === i ? 'bg-blue-600 text-white' : 'bg-app-card text-app-muted-fg'}`}>
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-bold ${activeTab === i ? 'text-app-fg' : 'text-app-muted-fg'}`}>{f.title}</h3>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${activeTab === i ? 'rotate-90 text-app-fg' : 'text-app-muted-fg'}`} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-7 sticky top-32">
            <div className="relative min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-full max-w-lg">
                    <div className="mb-10 text-center lg:text-left">
                       <h3 className="text-3xl font-bold mb-4 text-app-fg font-heading">{features[activeTab].title}</h3>
                       <p className="text-app-muted-fg leading-relaxed max-w-sm mx-auto lg:mx-0 font-sans">{features[activeTab].desc}</p>
                    </div>
                    <div>
                       {features[activeTab].ui}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] -z-10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const WorkflowSection = () => {

  const steps = [
    {
      title: "Target website",
      desc: "Open any website, PDF, or document in your browser.",
      icon: <Globe size={24} />,
      badge: "Step 1"
    },
    {
      title: "Activate Datapilot",
      desc: "One click to launch the AI extension from your toolbar.",
      icon: <MousePointer2 size={24} />,
      badge: "Step 2"
    },
    {
      title: "Intelligent scan",
      desc: "AI identifies structures, tables, and lists automatically.",
      icon: <Cpu size={24} />,
      badge: "Step 3"
    },
    {
      title: "Extract precisely",
      desc: "Choose extraction type or give custom natural language commands.",
      options: ["Extract Leads", "Extract Products", "Extract Prices", "Custom Prompt"],
      icon: <Layout size={24} />,
      badge: "Step 4"
    },
    {
      title: "Review & Refine",
      desc: "Preview the table, edit fields, and clean data in the live editor.",
      icon: <Table size={24} />,
      badge: "Step 5"
    },
    {
      title: "Multi-Format Export",
      desc: "Sync instantly to your favorite tools and business databases.",
      options: ["CSV / Excel", "Google Sheets", "Live API", "Webhook"],
      icon: <FileSpreadsheet size={24} />,
      badge: "Step 6"
    }
  ];

  return (
    <section id="use-cases" className="px-4 sm:px-10 py-24 bg-app-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[160px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-app-fg font-heading">
            The Intelligent Workflow
          </h2>
          <p className="text-lg text-app-muted-fg font-sans">
            From raw web pages to structured data pipelines in under 30 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Decorative connector lines for desktop */}
          <div className="hidden lg:block absolute top-[100px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-app-border/50 to-transparent -z-10"></div>
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-app-card border border-app-border flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-all shadow-sm">
                  {step.icon}
                </div>
                <span className="text-[10px] font-bold text-app-muted-fg uppercase tracking-widest bg-app-bg px-2 py-1 rounded border border-app-border">
                  {step.badge}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors text-app-fg font-heading uppercase">{step.title}</h3>
              <p className="text-app-muted-fg text-sm leading-relaxed mb-6 font-sans">
                {step.desc}
              </p>

              {step.options && (
                <div className="flex flex-wrap gap-2 text-white">
                  {step.options.map(opt => (
                    <span key={opt} className="text-[10px] whitespace-nowrap bg-blue-600/10 border border-blue-500/20 px-2 py-1 rounded text-blue-400 font-bold uppercase tracking-widest">
                      {opt}
                    </span>
                  ))}
                </div>
              )}

              {/* Mobile connector */}
              {i < steps.length - 1 && (
                <div className="md:hidden h-12 w-px bg-app-border mx-auto my-4 mt-8"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FinalCTA = () => {
  return (
    <section className="px-4 sm:px-10 py-32 text-center bg-app-bg relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-app-fg font-heading">
          Stop Copying Data. <br />
          <span className="text-blue-500 text-glow-blue uppercase font-heading">Start Automating It.</span>
        </h2>
        <p className="mt-8 text-xl text-app-muted-fg max-w-2xl mx-auto font-sans">
          Scale your research and operations without the engineering overhead. Join 50,000+ data-driven professionals.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-white">
          <button className="rounded-xl bg-blue-600 px-10 py-5 font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 leading-none">
            Start Free
          </button>
          <button className="rounded-xl border border-app-border bg-app-card px-10 py-5 font-bold text-lg transition-all active:scale-95 flex items-center gap-2 text-app-fg">
            <Chrome size={20} /> Install Extension
          </button>
        </div>
      </div>
      
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
    </section>
  );
}

const PricingSection = ({ onNotify }: { onNotify: (m: string, t?: 'success' | 'error') => void }) => {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      desc: "For individuals exploring AI extraction.",
      features: [
        "1,000 Data Extractions",
        "Community Support",
        "Chrome Extension Access",
        "CSV Export Only",
      ],
      button: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      desc: "For data teams and professionals.",
      features: [
        "Unlimited Extractions",
        "Priority AI Processing",
        "Google Sheets Sync",
        "API & Webhook Support",
        "Scheduled Workflows",
      ],
      button: "Start Free Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For large scale operations.",
      features: [
        "Custom Schema Matching",
        "SSO & Security Compliance",
        "Dedicated Account Manager",
        "On-premise Deployment",
        "Volume Discounts",
      ],
      button: "Contact Sales",
      highlight: false
    }
  ];

  const handleSelect = (plan: string) => {
    onNotify(`${plan} plan selected! Our sales team will reach out.`);
  };

  return (
    <section id="pricing" className="px-4 sm:px-10 py-24 bg-app-bg border-t border-app-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-app-fg font-heading">
            Simple, Transparent <span className="text-blue-500">Pricing</span>
          </h2>
          <p className="text-app-muted-fg text-lg max-w-2xl mx-auto">
            Choose the plan that fits your current data needs. Scale as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col ${
                plan.highlight 
                ? 'bg-app-card border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-105 z-10' 
                : 'bg-app-card/50 border-app-border hover:border-app-muted'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-app-fg mb-2 font-heading">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-app-fg">{plan.price}</span>
                  <span className="text-app-muted-fg text-sm">{plan.period}</span>
                </div>
                <p className="text-app-muted-fg text-sm">{plan.desc}</p>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-app-muted-fg">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleSelect(plan.name)}
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
                  plan.highlight 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                  : 'bg-app-bg text-app-fg border border-app-border hover:bg-app-card'
                }`}
              >
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ResourcesSection = () => {
  const resources = [
    { title: "Documentation", desc: "Start extracting data in minutes with our API guides.", category: "Guides", icon: <Code2 size={24} /> },
    { title: "Case Studies", desc: "How top teams use Datapilot to scale their operations.", category: "Success Stories", icon: <Users size={24} /> },
    { title: "Webinars", desc: "Live walkthroughs of advanced extraction techniques.", category: "Learning", icon: <Play size={24} /> },
    { title: "AI Updates", desc: "The latest in neural extraction and field mapping.", category: "Blog", icon: <Sparkles size={24} /> },
  ];

  return (
    <section id="resources" className="px-4 sm:px-10 py-24 bg-app-bg border-t border-app-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-center md:text-left">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-app-fg font-heading">
              Resources & <span className="text-blue-500">Learning</span>
            </h2>
            <p className="text-app-muted-fg text-lg max-w-xl">
              Everything you need to master automated web data extraction.
            </p>
          </div>
          <button className="px-8 py-3 bg-app-card border border-app-border rounded-xl font-bold text-app-fg hover:border-blue-500/30 transition-all">
            Browse All Resources
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resources.map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl bg-app-card border border-app-border hover:border-blue-500/30 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                {res.icon}
              </div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-2">{res.category}</span>
              <h3 className="text-xl font-bold text-app-fg mb-4 font-heading group-hover:text-blue-500 transition-colors uppercase">{res.title}</h3>
              <p className="text-app-muted-fg text-sm leading-relaxed mb-6 font-sans">
                {res.desc}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-app-fg opacity-0 group-hover:opacity-100 transition-opacity">
                Read More <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-app-bg pt-24 pb-12 px-4 sm:px-10 border-t border-app-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md text-white">D</div>
             <span className="font-bold text-app-fg">Eurosia Datapilot AI</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-app-muted-fg uppercase tracking-widest">
            <a href="#" className="hover:text-app-fg transition-colors">Privacy</a>
            <a href="#" className="hover:text-app-fg transition-colors">Terms</a>
            <a href="#" className="hover:text-app-fg transition-colors">Contact</a>
          </div>
          <p className="text-xs text-app-muted-fg opacity-60 font-sans">© 2024 Eurosia Datapilot AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-fg selection:bg-blue-500/30 transition-colors duration-300">
      <div className="fixed top-0 left-0 z-[9999] bg-red-600 text-white text-[10px] px-2 font-bold uppercase transition-transform hover:scale-105 cursor-default">App Active</div>
      
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/10 text-white font-bold text-sm flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-blue-600/90 shadow-blue-500/20' : 'bg-red-600/90 shadow-red-500/20'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar onLogin={() => setIsLoggedIn(true)} />
      <main>
        {isLoggedIn ? (
          <Dashboard onNotify={showNotification} onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <>
            <Hero />
            <HowItWorks />
            <AISandbox onNotify={showNotification} />
            <ProductDemo />
            <TestimonialSection />
            <Features />
            <ProductTour />
            <WorkflowSection />
            <PricingSection onNotify={showNotification} />
            <ResourcesSection />
            <FinalCTA />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

