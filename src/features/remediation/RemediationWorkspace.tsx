// src/features/remediation/RemediationWorkspace.tsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';
import { resolveVendorId } from '../../data/vendors';
import { DeepLinkBanner } from '../../shared/ui/DeepLinkBanner';
import { 
 Search, Clock, User, ArrowRight, Building2, FileText, Link, X, Wrench 
} from 'lucide-react';
import { Card, CardContent, Button, EmptyState, Eyebrow} from '../../shared/ui/core';

import { getRemediations, isSlaBreached, type CanonicalRemediation, type RemediationStatus, type RemediationSeverity } from '../../data/remediation';

// Re-export shared types for backwards compatibility with existing imports
export type { RemediationStatus, RemediationSeverity };
export type RemediationRecord = CanonicalRemediation;

export function RemediationWorkspace() {
 const [items, setItems] = useState<RemediationRecord[]>(() => getRemediations());
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('All');
 const [severityFilter, setSeverityFilter] = useState<string>('All');
 const [agingFilter, setAgingFilter] = useState<string>('All');
 const [selectedItem, setSelectedItem] = useState<RemediationRecord | null>(null);

 // Deep link: pre-fill search from another tab (accepts search or vendorName)
 const [deepLink, setDeepLink] = useState<string | null>(null);
 const [deepLinkSource, setDeepLinkSource] = useState<string>('another tab');
 const [deepLinkVendor, setDeepLinkVendor] = useState<string | null>(null);
 const highlightRowRef = useRef<HTMLTableRowElement | null>(null);
 const AGING_LABELS: Record<string, string> = {
 under30: 'Aging < 30 days',
 '30to60': 'Aging 30–60 days',
 '60to90': 'Aging 60–90 days',
 breach: 'SLA breached (per severity)',
 };
 useEffect(() => {
 const params = getNavParams();
 const q = params.search || params.vendorName;
 if (q && typeof q === 'string') {
 setSearchQuery(q as string);
 setDeepLink(q as string);
 }
 if (params.vendorName && typeof params.vendorName === 'string') {
 setDeepLinkVendor(params.vendorName as string);
 }
 if (params.from && typeof params.from === 'string') {
 setDeepLinkSource(params.from as string);
 }
 if (params.agingBucket && typeof params.agingBucket === 'string' && AGING_LABELS[params.agingBucket as string]) {
 setAgingFilter(params.agingBucket as string);
 setDeepLink(AGING_LABELS[params.agingBucket as string]);
 }
 if (q || params.agingBucket) clearNavParams();
 }, []);
 useEffect(() => {
 if (deepLink && highlightRowRef.current) {
 highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 }, [deepLink]);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (selectedItem) setSelectedItem(null);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedItem]);

 const filteredItems = items.filter(item => {
 const matchesSearch = 
 item.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.owner.toLowerCase().includes(searchQuery.toLowerCase());
 
 const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
 const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
 const matchesAging =
 agingFilter === 'All' ? true :
 agingFilter === 'under30' ? item.agingDays < 30 :
 agingFilter === '30to60' ? item.agingDays >= 30 && item.agingDays < 60 :
 agingFilter === '60to90' ? item.agingDays >= 60 && item.agingDays <= 90 :
 isSlaBreached(item);

 return matchesSearch && matchesStatus && matchesSeverity && matchesAging;
 });

 const getStatusBadge = (status: RemediationStatus) => {
 const styles: Record<RemediationStatus, string> = {
 'Open': 'bg-surface-hover text-text-secondary border-border dark:bg-surface-hover dark:text-text-secondary',
 'In progress': 'bg-info/10 text-info border-info/30',
 'Blocked': 'bg-risk-critical/10 text-risk-critical ',
 'Awaiting vendor': 'bg-status-warning/10 text-status-warning ',
 'Ready for validation': 'bg-accent-muted text-accent ',
 'Resolved': 'bg-status-success/10 text-status-success ',
 'Accepted risk': 'bg-surface-hover text-text-tertiary border-border'
 };
 return <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>{status}</span>;
 };

 const getSeverityBadge = (severity: RemediationSeverity) => {
 const styles: Record<RemediationSeverity, string> = {
 'Critical': 'bg-risk-critical/10 text-risk-critical ',
 'High': 'bg-risk-high/10 text-risk-high ',
 'Moderate': 'bg-status-warning/10 text-status-warning ',
 'Low': 'bg-status-success/10 text-status-success '
 };
 return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[severity]}`}>{severity}</span>;
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Remediation workspace loaded. {filteredItems.length} corrective action items match your current filter criteria.
 </div>

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Program</Eyebrow>
 <h1 className="text-page-title">Remediation & Action Management</h1>
 {deepLink && (
 <div className="mt-3">
 <DeepLinkBanner
 label={`Search = "${deepLink}"`}
 source={deepLinkSource}
 count={filteredItems.length}
 backLabel={deepLinkVendor ? `Back to ${deepLinkVendor}` : undefined}
 onBack={deepLinkVendor ? () => {
 const vid = resolveVendorId(deepLinkVendor);
 navigateTo('vendors', vid ? { vendorId: vid } : { search: deepLinkVendor });
 } : undefined}
 onClear={() => { setDeepLink(null); setDeepLinkVendor(null); setSearchQuery(''); setAgingFilter('All'); }}
 />
 </div>
 )}
 <p className="text-body-secondary mt-1">
 Track active security findings, control gaps, and corrective action plans across your vendor ecosystem.
 </p>
 </div>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <label htmlFor="remediationSearchInput" className="sr-only">Search issues, vendors, owners, IDs</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="remediationSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search issues, vendors, owners, IDs..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="flex flex-wrap items-center gap-3">
 <div>
 <label htmlFor="remediationSeverityFilter" className="sr-only">Filter by severity</label>
 <select
 id="remediationSeverityFilter"
 value={severityFilter}
 onChange={(e) => setSeverityFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Severities</option>
 <option value="Critical">Critical</option>
 <option value="High">High</option>
 <option value="Moderate">Moderate</option>
 <option value="Low">Low</option>
 </select>
 </div>

 <div>
 <label htmlFor="remediationStatusFilter" className="sr-only">Filter by status</label>
 <select
 id="remediationStatusFilter"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Statuses</option>
 <option value="Open">Open</option>
 <option value="In progress">In progress</option>
 <option value="Blocked">Blocked</option>
 <option value="Awaiting vendor">Awaiting vendor</option>
 <option value="Ready for validation">Ready for validation</option>
 <option value="Resolved">Resolved</option>
 <option value="Accepted risk">Accepted risk</option>
 </select>
 </div>

 <div>
 <label htmlFor="remediationAgingFilter" className="sr-only">Filter by aging</label>
 <select
 id="remediationAgingFilter"
 value={agingFilter}
 onChange={(e) => setAgingFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Ages</option>
 <option value="under30">&lt; 30 days</option>
 <option value="30to60">30–60 days</option>
 <option value="60to90">60–90 days</option>
 <option value="breach">&gt; 90 days (SLA breach)</option>
 </select>
 </div>
 </div>
 </CardContent>
 </Card>

 {filteredItems.length > 0 ? (
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Remediation and Corrective Action Plan Records</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">ID & Issue</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Vendor / Finding Ref</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Severity</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Progress</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Owner & Due Date</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]"><span className="sr-only">Actions</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredItems.map((item) => {
 const isHighlighted = !!deepLink && (item.vendorName.toLowerCase().includes(deepLink.toLowerCase()) || item.issue.toLowerCase().includes(deepLink.toLowerCase()));
 return (
 <tr
 key={item.id}
 ref={isHighlighted ? highlightRowRef : undefined}
 onClick={() => setSelectedItem(item)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedItem(item);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect remediation task ${item.id}: ${item.issue}`}
 className={`hover:bg-surface-hover transition-colors cursor-pointer group focus:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-info ${isHighlighted ? 'bg-info/10 shadow-[inset_3px_0_0_0_var(--color-info)]' : ''}`}
 >
 <td className="py-4 px-5 max-w-xs">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono text-xs font-bold text-info">{item.id}</span>
 </div>
 <p className="text-xs font-bold text-text-primary truncate max-w-xs group-hover:text-info transition-colors m-0">
 {item.issue}
 </p>
 </td>

 <td className="py-4 px-4">
 <div className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
 <Building2 aria-hidden="true" size={13} className="text-text-tertiary" /> {item.vendorName}
 </div>
 <div className="text-[11px] font-mono text-text-tertiary mt-0.5">
 {item.evidenceFindingRef}
 </div>
 </td>

 <td className="py-4 px-4">{getSeverityBadge(item.severity)}</td>
 <td className="py-4 px-4">{getStatusBadge(item.status)}</td>

 <td className="py-4 px-4">
 <div className="w-28 space-y-1">
 <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
 <span>{item.progressPercent}%</span>
 </div>
 <div aria-hidden="true" className="w-full bg-base border border-border rounded-full h-1.5 overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all duration-500 ${item.progressPercent === 100 ? 'bg-status-success' : 'bg-info'}`}
 style={{ width: `${item.progressPercent}%` }}
 />
 </div>
 </div>
 </td>

 <td className="py-4 px-4">
 <div className="text-xs font-medium text-text-primary flex items-center gap-1.5">
 <User aria-hidden="true" size={13} className="text-text-tertiary" /> {item.owner}
 </div>
 <div className="text-[11px] font-mono text-text-tertiary mt-0.5 flex items-center gap-1">
 <Clock aria-hidden="true" size={12} /> {item.dueDate}
 </div>
 </td>

 <td className="py-4 px-5 text-right">
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
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
 icon={Wrench}
 title={deepLink ? `No Results for "${deepLink}"` : "No Remediation Tasks Found"}
 description={deepLink ? "No records match this deep link. The item may have been resolved, archived, or renamed." : "All security findings and corrective action plans have been resolved or filtered out."}
 whatItIs="Action management tracker assigning open security gaps to vendors with strict deadlines."
 whyItsEmpty="No open remediation findings match your current search and filter criteria."
 actionLabel={deepLink ? "Clear Deep Link" : "Clear Filters"}
 onAction={() => { setDeepLink(null); setSearchQuery(''); setStatusFilter('All'); setSeverityFilter('All'); setAgingFilter('All'); }}
 />
 )}

 {selectedItem && createPortal(
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="remediation-modal-title"
 className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
 onClick={() => setSelectedItem(null)}
 >
 <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-start justify-between border-b border-border pb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono text-xs font-bold text-info bg-info/10 px-2 py-0.5 rounded border border-info/30">{selectedItem.id}</span>
 {getSeverityBadge(selectedItem.severity)}
 {getStatusBadge(selectedItem.status)}
 </div>
 <h2 id="remediation-modal-title" className="text-base font-bold text-text-primary mt-1 m-0">{selectedItem.issue}</h2>
 </div>
 <button 
 type="button"
 onClick={() => setSelectedItem(null)} 
 className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 aria-label="Close remediation task inspector"
 >
 <X aria-hidden="true" size={18} />
 </button>
 </div>

 <div className="space-y-4 text-xs">
 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Risk Description</span>
 <p className="text-text-primary leading-relaxed font-medium m-0">{selectedItem.riskDescription}</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Assigned Owner</span>
 <div className="font-bold text-text-primary flex items-center gap-1.5 mt-1">
 <User aria-hidden="true" size={14} className="text-text-tertiary" /> {selectedItem.owner}
 </div>
 </div>
 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Due Date</span>
 <div className="font-bold text-text-primary flex items-center gap-1.5 mt-1">
 <Clock aria-hidden="true" size={14} className="text-text-tertiary" /> {selectedItem.dueDate}
 </div>
 </div>
 </div>

 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Recommended Action</span>
 <p className="text-text-primary font-medium m-0">{selectedItem.recommendedAction}</p>
 </div>

 <div className="border-t border-border-subtle pt-4 space-y-3">
 <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary m-0">Provenance & System Linkage</h4>
 
 <div className="flex items-center justify-between p-3 bg-base border border-border rounded-lg">
 <div className="flex items-center gap-2">
 <FileText aria-hidden="true" size={16} className="text-text-tertiary" />
 <div>
 <div className="font-semibold text-text-primary text-xs">Underlying Finding / Evidence</div>
 <div className="text-[11px] font-mono text-info">{selectedItem.evidenceFindingRef}</div>
 </div>
 </div>
 <button type="button" onClick={() => { setSelectedItem(null); navigateTo('evidence', { vendorName: selectedItem.vendorName }); }} className="text-[11px] font-semibold text-text-secondary hover:underline hover:text-info cursor-pointer focus:outline-none focus:ring-2 focus:ring-info rounded">View Artifact</button>
 </div>

 <div className="flex items-center justify-between p-3 bg-base border border-border rounded-lg">
 <div className="flex items-center gap-2">
 <Building2 aria-hidden="true" size={16} className="text-text-tertiary" />
 <div>
 <div className="font-semibold text-text-primary text-xs">Affected Vendor Portfolio Entity</div>
 <div className="text-[11px] font-mono text-text-primary">{selectedItem.vendorName}</div>
 </div>
 </div>
 <button type="button" onClick={() => { setSelectedItem(null); { const vid = resolveVendorId(selectedItem.vendorName); navigateTo('vendors', vid ? { vendorId: vid } : { vendorName: selectedItem.vendorName }); } }} className="text-[11px] font-semibold text-text-secondary hover:underline hover:text-info cursor-pointer focus:outline-none focus:ring-2 focus:ring-info rounded">View Vendor Profile</button>
 </div>

 <div className="flex items-center justify-between p-3 bg-base border border-border rounded-lg">
 <div className="flex items-center gap-2">
 <Link aria-hidden="true" size={16} className="text-text-tertiary" />
 <div>
 <div className="font-semibold text-text-primary text-xs">Governing Decision Linkage</div>
 <div className="text-[11px] font-mono text-accent font-bold">{selectedItem.decisionLinkage}</div>
 </div>
 </div>
 <button type="button" onClick={() => { setSelectedItem(null); const decId = selectedItem.decisionLinkage.match(/DEC-\d+-\d+/)?.[0] || selectedItem.decisionLinkage; navigateTo('decisions', { search: decId }); }} className="text-[11px] font-semibold text-text-secondary hover:underline hover:text-info cursor-pointer focus:outline-none focus:ring-2 focus:ring-info rounded">View Decision</button>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
 <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>
 Close Inspection
 </Button>
 <select
 aria-label="Update status"
 defaultValue={selectedItem.status}
 onChange={(e) => {
 const next = e.target.value as RemediationRecord['status'];
 setItems(prev => prev.map(it => it.id === selectedItem.id ? { ...it, status: next } : it));
 setSelectedItem({ ...selectedItem, status: next });
 }}
 className="h-8 px-3 text-xs font-semibold rounded-lg bg-accent text-white border border-accent focus:outline-none focus:ring-2 focus:ring-info cursor-pointer"
 >
 <option>Open</option>
 <option>In progress</option>
 <option>Blocked</option>
 <option>Awaiting vendor</option>
 <option>Ready for validation</option>
 <option>Resolved</option>
 <option>Accepted risk</option>
 </select>
 </div>
 </div>
 </div>
 , document.body)}
 </div>
 );
}