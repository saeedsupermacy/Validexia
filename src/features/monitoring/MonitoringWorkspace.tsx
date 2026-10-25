// src/features/monitoring/MonitoringWorkspace.tsx
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
 Activity, Search, ShieldAlert, FileText, 
 Network, FileSignature, AlertCircle, Eye, EyeOff, 
 Radio, Clock, ArrowRight, Zap, CheckCircle2, RotateCw, SlidersHorizontal
, X} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, Eyebrow} from '../../shared/ui/core';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';
import { resolveVendorId } from '../../data/vendors';
import { DeepLinkBanner } from '../../shared/ui/DeepLinkBanner';

export type SignalCategory = 'material' | 'vendor' | 'evidence' | 'security' | 'dependency' | 'contract';

export interface SignalRecord {
 id: string;
 vendorName: string;
 category: SignalCategory;
 title: string;
 timestamp: string;
 source: string;
 previousState?: string;
 newState?: string;
 isNewSinceLastLogin: boolean;
}

const DEV_SIGNALS: SignalRecord[] = [
 {
 id: 'sig-01',
 vendorName: 'Apex Gateway Payments',
 category: 'material',
 title: 'Acquisition Announcement Detected',
 timestamp: 'Oct 06, 2026 - 08:14 UTC',
 source: 'Financial RSS Scraper (Daily Sync)',
 previousState: 'Independent Entity',
 newState: 'Acquired by GlobalTech Financials',
 isNewSinceLastLogin: true
 },
 {
 id: 'sig-02',
 vendorName: 'CloudScale Infrastructure',
 category: 'evidence',
 title: 'New SOC 2 Type II Report Uploaded',
 timestamp: 'Oct 05, 2026 - 22:30 UTC',
 source: 'Vendor Portal Webhook',
 previousState: 'SOC 2 Expiring (Oct 2026)',
 newState: 'Valid through Oct 2027',
 isNewSinceLastLogin: true
 },
 {
 id: 'sig-03',
 vendorName: 'SecureAuth Identity',
 category: 'security',
 title: 'CVE-2026-8812 Published for core dependency',
 timestamp: 'Oct 05, 2026 - 19:45 UTC',
 source: 'NVD Threat Intel API (Hourly Sync)',
 isNewSinceLastLogin: true
 },
 {
 id: 'sig-04',
 vendorName: 'DataFlow Analytics',
 category: 'dependency',
 title: 'Subprocessor List Updated',
 timestamp: 'Oct 04, 2026 - 11:00 UTC',
 source: 'Legal Terms OCR Monitor (Weekly Run)',
 previousState: '4 Authorized Subprocessors',
 newState: '6 Authorized Subprocessors (+2 Offshore)',
 isNewSinceLastLogin: false
 },
 {
 id: 'sig-05',
 vendorName: 'Synapse AI Services',
 category: 'contract',
 title: 'MSA Renewal Approaching',
 timestamp: 'Oct 03, 2026 - 09:00 UTC',
 source: 'ERP Contract Sync (Nightly batch)',
 previousState: 'Active',
 newState: 'Expiring in 60 days',
 isNewSinceLastLogin: false
 },
 {
 id: 'sig-06',
 vendorName: 'Global Logistics API',
 category: 'vendor',
 title: 'CISO Departure Noted',
 timestamp: 'Oct 02, 2026 - 14:20 UTC',
 source: 'LinkedIn Exec Monitor API',
 isNewSinceLastLogin: false
 }
];

export function MonitoringWorkspace() {
 const [signals, setSignals] = useState<SignalRecord[]>(DEV_SIGNALS);
 const [activeStream, setActiveStream] = useState<SignalCategory | 'all'>('all');
 const [showOnlyNew, setShowOnlyNew] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
  const [deepLink, setDeepLink] = useState<string | null>(null);

  // Deep link: pre-fill search from another tab (accepts search or vendorName)
  useEffect(() => {
    const params = getNavParams();
    const q = params.search || params.vendorName;
    if (q && typeof q === 'string') {
      setSearchQuery(q as string);
      setDeepLink(q as string);
      clearNavParams();
    }
  }, []);
 const [sourceFilter, setSourceFilter] = useState<string>('All');
 const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
 const [selectedSignal, setSelectedSignal] = useState<SignalRecord | null>(null);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (isFilterDropdownOpen) setIsFilterDropdownOpen(false);
 if (selectedSignal) setSelectedSignal(null);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [isFilterDropdownOpen, selectedSignal]);

 // Source options are derived from the actual signal data (text before the sync-frequency
 // parenthesis) so every signal is always reachable under its own source — no source can be
 // silently unfilterable as new feeds are added.
 const sourceOptions = useMemo(
 () => ['All', ...Array.from(new Set(signals.map(s => s.source.split(' (')[0])))],
 [signals]
 );
 const baseSource = (source: string) => source.split(' (')[0];

 const filteredSignals = signals.filter(s => {
 const matchesStream = activeStream === 'all' || s.category === activeStream;
 const matchesNew = !showOnlyNew || s.isNewSinceLastLogin;
 const matchesSource = sourceFilter === 'All' || baseSource(s.source) === sourceFilter;
 const matchesSearch = s.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
 s.title.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesStream && matchesNew && matchesSource && matchesSearch;
 });

 const getCategoryIcon = (category: SignalCategory) => {
 switch (category) {
 case 'material': return <AlertCircle aria-hidden="true" size={16} className="text-accent" />;
 case 'vendor': return <Eye aria-hidden="true" size={16} className="text-status-info" />;
 case 'evidence': return <FileText aria-hidden="true" size={16} className="text-info" />;
 case 'security': return <ShieldAlert aria-hidden="true" size={16} className="text-risk-critical" />;
 case 'dependency': return <Network aria-hidden="true" size={16} className="text-risk-high" />;
 case 'contract': return <FileSignature aria-hidden="true" size={16} className="text-status-success" />;
 }
 };

 const getCategoryLabel = (category: SignalCategory) => {
 switch (category) {
 case 'material': return 'Material Changes';
 case 'vendor': return 'Vendor Signals';
 case 'evidence': return 'Evidence Changes';
 case 'security': return 'Security Signals';
 case 'dependency': return 'Dependency Changes';
 case 'contract': return 'Contract Changes';
 }
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Monitoring workspace loaded. {filteredSignals.length} signal updates match your current filter and stream criteria.
 </div>

 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Program</Eyebrow>
 <h1 className="text-page-title flex items-center gap-3">Monitoring & Signal Intelligence
 <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-status-warning/10 text-status-warning border border-status-warning/20">Simulated Feed</span>
 </h1>
          {deepLink && (
            <div className="mt-3">
              <DeepLinkBanner
                label={`Search = "${deepLink}"`}
                source="Command Center"
                onClear={() => { setDeepLink(null); setSearchQuery(''); }}
              />
            </div>
          )}
 <div className="flex items-center gap-2 mt-2">
 <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-info/10 text-info text-xs font-semibold uppercase tracking-wider">
 <Zap aria-hidden="true" size={12} className="fill-info" />
 {signals.filter(s => s.isNewSinceLastLogin).length} New Signals
 </span>
 <span className="text-xs text-text-secondary">Since your last session on Oct 5, 14:00 UTC</span>
 </div>
 </div>
 
 <div className="flex items-center gap-3">
 <Button 
 type="button"
 variant={showOnlyNew ? 'primary' : 'secondary'} 
 size="sm" 
 onClick={() => setShowOnlyNew(!showOnlyNew)}
 className="text-xs h-9"
 >
 {showOnlyNew ? <Eye aria-hidden="true" size={14} className="mr-1.5" /> : <EyeOff aria-hidden="true" size={14} className="mr-1.5" />}
 {showOnlyNew ? 'Showing Only New' : 'Showing All History'}
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 <div className="lg:col-span-3 space-y-6">
 <Card className="shadow-sm overflow-hidden">
 <CardHeader className="border-b border-border px-4 py-3 bg-surface-hover/35">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider">Signal Streams</CardTitle>
 </CardHeader>
 <div className="flex flex-col p-2 space-y-1" role="group" aria-label="Signal Streams Navigation">
 <button
 type="button"
 onClick={() => setActiveStream('all')}
 className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 activeStream === 'all' ? 'bg-surface-hover text-text-primary border border-border-strong shadow-sm' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent'
 }`}
 >
 <Activity aria-hidden="true" size={16} /> All Streams
 </button>
 {(['material', 'vendor', 'evidence', 'security', 'dependency', 'contract'] as SignalCategory[]).map(cat => (
 <button
 key={cat}
 type="button"
 onClick={() => setActiveStream(cat)}
 className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 activeStream === cat ? 'bg-surface-hover text-text-primary border border-border-strong shadow-sm' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent'
 }`}
 >
 <div className="flex items-center gap-2.5">
 {getCategoryIcon(cat)}
 {getCategoryLabel(cat)}
 </div>
 {signals.filter(s => s.category === cat && s.isNewSinceLastLogin).length > 0 && (
 <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-info"></span>
 )}
 </button>
 ))}
 </div>
 </Card>

 <Card className="shadow-sm overflow-hidden border-border">
 <CardHeader className="border-b border-border-subtle px-4 py-3 bg-base">
 <div className="flex items-center justify-between">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
 <Radio aria-hidden="true" size={14} className="text-text-tertiary" /> 
 Monitoring Health
 </CardTitle>
 <span aria-hidden="true" className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
 </div>
 </CardHeader>
 <CardContent className="p-0 divide-y divide-border-subtle text-xs">
 <div className="p-3 flex justify-between items-start hover:bg-surface-hover transition-colors">
 <div>
 <div className="font-semibold text-text-primary">NVD Threat Intel API</div>
 <div className="text-text-tertiary text-[10px] mt-0.5">Polling interval: 1 hour</div>
 </div>
 <div className="text-right">
 <div className="text-status-success font-bold flex items-center justify-end gap-1"><CheckCircle2 aria-hidden="true" size={12} /> Syncing</div>
 <div className="text-text-tertiary text-[10px] mt-0.5">14 mins ago</div>
 </div>
 </div>
 <div className="p-3 flex justify-between items-start hover:bg-surface-hover transition-colors">
 <div>
 <div className="font-semibold text-text-primary">Vendor Portal Webhooks</div>
 <div className="text-text-tertiary text-[10px] mt-0.5">Push based</div>
 </div>
 <div className="text-right">
 <div className="text-status-success font-bold flex items-center justify-end gap-1"><CheckCircle2 aria-hidden="true" size={12} /> Listening</div>
 <div className="text-text-tertiary text-[10px] mt-0.5">Real-time</div>
 </div>
 </div>
 <div className="p-3 flex justify-between items-start hover:bg-surface-hover transition-colors">
 <div>
 <div className="font-semibold text-text-primary">Legal Terms OCR</div>
 <div className="text-text-tertiary text-[10px] mt-0.5">Batch processing</div>
 </div>
 <div className="text-right">
 <div className="text-text-secondary font-bold flex items-center justify-end gap-1"><RotateCw aria-hidden="true" size={12} /> Idle</div>
 <div className="text-text-tertiary text-[10px] mt-0.5">Next run: Sunday</div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="lg:col-span-9 space-y-4">
 <div className="flex items-center gap-3 relative">
 <div className="relative flex-1">
 <label htmlFor="monitoringSearchInput" className="sr-only">Search signals</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="monitoringSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder={`Search ${activeStream === 'all' ? 'all signals' : getCategoryLabel(activeStream).toLowerCase()}...`}
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="relative">
 <Button 
 type="button"
 variant={sourceFilter !== 'All' ? 'primary' : 'secondary'} 
 onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
 className="h-10 px-4 text-xs gap-2 font-semibold"
 >
 <SlidersHorizontal aria-hidden="true" size={14} />
 <span>Source: {sourceFilter}</span>
 </Button>

 {isFilterDropdownOpen && (
 <div className="absolute right-0 mt-2 w-64 bg-surface border border-border-strong rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in duration-150">
 <div className="flex items-center justify-between border-b border-border pb-2">
 <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">Filter By Source</span>
 <button 
 type="button"
 onClick={() => { setSourceFilter('All'); setIsFilterDropdownOpen(false); }} 
 className="text-xs text-info hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-info rounded"
 >
 Reset
 </button>
 </div>
 <div className="space-y-1">
 {sourceOptions.map(src => (
 <button
 key={src}
 type="button"
 onClick={() => { setSourceFilter(src); setIsFilterDropdownOpen(false); }}
 className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 sourceFilter === src ? 'bg-surface-hover font-bold text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
 }`}
 >
 {src === 'All' ? 'All Sources' : src}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="space-y-3">
 {filteredSignals.length > 0 ? (
 filteredSignals.map(signal => (
 <div 
 key={signal.id} 
 tabIndex={0}
 role="button"
 aria-label={`Signal alert: ${signal.title} for ${signal.vendorName}`}
 onClick={() => setSelectedSignal(signal)}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSignal(signal); } }}
 className={`bg-surface border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer group focus:outline-none focus:ring-2 focus:ring-info ${
 signal.isNewSinceLastLogin 
 ? 'border-info/30 shadow-sm' 
 : 'border-border'
 }`}
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex gap-3">
 <div aria-hidden="true" className="p-2 rounded-lg bg-base border border-border shrink-0 self-start">
 {getCategoryIcon(signal.category)}
 </div>
 
 <div className="space-y-1.5">
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono font-bold text-text-primary bg-base px-2 py-0.5 rounded border border-border">
 {signal.vendorName}
 </span>
 {signal.isNewSinceLastLogin && (
 <span className="text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info px-1.5 py-0.5 rounded">
 New
 </span>
 )}
 </div>
 
 <h3 className="text-sm font-bold text-text-primary group-hover:text-info transition-colors m-0">
 {signal.title}
 </h3>

 {(signal.previousState || signal.newState) && (
 <div className="flex items-center gap-3 pt-1 text-xs">
 {signal.previousState && (
 <div className="text-text-tertiary line-through decoration-text-text-tertiary/50">
 {signal.previousState}
 </div>
 )}
 {signal.previousState && signal.newState && (
 <ArrowRight aria-hidden="true" size={12} className="text-text-tertiary" />
 )}
 {signal.newState && (
 <div className="font-semibold text-text-primary bg-surface-hover px-1.5 py-0.5 rounded">
 {signal.newState}
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 <div className="text-right shrink-0 space-y-1">
 <div className="flex items-center justify-end gap-1 text-xs font-mono text-text-tertiary">
 <Clock aria-hidden="true" size={12} /> {signal.timestamp}
 </div>
 <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
 Source: {signal.source}
 </div>
 </div>
 </div>
 </div>
 ))
 ) : (
 <EmptyState
 icon={Activity}
 title={deepLink ? `No Results for "${deepLink}"` : "No Monitoring Signals Found"}
 description={deepLink ? "No records match this deep link. The item may have been resolved, archived, or renamed." : "Zero telemetry updates or vendor shifts match your stream or search filters."}
 whatItIs="Real-time monitoring log tracking vendor data breaches, news, and infrastructure signals."
 whyItsEmpty="No signals match the selected stream category or filter criteria."
 actionLabel={deepLink ? "Clear Deep Link" : "Reset All Filters"}
 onAction={() => { setDeepLink(null); setSearchQuery(''); setActiveStream('all'); setSourceFilter('All'); setShowOnlyNew(false); }}
 />
 )}
 </div>
 </div>
 </div>
 {selectedSignal && createPortal(
 <div role="dialog" aria-modal="true" aria-labelledby="signal-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200" onClick={() => setSelectedSignal(null)}>
 <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-start justify-between">
 <div>
 <h2 id="signal-title" className="text-base font-bold text-text-primary m-0">{selectedSignal.title}</h2>
 <p className="text-sm text-text-secondary mt-1">{selectedSignal.vendorName} · {selectedSignal.timestamp}</p>
 </div>
 <button type="button" onClick={() => setSelectedSignal(null)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-info" aria-label="Close">
 <X size={18} />
 </button>
 </div>
 {(selectedSignal.previousState || selectedSignal.newState) && (
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Previous</div>
 <div className="text-sm text-text-primary mt-1">{selectedSignal.previousState || '—'}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Current</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedSignal.newState || '—'}</div>
 </div>
 </div>
 )}
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Source</div>
 <div className="text-sm text-text-primary mt-1">{selectedSignal.source}</div>
 </div>
 <div className="flex justify-end gap-2">
 <button type="button" onClick={() => { setSelectedSignal(null); { const vid = resolveVendorId(selectedSignal.vendorName); navigateTo('vendors', vid ? { vendorId: vid } : { vendorName: selectedSignal.vendorName }); } }} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-info">
 View Vendor
 </button>
 <button type="button" onClick={() => { setSignals(prev => prev.filter(sg => sg.id !== selectedSignal.id)); setSelectedSignal(null); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-info">
 Dismiss
 </button>
 </div>
 </div>
 </div>,
 document.body)}
 </div>
 );
}