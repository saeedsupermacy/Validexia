// src/features/risk-events/RiskEventsWorkspace.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
 Search, ShieldAlert, ArrowRight, Clock 
, X} from 'lucide-react';
import { Card, CardContent, EmptyState, Eyebrow} from '../../shared/ui/core';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';
import { resolveVendorId } from '../../data/vendors';
import { DeepLinkBanner } from '../../shared/ui/DeepLinkBanner';

export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskStatus = 'Open' | 'Mitigating' | 'Resolved' | 'Accepted';

export interface RiskEventRecord {
 id: string;
 title: string;
 vendorName: string;
 severity: RiskSeverity;
 status: RiskStatus;
 detectedDate: string;
 source: string;
}

const DEV_RISK_EVENTS: RiskEventRecord[] = [
 { id: 'RE-2026-044', title: 'AWS US-East Latency Spike & Data Unavailability', vendorName: 'CloudScale Infrastructure', severity: 'High', status: 'Resolved', detectedDate: 'Oct 01, 2026', source: 'Infrastructure Telemetry' },
 { id: 'RE-2026-118', title: 'Edge Cipher Deprecation Warning (TLS 1.1)', vendorName: 'Fastly Global CDN', severity: 'Medium', status: 'Mitigating', detectedDate: 'Oct 05, 2026', source: 'Vulnerability Scan' },
 { id: 'RE-2026-204', title: 'SMS Carrier Gateway Outage - MFA Bypass Risk', vendorName: 'Twilio Verify', severity: 'Critical', status: 'Open', detectedDate: 'Oct 06, 2026', source: 'NVD Threat Intel API' },
 { id: 'RE-2026-302', title: 'DPA Region Flag - Unauthorized EU Data Transfer', vendorName: 'Snowflake Data Cloud', severity: 'High', status: 'Open', detectedDate: 'Oct 03, 2026', source: 'Legal Term OCR' },
 { id: 'RE-2026-310', title: 'Dark Web Credential Exposure - Institutional Service Accounts', vendorName: 'Apex Gateway', severity: 'High', status: 'Open', detectedDate: 'Oct 09, 2026', source: 'Dark Web Monitoring' }
];

export function RiskEventsWorkspace() {
 const [events, setEvents] = useState<RiskEventRecord[]>(DEV_RISK_EVENTS);
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
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (deepLink && highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [deepLink]);
 const [severityFilter, setSeverityFilter] = useState<string>('All');
 const [statusFilter, setStatusFilter] = useState<string>('All');

 const [selectedEvent, setSelectedEvent] = useState<RiskEventRecord | null>(null);

 // Escape closes the detail modal (backdrop click and the X button also close it)
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && selectedEvent) setSelectedEvent(null);
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedEvent]);

 const updateEventStatus = (id: string, status: RiskStatus) => {
 setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status } : ev));
 setSelectedEvent(prev => prev && prev.id === id ? { ...prev, status } : prev);
 };

 const STATUS_TRANSITIONS: Record<RiskStatus, RiskStatus[]> = {
 'Open': ['Mitigating', 'Accepted', 'Resolved'],
 'Mitigating': ['Open', 'Resolved'],
 'Resolved': ['Open'],
 'Accepted': ['Open'],
 };

 const STATUS_ACTION_LABELS: Record<RiskStatus, string> = {
 'Mitigating': 'Start Mitigation',
 'Accepted': 'Accept Risk',
 'Resolved': 'Mark Resolved',
 'Open': 'Reopen',
 };

 const filteredEvents = useMemo(() => {
 return events.filter(ev => {
 const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesSeverity = severityFilter === 'All' || ev.severity === severityFilter;
 const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;
 return matchesSearch && matchesSeverity && matchesStatus;
 });
 }, [events, searchQuery, severityFilter, statusFilter]);

 const getSeverityBadge = (sev: RiskSeverity) => {
 const styles = {
 'Critical': 'bg-risk-critical/10 text-risk-critical ',
 'High': 'bg-risk-high/10 text-risk-high ',
 'Medium': 'bg-status-warning/10 text-status-warning ',
 'Low': 'bg-status-success/10 text-status-success '
 };
 return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[sev]}`}>{sev}</span>;
 };

 const getStatusBadge = (status: RiskStatus) => {
 const styles = {
 'Open': 'text-risk-critical',
 'Mitigating': 'text-info',
 'Resolved': 'text-status-success',
 'Accepted': 'text-text-tertiary'
 };
 return <span className={`font-semibold text-xs ${styles[status]}`}>{status}</span>;
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Risk events workspace loaded. {filteredEvents.length} risk incidents match your filter criteria.
 </div>

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Intelligence</Eyebrow>
 <h1 className="text-page-title">Risk Event Register</h1>
          {deepLink && (
            <div className="mt-3">
              <DeepLinkBanner
                label={`Search = "${deepLink}"`}
                source="Command Center"
                onClear={() => { setDeepLink(null); setSearchQuery(''); }}
              />
            </div>
          )}
 <p className="text-body-secondary mt-1">Track security incidents, vulnerabilities, and materialized risks across your vendors.</p>
 </div>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <label htmlFor="riskEventsSearchInput" className="sr-only">Search risk events, vendors</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="riskEventsSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search risk events, vendors..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:ring-2 focus:ring-info shadow-sm focus:outline-none"
 />
 </div>
 <div className="flex items-center gap-3">
 <div>
 <label htmlFor="riskSeverityFilterSelect" className="sr-only">Filter by severity</label>
 <select 
 id="riskSeverityFilterSelect"
 value={severityFilter} 
 onChange={(e) => setSeverityFilter(e.target.value)} 
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Severities</option>
 <option value="Critical">Critical</option>
 <option value="High">High</option>
 <option value="Medium">Medium</option>
 <option value="Low">Low</option>
 </select>
 </div>
 <div>
 <label htmlFor="riskStatusFilterSelect" className="sr-only">Filter by status</label>
 <select 
 id="riskStatusFilterSelect"
 value={statusFilter} 
 onChange={(e) => setStatusFilter(e.target.value)} 
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Statuses</option>
 <option value="Open">Open</option>
 <option value="Mitigating">Mitigating</option>
 <option value="Resolved">Resolved</option>
 <option value="Accepted">Accepted</option>
 </select>
 </div>
 </div>
 </CardContent>
 </Card>

 {filteredEvents.length > 0 ? (
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Risk Event Register Incident Records</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Event ID & Title</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Vendor Source</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Severity</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Detected</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]"><span className="sr-only">Details</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredEvents.map((ev) => {
 const isHighlighted = !!deepLink && (ev.vendorName.toLowerCase().includes(deepLink.toLowerCase()) || ev.title.toLowerCase().includes(deepLink.toLowerCase()));
 return (
 <tr
 key={ev.id}
 ref={isHighlighted ? highlightRowRef : undefined}
 onClick={() => setSelectedEvent(ev)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedEvent(ev);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect risk event ${ev.id}: ${ev.title}`}
 className={`hover:bg-surface-hover transition-colors cursor-pointer group focus:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-info ${isHighlighted ? 'bg-info/10 shadow-[inset_3px_0_0_0_var(--color-info)]' : ''}`}
 >
 <td className="py-4 px-5 max-w-xs">
 <div className="font-mono text-xs font-bold text-info mb-1">{ev.id}</div>
 <div className="font-bold text-text-primary group-hover:text-info truncate">{ev.title}</div>
 </td>
 <td className="py-4 px-4 text-xs">
 <span className="font-semibold text-text-secondary block">{ev.vendorName}</span>
 <span className="text-[10px] text-text-tertiary font-mono">{ev.source}</span>
 </td>
 <td className="py-4 px-4">{getSeverityBadge(ev.severity)}</td>
 <td className="py-4 px-4">{getStatusBadge(ev.status)}</td>
 <td className="py-4 px-4 text-xs font-mono flex items-center gap-1.5 text-text-tertiary">
 <Clock aria-hidden="true" size={12} /> {ev.detectedDate}
 </td>
 <td className="py-4 px-5 text-right">
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
 className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-text-secondary bg-base hover:bg-surface-hover border border-border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 Inspect <ArrowRight aria-hidden="true" size={12} />
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 ) : (
 <EmptyState 
 icon={ShieldAlert} 
 title={deepLink ? `No Results for "${deepLink}"` : "No Risk Events Found"} 
 description={deepLink ? "No risk events match this deep link. The event may have been resolved or archived." : "No risk incidents match your current filters."} 
 whatItIs="The central ledger for materialized risk incidents and vulnerabilities." 
 whyItsEmpty={deepLink ? "The link points to a record that no longer matches." : "Filters eliminated all matching records."} 
 actionLabel={deepLink ? "Clear Deep Link" : "Clear Filters"} 
 onAction={() => { setDeepLink(null); setSearchQuery(''); setSeverityFilter('All'); setStatusFilter('All'); }} 
 />
 )}

 {selectedEvent && createPortal(
 <div role="dialog" aria-modal="true" aria-labelledby="risk-event-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200" onClick={() => setSelectedEvent(null)}>
 <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-start justify-between">
 <div>
 <span className="font-mono text-xs font-bold text-info bg-info/10 px-2 py-0.5 rounded border border-info/30">{selectedEvent.id}</span>
 <h2 id="risk-event-title" className="text-base font-bold text-text-primary mt-2 m-0">{selectedEvent.title}</h2>
 <p className="text-sm text-text-secondary mt-1">Vendor: {selectedEvent.vendorName}</p>
 </div>
 <button type="button" onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-info" aria-label="Close">
 <X size={18} />
 </button>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Severity</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvent.severity}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Status</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvent.status}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Detected</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvent.detectedDate}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Source</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvent.source}</div>
 </div>
 </div>
 <div className="flex flex-col gap-3 pt-1 border-t border-border-subtle">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary pt-3">Update Status</div>
 <div className="flex flex-wrap gap-2">
 {STATUS_TRANSITIONS[selectedEvent.status].map((next) => (
 <button
 key={next}
 type="button"
 onClick={() => updateEventStatus(selectedEvent.id, next)}
 className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-info"
 >
 {STATUS_ACTION_LABELS[next]}
 </button>
 ))}
 </div>
 </div>
 <div className="flex justify-end gap-2">
 <button type="button" onClick={() => { setSelectedEvent(null); { const vid = resolveVendorId(selectedEvent.vendorName); navigateTo('vendors', vid ? { vendorId: vid } : { vendorName: selectedEvent.vendorName }); } }} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-info">
 View Vendor
 </button>
 <button type="button" onClick={() => setSelectedEvent(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-info">
 Close
 </button>
 </div>
 </div>
 </div>,
 document.body)}
 </div>
 );
}