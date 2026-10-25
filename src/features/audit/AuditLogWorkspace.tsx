// src/features/audit/AuditLogWorkspace.tsx
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
 Search, Clock, User, ArrowRight, X, FileJson, 
 Terminal, ShieldCheck, Filter, Braces, History
} from 'lucide-react';
import { Card, CardContent, Button, EmptyState, Eyebrow} from '../../shared/ui/core';
import { NetworkErrorBanner, PermissionErrorModal, ExpiredSessionModal } from '../../shared/ui/ErrorStates';
import { auditStore, type ImmutableAuditRecord } from './auditStore';
import { getNavParams, clearNavParams } from '../../shared/navigation';

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'DOWNLOAD' | 'STATUS_CHANGE' | 'VENDOR_ADDED' | 'VENDOR_OFFBOARDED' | 'TEAM_INVITE_SENT' | 'SETTINGS_UPDATED' | 'EVIDENCE_UPLOADED';

export interface AuditRecord {
 id: string;
 timestamp: string;
 actor: string;
 organization: string;
 objectType: string;
 objectId: string;
 action: ActionType;
 before: Record<string, any> | null;
 after: Record<string, any> | null;
 source: string;
 requestSessionId: string;
 reason: string;
}

const DEV_AUDIT_LOGS: AuditRecord[] = [
 {
 id: 'evt_98a7b6c5d4',
 timestamp: '2026-10-06T14:22:18Z',
 actor: 'Sarah Jenkins (CISO)',
 organization: 'Validexia Enterprise Global',
 objectType: 'Decision',
 objectId: 'DEC-2026-104',
 action: 'UPDATE',
 before: { status: 'Pending', conditions: [] },
 after: { status: 'Approved with conditions', conditions: ['WAF IP restriction rules enforced'] },
 source: '192.168.1.45 (Web UI / Chrome 118)',
 requestSessionId: 'req_a1b2c3d4e5f6',
 reason: 'Approved temporary TLS extension with compensating controls.'
 },
 {
 id: 'evt_77x8y9z0a1',
 timestamp: '2026-10-06T11:05:42Z',
 actor: 'Marcus Chen (Risk Gov)',
 organization: 'Validexia Enterprise Global',
 objectType: 'Evidence',
 objectId: 'EVID-2026-AWS-SOC2',
 action: 'UPLOAD',
 before: null,
 after: { documentName: 'AWS_SOC2_TypeII_2026.pdf', reference: 'demo-ref:8f4c21a91' },
 source: '10.0.4.112 (Web UI / Safari 17)',
 requestSessionId: 'req_v9b8n7m6l5',
 reason: 'Annual compliance artifact refresh.'
 },
 {
 id: 'evt_55q4w3e2r1',
 timestamp: '2026-10-05T09:15:00Z',
 actor: 'System Automation (Risk Engine)',
 organization: 'Validexia Enterprise Global',
 objectType: 'Vendor',
 objectId: 'VND-DataFlow',
 action: 'STATUS_CHANGE',
 before: { riskScore: 45, monitoringStatus: 'Active' },
 after: { riskScore: 68, monitoringStatus: 'Degraded' },
 source: 'internal-risk-worker-02',
 requestSessionId: 'sys_job_8812',
 reason: 'Automated telemetry detected unvetted subprocessor region flag.'
 },
 {
 id: 'evt_33p2o1i0u9',
 timestamp: '2026-10-04T16:30:22Z',
 actor: 'Alex Rivera (Security Analyst)',
 organization: 'Validexia Enterprise Global',
 objectType: 'Remediation',
 objectId: 'REM-003',
 action: 'CREATE',
 before: null,
 after: { issue: 'MFA fallback via SMS permitted', severity: 'Critical', dueDate: '2026-10-22' },
 source: '192.168.1.108 (Web UI / Firefox 119)',
 requestSessionId: 'req_j7h6g5f4d3',
 reason: 'Created corrective action following SecureAuth SIG assessment.'
 },
 {
 id: 'evt_11m2n3b4v5',
 timestamp: '2026-10-03T13:45:10Z',
 actor: 'Sarah Jenkins (CISO)',
 organization: 'Validexia Enterprise Global',
 objectType: 'Decision',
 objectId: 'DEC-2026-088',
 action: 'UPDATE',
 before: { status: 'In Review' },
 after: { status: 'Rejected' },
 source: '192.168.1.45 (Web UI / Chrome 118)',
 requestSessionId: 'req_x1c2v3b4n5',
 reason: 'Zero-tolerance for unvetted Tier 1 data handlers.'
 }
];

export function AuditLogWorkspace() {
 const [searchQuery, setSearchQuery] = useState('');
 const [actionFilter, setActionFilter] = useState<string>('All');
 const [objectFilter, setObjectFilter] = useState<string>('All');
 const [actorFilter, setActorFilter] = useState<string>('All');
 const [selectedEvent, setSelectedEvent] = useState<AuditRecord | null>(null);
 const [viewRawJson, setViewRawJson] = useState(false);

 // Deep link: pre-fill search when arriving from another tab
 useEffect(() => {
 const params = getNavParams();
 const q = params.search || params.vendorName;
 if (q && typeof q === 'string') {
 setSearchQuery(q);
 }
 if (q) clearNavParams();
 }, []);

 // Error simulation states
 const [hasNetworkError, setHasNetworkError] = useState(false);
 const [showPermissionModal, setShowPermissionModal] = useState(false);
 const [showSessionExpired, setShowSessionExpired] = useState(false);

 useEffect(() => {
 if (selectedEvent) {
 const handleEscape = (e: KeyboardEvent) => {
 if (e.key === 'Escape') setSelectedEvent(null);
 };
 document.addEventListener('keydown', handleEscape);
 return () => document.removeEventListener('keydown', handleEscape);
 }
 }, [selectedEvent]);

 const filteredLogs = useMemo(() => {
 // Merge live session records (from auditStore) with static demo logs.
 // Session records are converted to the AuditRecord shape and shown first.
 const sessionRecords: AuditRecord[] = auditStore.getRecords().map((r: ImmutableAuditRecord) => ({
 id: r.id,
 timestamp: r.timestamp,
 actor: r.actor,
 organization: 'Current Workspace',
 objectType: 'Record',
 objectId: r.targetId,
 action: r.action as AuditRecord['action'],
 before: null,
 after: null,
 source: 'User Session (Demo)',
 requestSessionId: r.demoReference,
 reason: r.rationale,
 }));
 const allLogs = [...sessionRecords, ...DEV_AUDIT_LOGS];
 return allLogs.filter(log => {
 const matchesSearch = 
 log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
 log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
 log.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
 log.reason.toLowerCase().includes(searchQuery.toLowerCase());

 const matchesAction = actionFilter === 'All' || log.action === actionFilter;
 const matchesObject = objectFilter === 'All' || log.objectType === objectFilter;
 const matchesActor = actorFilter === 'All' || log.actor.includes(actorFilter);

 return matchesSearch && matchesAction && matchesObject && matchesActor;
 });
 }, [searchQuery, actionFilter, objectFilter, actorFilter]);

 const getActionBadge = (action: ActionType) => {
 const styles: Record<ActionType, string> = {
 'CREATE': 'bg-accent-muted text-accent ',
 'UPDATE': 'bg-info/10 text-info border-info/30',
 'DELETE': 'bg-risk-critical/10 text-risk-critical ',
 'UPLOAD': 'bg-status-success/10 text-status-success ',
 'DOWNLOAD': 'bg-status-success/10 text-status-success ',
 'STATUS_CHANGE': 'bg-risk-high/10 text-risk-high ',
 'VENDOR_ADDED': 'bg-accent-muted text-accent ',
 'VENDOR_OFFBOARDED': 'bg-risk-critical/10 text-risk-critical ',
 'TEAM_INVITE_SENT': 'bg-info/10 text-info ',
 'SETTINGS_UPDATED': 'bg-info/10 text-info ',
 'EVIDENCE_UPLOADED': 'bg-status-success/10 text-status-success ',
 };
 return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[action]}`}>{action}</span>;
 };

 const formatValue = (val: unknown) => {
 if (val === null || val === undefined) return 'null';
 if (typeof val === 'object') return JSON.stringify(val);
 return String(val);
 };

 const renderHumanReadableDiff = (before: Record<string, any> | null, after: Record<string, any> | null) => {
 const allKeys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
 
 if (allKeys.length === 0) {
 return (
 <div className="text-[11px] text-text-tertiary italic p-3 bg-base border border-border rounded-lg">
 No state mutations recorded.
 </div>
 );
 }

 return (
 <div className="space-y-2">
 {allKeys.map(key => {
 const oldVal = before?.[key];
 const newVal = after?.[key];

 if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;

 return (
 <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] p-2.5 bg-base border border-border rounded-lg">
 <span className="font-bold text-text-secondary w-32 shrink-0 uppercase tracking-wider text-[10px]">{key}</span>
 <div className="flex items-center gap-2 flex-1 flex-wrap">
 {oldVal !== undefined ? (
 <span className="text-risk-critical bg-risk-critical/30 px-2 py-0.5 rounded border border-risk-critical/40 line-through">
 {formatValue(oldVal)}
 </span>
 ) : null}
 
 {oldVal !== undefined && newVal !== undefined ? (
 <ArrowRight aria-hidden="true" size={12} className="text-text-tertiary shrink-0" />
 ) : null}

 {newVal !== undefined ? (
 <span className="text-risk-low bg-risk-low/10 px-2 py-0.5 rounded border border-risk-low/25 font-semibold">
 {formatValue(newVal)}
 </span>
 ) : null}
 </div>
 </div>
 );
 })}
 </div>
 );
 };

 const renderJsonDiff = (data: Record<string, any> | null, type: 'before' | 'after') => {
 if (!data) {
 return (
 <div className="text-[11px] text-text-tertiary italic p-3 bg-base rounded-md border border-border">
 null
 </div>
 );
 }
 const bgColor = type === 'before' 
 ? 'bg-risk-critical/50 text-risk-critical' 
 : 'bg-risk-low/10 text-risk-low border-risk-low/25';
 
 return (
 <pre className={`p-3 text-[11px] font-mono whitespace-pre-wrap rounded-lg border ${bgColor}`}>
 {JSON.stringify(data, null, 2)}
 </pre>
 );
 };

 const renderDiffContent = (event: AuditRecord) => {
 if (viewRawJson) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
 <div className="space-y-1">
 <span className="text-[10px] font-bold text-text-secondary block">Previous State (Before)</span>
 {renderJsonDiff(event.before, 'before')}
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-bold text-text-secondary block">New State (After)</span>
 {renderJsonDiff(event.after, 'after')}
 </div>
 </div>
 );
 }
 return (
 <div className="animate-in fade-in duration-200">
 {renderHumanReadableDiff(event.before, event.after)}
 </div>
 );
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 {/* Live Region for Screen Readers */}
 <div aria-live="polite" className="sr-only">
 {filteredLogs.length} audit log records matched your search and filter criteria.
 </div>

 {hasNetworkError && <NetworkErrorBanner onRetry={() => setHasNetworkError(false)} />}
 {showPermissionModal && <PermissionErrorModal onClose={() => setShowPermissionModal(false)} />}
 {showSessionExpired && <ExpiredSessionModal onReauth={() => setShowSessionExpired(false)} />}

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Governance</Eyebrow>
 <h1 className="text-page-title">Forensic Audit Log</h1>
 <p className="text-body-secondary mt-1">
 System record of administrative actions, data access, and state transitions. Demo data.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 </div>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <label htmlFor="auditSearchInput" className="sr-only">Search event ID, actor, object, or reason</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="auditSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search event ID, actor, object, reason..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-1.5 px-2">
 <Filter aria-hidden="true" size={14} className="text-text-tertiary" />
 <span className="text-xs font-semibold text-text-secondary">Filters:</span>
 </div>
 
 <div>
 <label htmlFor="actionFilterSelect" className="sr-only">Filter by action</label>
 <select
 id="actionFilterSelect"
 value={actionFilter}
 onChange={(e) => setActionFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Actions</option>
 <option value="CREATE">CREATE</option>
 <option value="UPDATE">UPDATE</option>
 <option value="DELETE">DELETE</option>
 <option value="UPLOAD">UPLOAD</option>
 <option value="STATUS_CHANGE">STATUS_CHANGE</option>
 </select>
 </div>

 <div>
 <label htmlFor="objectFilterSelect" className="sr-only">Filter by object type</label>
 <select
 id="objectFilterSelect"
 value={objectFilter}
 onChange={(e) => setObjectFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Objects</option>
 <option value="Decision">Decision</option>
 <option value="Evidence">Evidence</option>
 <option value="Vendor">Vendor</option>
 <option value="Remediation">Remediation</option>
 </select>
 </div>

 <div>
 <label htmlFor="actorFilterSelect" className="sr-only">Filter by actor</label>
 <select
 id="actorFilterSelect"
 value={actorFilter}
 onChange={(e) => setActorFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Actors</option>
 <option value="Sarah Jenkins">Sarah Jenkins</option>
 <option value="Marcus Chen">Marcus Chen</option>
 <option value="Alex Rivera">Alex Rivera</option>
 <option value="System Automation">System Automation</option>
 </select>
 </div>
 </div>
 </CardContent>
 </Card>

 {filteredLogs.length > 0 ? (
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Forensic Audit Log Records</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Timestamp (UTC)</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Actor</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Action</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Object</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Reason / Context</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]"><span className="sr-only">Forensics</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredLogs.map((log) => (
 <tr 
 key={log.id} 
 onClick={() => { setSelectedEvent(log); setViewRawJson(false); }}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedEvent(log);
 setViewRawJson(false);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect audit event ${log.id} by ${log.actor}`}
 className="hover:bg-surface-hover transition-colors cursor-pointer group focus:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-info"
 >
 <td className="py-3.5 px-5">
 <div className="font-mono text-xs text-text-primary flex items-center gap-1.5">
 <Clock aria-hidden="true" size={12} className="text-text-tertiary" />
 {log.timestamp.replace('T', ' ').replace('Z', '')}
 </div>
 </td>

 <td className="py-3.5 px-4">
 <div className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
 <User aria-hidden="true" size={13} className="text-text-tertiary" /> {log.actor}
 </div>
 </td>

 <td className="py-3.5 px-4">
 {getActionBadge(log.action)}
 </td>

 <td className="py-3.5 px-4">
 <div className="text-xs font-semibold text-text-secondary">{log.objectType}</div>
 <div className="text-[11px] font-mono text-text-tertiary mt-0.5">{log.objectId}</div>
 </td>

 <td className="py-3.5 px-4 max-w-xs truncate text-xs text-text-secondary">
 {log.reason ? log.reason : <span className="italic opacity-50">No comment provided</span>}
 </td>

 <td className="py-3.5 px-5 text-right">
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); setSelectedEvent(log); setViewRawJson(false); }}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
 }}
 className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-text-secondary bg-base hover:bg-surface-hover border border-border rounded-md transition-colors focus:ring-2 focus:ring-info outline-none"
 >
 Inspect <ArrowRight aria-hidden="true" size={12} />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 ) : (
 <EmptyState
 icon={History}
 title="No Audit Records Found"
 description="No forensic event logs match your current search query or filter criteria."
 whatItIs="Immutable forensic audit ledger recording all administrative actions, data mutations, and state transitions."
 whyItsEmpty="Applied search query, action type, object type, or actor filters eliminated all matching events."
 actionLabel="Reset Forensic Filters"
 onAction={() => { setSearchQuery(''); setActionFilter('All'); setObjectFilter('All'); setActorFilter('All'); }}
 />
 )}

 {selectedEvent && createPortal(
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="modal-title"
 className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
 onClick={() => setSelectedEvent(null)}
 >
 <div className="bg-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
 
 <div className="flex items-start justify-between border-b border-border pb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono text-[10px] font-bold text-info bg-info/10 px-2 py-0.5 rounded border border-info/30">{selectedEvent.id}</span>
 {getActionBadge(selectedEvent.action)}
 </div>
 <h2 id="modal-title" className="text-base font-bold text-text-primary mt-1 flex items-center gap-2">
 <Terminal aria-hidden="true" size={18} className="text-text-tertiary" /> Forensic Event Inspection
 </h2>
 </div>
 <button 
 type="button"
 onClick={() => setSelectedEvent(null)} 
 className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors focus:ring-2 focus:ring-info outline-none"
 aria-label="Close forensic inspector"
 >
 <X aria-hidden="true" size={18} />
 </button>
 </div>

 <div className="space-y-4 text-xs">
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-base border border-border rounded-xl">
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block mb-1">Timestamp (UTC)</span>
 <span className="font-mono font-medium text-text-primary">{selectedEvent.timestamp}</span>
 </div>
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block mb-1">Actor</span>
 <span className="font-medium text-text-primary">{selectedEvent.actor}</span>
 </div>
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block mb-1">Target Object</span>
 <span className="font-mono font-medium text-text-primary">{selectedEvent.objectType}: {selectedEvent.objectId}</span>
 </div>
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block mb-1">Organization context</span>
 <span className="font-medium text-text-primary">{selectedEvent.organization}</span>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
 <FileJson aria-hidden="true" size={14} /> State Mutation Payload
 </span>
 <button 
 type="button"
 onClick={() => setViewRawJson(!viewRawJson)}
 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-info hover:text-accent transition-colors focus:ring-2 focus:ring-info outline-none rounded px-1"
 >
 <Braces aria-hidden="true" size={13} /> {viewRawJson ? 'View Readable Summary' : 'View Raw JSON'}
 </button>
 </div>

 {renderDiffContent(selectedEvent)}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Reason / Provided Comment</span>
 <p className="text-text-primary font-medium leading-relaxed">{selectedEvent.reason ? selectedEvent.reason : 'None provided.'}</p>
 </div>
 <div className="bg-base border border-border p-4 rounded-xl space-y-2">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Network & Session Trace</span>
 <div className="space-y-1.5 font-mono text-[11px]">
 <div className="flex justify-between items-center">
 <span className="text-text-tertiary">Source IP / Agent:</span>
 <span className="text-text-primary text-right">{selectedEvent.source}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-text-tertiary">Request Session ID:</span>
 <span className="text-info">{selectedEvent.requestSessionId}</span>
 </div>
 </div>
 </div>
 </div>

 </div>

 <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-text-tertiary">
 <span className="flex items-center gap-1.5"><ShieldCheck aria-hidden="true" size={14} className="text-status-success" /> Demo Record</span>
 <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
 Close Inspector
 </Button>
 </div>

 </div>
 </div>
 , document.body)}

 </div>
 );
}