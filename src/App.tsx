import React, { useState, useCallback } from 'react';
import { 
  Search, 
  User, 
  Building2, 
  Globe, 
  Linkedin, 
  Briefcase, 
  Target, 
  FileText, 
  Download, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { 
  SellerInfo, 
  BuyerInfo, 
  initialSeller, 
  initialBuyer, 
  fetchAutofillData, 
  generateDeepReport 
} from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [seller, setSeller] = useState<SellerInfo>(initialSeller);
  const [buyer, setBuyer] = useState<BuyerInfo>(initialBuyer);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');

  const [hasFetched, setHasFetched] = useState(false);

  const handleFetch = async () => {
    const urls = [
      seller.linkedinUrl, 
      seller.website, 
      buyer.linkedinUrl, 
      buyer.website
    ].filter(Boolean);

    if (urls.length === 0) return;

    setIsFetching(true);
    try {
      const data = await fetchAutofillData(urls);
      if (data.seller) setSeller(prev => ({ ...prev, ...data.seller }));
      if (data.buyer) setBuyer(prev => ({ ...prev, ...data.buyer }));
      setHasFetched(true);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setActiveTab('preview');
    try {
      const result = await generateDeepReport(seller, buyer);
      setReport(result);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    const title = `Comprehensive Sales Intelligence Report — ${buyer.name || buyer.company || 'Client'}`;
    
    doc.setFontSize(22);
    doc.setFont('playfair', 'bold');
    doc.text(title, 20, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const splitText = doc.splitTextToSize(report.replace(/#/g, ''), 170);
    doc.text(splitText, 20, 50);
    
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">NEXUS <span className="text-slate-400 font-sans font-light text-sm ml-1 uppercase tracking-widest">Intelligence</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('input')}
              className={cn(
                "text-sm font-medium transition-colors",
                activeTab === 'input' ? "text-black" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Configuration
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={cn(
                "text-sm font-medium transition-colors",
                activeTab === 'preview' ? "text-black" : "text-slate-400 hover:text-slate-600"
              )}
              disabled={!report && !isAnalyzing}
            >
              Report Preview
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'input' ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Forms */}
              <div className="lg:col-span-8 space-y-8">
                {/* Seller Section */}
                <section className="glass-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">User Identity (Seller)</h2>
                        <p className="text-sm text-slate-500">Enter URLs to autofill your profile.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">LinkedIn URL</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          className="input-field pl-10" 
                          placeholder="linkedin.com/in/..."
                          value={seller.linkedinUrl}
                          onChange={e => setSeller({...seller, linkedinUrl: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          className="input-field pl-10" 
                          placeholder="https://acme.com"
                          value={seller.website}
                          onChange={e => setSeller({...seller, website: e.target.value})}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {(hasFetched || seller.name) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Sarah Jenkins"
                              value={seller.name}
                              onChange={e => setSeller({...seller, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Job Profile</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Senior Account Executive"
                              value={seller.jobProfile}
                              onChange={e => setSeller({...seller, jobProfile: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Acme Corp"
                              value={seller.company}
                              onChange={e => setSeller({...seller, company: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industry</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Enterprise SaaS"
                              value={seller.industry}
                              onChange={e => setSeller({...seller, industry: e.target.value})}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Product Focus & Value Prop</label>
                            <textarea 
                              className="input-field min-h-[100px] resize-none" 
                              placeholder="Describe what you sell and the core value it provides..."
                              value={seller.valueProp}
                              onChange={e => setSeller({...seller, valueProp: e.target.value})}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                {/* Buyer Section */}
                <section className="glass-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Target className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Client / Buyer Identity</h2>
                        <p className="text-sm text-slate-500">Enter URLs to autofill client details.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">LinkedIn URL</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          className="input-field pl-10" 
                          placeholder="linkedin.com/in/..."
                          value={buyer.linkedinUrl}
                          onChange={e => setBuyer({...buyer, linkedinUrl: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          className="input-field pl-10" 
                          placeholder="https://client.com"
                          value={buyer.website}
                          onChange={e => setBuyer({...buyer, website: e.target.value})}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {(hasFetched || buyer.name) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Name</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Michael Chen"
                              value={buyer.name}
                              onChange={e => setBuyer({...buyer, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Job Title</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. CTO"
                              value={buyer.jobTitle}
                              onChange={e => setBuyer({...buyer, jobTitle: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Company</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Global Logistics Inc"
                              value={buyer.company}
                              onChange={e => setBuyer({...buyer, company: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industry</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              placeholder="e.g. Supply Chain"
                              value={buyer.industry}
                              onChange={e => setBuyer({...buyer, industry: e.target.value})}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pain Points / Interests</label>
                            <textarea 
                              className="input-field min-h-[100px] resize-none" 
                              placeholder="What keeps them up at night? Recent news? Strategic goals?"
                              value={buyer.painPoints}
                              onChange={e => setBuyer({...buyer, painPoints: e.target.value})}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </div>

              {/* Right Column: Actions & Summary */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-6 sticky top-24">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Engine Controls</h3>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={handleFetch}
                      disabled={isFetching || (!seller.linkedinUrl && !buyer.linkedinUrl && !seller.website && !buyer.website)}
                      className="btn-secondary w-full group"
                    >
                      {isFetching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      Fetch Information
                    </button>
                    
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !seller.name || !buyer.name}
                      className="btn-primary w-full group"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      )}
                      Start Deep Analysis
                    </button>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">Intelligence Status</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Seller Profile</span>
                        <span className={cn(
                          "font-medium",
                          seller.name ? "text-emerald-600" : "text-slate-300"
                        )}>{seller.name ? "Complete" : "Missing"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Buyer Profile</span>
                        <span className={cn(
                          "font-medium",
                          buyer.name ? "text-emerald-600" : "text-slate-300"
                        )}>{buyer.name ? "Complete" : "Missing"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Alignment Score</span>
                        <span className="text-slate-300 font-medium">Pending Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black text-white p-6 rounded-2xl">
                  <h4 className="text-sm font-bold mb-2">Pro Tip</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Provide LinkedIn URLs for both parties to unlock psychological profiling and communication style analysis.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold">Intelligence Report</h2>
                  <p className="text-slate-500">Strategic analysis for {buyer.company || buyer.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('input')}
                    className="btn-secondary py-2 px-4"
                  >
                    Edit Parameters
                  </button>
                  <button 
                    onClick={exportPDF}
                    className="btn-primary py-2 px-4"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>
              </div>

              <div className="glass-card p-12 min-h-[800px]">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full py-40 gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-black rounded-full animate-spin"></div>
                      <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-black" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-serif font-bold">Synthesizing Intelligence...</h3>
                      <p className="text-slate-400 text-sm max-w-xs">Our engine is mapping organizational context and buyer psychology.</p>
                    </div>
                    
                    <div className="w-full max-w-xs bg-slate-100 h-1 rounded-full overflow-hidden mt-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="h-full bg-black"
                      />
                    </div>
                  </div>
                ) : report ? (
                  <div className="markdown-body">
                    <Markdown
                      components={{
                        blockquote: ({ children }) => {
                          const content = React.Children.toArray(children).map(child => 
                            typeof child === 'string' ? child : 
                            (child as any)?.props?.children?.[0] || ''
                          ).join('');

                          if (content.includes('[!KEY_INSIGHT]')) {
                            return (
                              <div className="callout-box callout-key-insight">
                                <span className="callout-label">Key Insight</span>
                                {React.Children.map(children, child => {
                                  if (typeof child === 'string') return child.replace('[!KEY_INSIGHT]', '');
                                  if ((child as any)?.props?.children) {
                                    return React.cloneElement(child as any, {
                                      children: (child as any).props.children.map((c: any) => 
                                        typeof c === 'string' ? c.replace('[!KEY_INSIGHT]', '') : c
                                      )
                                    });
                                  }
                                  return child;
                                })}
                              </div>
                            );
                          }
                          if (content.includes('[!HIDDEN_RISK]')) {
                            return (
                              <div className="callout-box callout-hidden-risk">
                                <span className="callout-label">Hidden Risk</span>
                                {React.Children.map(children, child => {
                                  if (typeof child === 'string') return child.replace('[!HIDDEN_RISK]', '');
                                  if ((child as any)?.props?.children) {
                                    return React.cloneElement(child as any, {
                                      children: (child as any).props.children.map((c: any) => 
                                        typeof c === 'string' ? c.replace('[!HIDDEN_RISK]', '') : c
                                      )
                                    });
                                  }
                                  return child;
                                })}
                              </div>
                            );
                          }
                          if (content.includes('[!TACTICAL_EDGE]')) {
                            return (
                              <div className="callout-box callout-tactical-edge">
                                <span className="callout-label">Tactical Edge</span>
                                {React.Children.map(children, child => {
                                  if (typeof child === 'string') return child.replace('[!TACTICAL_EDGE]', '');
                                  if ((child as any)?.props?.children) {
                                    return React.cloneElement(child as any, {
                                      children: (child as any).props.children.map((c: any) => 
                                        typeof c === 'string' ? c.replace('[!TACTICAL_EDGE]', '') : c
                                      )
                                    });
                                  }
                                  return child;
                                })}
                              </div>
                            );
                          }
                          return <blockquote>{children}</blockquote>;
                        }
                      }}
                    >
                      {report}
                    </Markdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                    <FileText className="w-16 h-16 mb-4 opacity-20" />
                    <p>No report generated yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold">NEXUS</span>
          </div>
          
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-black transition-colors">Methodology</a>
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Enterprise</a>
          </div>
          
          <p className="text-xs text-slate-400">© 2026 Nexus Intelligence Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
