// src/features/risk-events/RiskEventCard.tsx
import { 
 AlertTriangle, Clock, Activity, Server, Wrench
} from 'lucide-react';
import { navigateTo } from '../../shared/navigation';

export type EventSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type EventConfidence = 'Low' | 'Medium' | 'High';
export type EventLifecycleStatus = 'Detected' | 'Under review' | 'Confirmed' | 'Dismissed' | 'Action required' | 'Resolved';

export interface RiskEventRecord {
 id: string;
 whatChanged: string;
 timestamp: string;
 affectedVendor: string;
 source: string;
 severity: EventSeverity;
 confidence: EventConfidence;
 potentialImpact: string;
 affectedSystemsData?: string;
 recommendedAction: string;
 status: EventLifecycleStatus;
}

interface RiskEventCardProps {
 event: RiskEventRecord;
 onClick?: () => void;
 compact?: boolean;
}

export function RiskEventCard({ event, onClick, compact = false }: RiskEventCardProps) {
 
 const getSeverityBadge = (severity: EventSeverity) => {
 const styles = {
 'Low': 'bg-status-success/10 text-status-success ',
 'Medium': 'bg-status-warning/10 text-status-warning ',
 'High': 'bg-risk-high/10 text-risk-high ',
 'Critical': 'bg-risk-critical/10 text-risk-critical '
 };
 return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[severity]}`}>{severity}</span>;
 };

 const getStatusBadge = (status: EventLifecycleStatus) => {
 const styles: Record<EventLifecycleStatus, string> = {
 'Detected': 'bg-surface-hover text-text-secondary border-border dark:bg-surface-hover dark:text-text-secondary',
 'Under review': 'bg-info/10 text-info border-info/30',
 'Confirmed': 'bg-risk-high/10 text-risk-high ',
 'Dismissed': 'bg-surface-hover text-text-tertiary border-border',
 'Action required': 'bg-risk-critical/10 text-risk-critical ',
 'Resolved': 'bg-status-success/10 text-status-success '
 };
 return <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>{status}</span>;
 };

 if (compact) {
 return (
 <div 
 onClick={onClick}
 onKeyDown={(e) => {
 if ((e.key === 'Enter' || e.key === ' ') && onClick) {
 e.preventDefault();
 onClick();
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect risk event ${event.id}: ${event.whatChanged}`}
 className="p-3 bg-base border border-border rounded-xl hover:bg-surface-hover transition-all cursor-pointer flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-info"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div aria-hidden="true" className="p-2 rounded-lg bg-surface border border-border-strong text-text-secondary shrink-0">
 <AlertTriangle size={15} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 mb-1">
 {getSeverityBadge(event.severity)}
 <span className="text-xs font-bold text-text-primary truncate">{event.affectedVendor}</span>
 </div>
 <p className="text-xs text-text-secondary truncate m-0">{event.whatChanged}</p>
 </div>
 </div>
 {getStatusBadge(event.status)}
 </div>
 );
 }

 return (
 <div 
 onClick={onClick}
 onKeyDown={(e) => {
 if ((e.key === 'Enter' || e.key === ' ') && onClick) {
 e.preventDefault();
 onClick();
 }
 }}
 tabIndex={0}
 role="region"
 aria-label={`Risk event card for ${event.affectedVendor}: ${event.whatChanged}`}
 className="bg-base border border-border rounded-xl p-5 hover:border-border-strong transition-all cursor-pointer space-y-4 group focus:outline-none focus:ring-2 focus:ring-info"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
 <div className="flex items-center gap-2.5 flex-wrap">
 {getSeverityBadge(event.severity)}
 <span className="text-xs font-mono font-bold text-text-primary bg-surface px-2 py-0.5 rounded border border-border">
 {event.affectedVendor}
 </span>
 <span className="text-xs font-mono text-text-tertiary flex items-center gap-1">
 <Clock aria-hidden="true" size={12} /> {event.timestamp}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono text-text-tertiary">Confidence: <strong className="text-text-primary">{event.confidence}</strong></span>
 {getStatusBadge(event.status)}
 </div>
 </div>

 <div className="space-y-2">
 <h3 className="text-sm font-bold text-text-primary group-hover:text-info transition-colors m-0">
 {event.whatChanged}
 </h3>
 <p className="text-xs text-text-secondary leading-relaxed m-0">
 <strong className="text-text-primary">Potential Impact:</strong> {event.potentialImpact}
 </p>
 </div>

 {event.affectedSystemsData && (
 <div className="flex items-center gap-1.5 text-xs font-mono text-text-tertiary bg-surface px-3 py-2 rounded-lg border border-border">
 <Server aria-hidden="true" size={14} className="text-text-secondary shrink-0" />
 <span className="truncate">Affected Systems: {event.affectedSystemsData}</span>
 </div>
 )}

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs">
 <div className="text-text-secondary">
 <strong className="text-text-primary">Recommended Action:</strong> {event.recommendedAction}
 </div>
 <div className="text-text-tertiary font-mono text-[11px] shrink-0">
 Source: {event.source}
 </div>
 </div>

 <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); navigateTo('ai-playground', { vendorName: event.affectedVendor }); }}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
 className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-accent bg-accent-muted hover:bg-accent-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-info "
 >
 <Activity aria-hidden="true" size={12} className="opacity-70" /> Explain Potential Impact
 </button>
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); navigateTo('remediation', { vendorName: event.affectedVendor }); }}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
 className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-accent bg-accent-muted hover:bg-accent-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-info "
 >
 <Wrench aria-hidden="true" size={12} className="opacity-70" /> Draft Remediation Plan
 </button>
 </div>
 </div>
 );
}