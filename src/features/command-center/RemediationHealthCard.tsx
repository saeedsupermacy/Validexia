// src/features/command-center/RemediationHealthCard.tsx
import { Wrench, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/core';
import { navigateTo } from '../../shared/navigation';

import { getRemediations } from '../../data/remediation';

// Local view type kept for the card's rendering (lowercase severity for styling)
interface RemediationItem {
 id: string;
 title: string;
 vendorName: string;
 vendorId: string;
 findingId: string;
 owner: string;
 agingDays: number;
 severity: 'critical' | 'high' | 'moderate' | 'low';
 dueDate: string;
}

/** Card items derived from the single shared remediation dataset — never hardcoded separately. */
export const DEV_ACTIVE_REMEDIATIONS: RemediationItem[] = getRemediations().map(r => ({
 id: r.id,
 title: r.title,
 vendorName: r.vendorName,
 vendorId: r.vendorId,
 findingId: r.evidenceFindingRef,
 owner: r.owner,
 agingDays: r.agingDays,
 severity: r.severity.toLowerCase() as RemediationItem['severity'],
 dueDate: r.dueDate,
}));

export function RemediationHealthCard() {
 const openCount = DEV_ACTIVE_REMEDIATIONS.length;
 const slaDays: Record<string, number> = { critical: 14, high: 30, moderate: 60, low: 90 };
 const breachedCount = DEV_ACTIVE_REMEDIATIONS.filter(i => i.agingDays > (slaDays[i.severity] ?? 90)).length;
 const bucket = (min: number, max: number) => DEV_ACTIVE_REMEDIATIONS.filter(i => i.agingDays >= min && i.agingDays < max).length;
 const agingBuckets = [
 { label: '<30d', count: bucket(0, 30), bucketKey: 'under30' },
 { label: '30–60d', count: bucket(30, 60), bucketKey: '30to60' },
 { label: '60–90d', count: bucket(60, 90), bucketKey: '60to90' },
 { label: '>90d (Breach)', count: bucket(90, Infinity), bucketKey: 'breach' },
 ];
 const handleItemClick = (item: RemediationItem, step: 'item' | 'vendor' | 'finding') => {
 if (step === 'vendor') {
 navigateTo('vendors', { vendorId: item.vendorId });
 } else if (step === 'finding') {
 navigateTo('evidence', { vendorName: item.vendorName });
 } else {
 navigateTo('remediation', { search: item.vendorName });
 }
 };

 return (
 <Card className="flex flex-col h-full shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Wrench aria-hidden="true" size={18} className="text-text-secondary" strokeWidth={1.75} />
 Remediation Health & SLA Tracking
 </CardTitle>
 <p className="text-xs text-text-secondary mt-1">
 Tracking vulnerability resolution velocity and aging buckets.
 </p>
 </div>
 <div className="flex items-center gap-1.5 text-xs font-mono bg-base px-2.5 py-1 rounded border border-border self-start sm:self-auto">
 <span className="text-risk-critical font-bold">{breachedCount} Breached</span>
 <span className="text-text-tertiary">/ {openCount} Open</span>
 </div>
 </div>
 </CardHeader>

 <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
 
 <div>
 <div className="flex justify-between text-xs font-bold mb-1">
 <span className="text-text-secondary uppercase tracking-wider">Vulnerability Aging Distribution</span>
 <span className="text-text-tertiary font-normal">SLA Threshold: 90 Days</span>
 </div>
 <p className="text-[11px] text-text-tertiary mb-2">How long open issues have waited for a fix — older boxes are closer to (or past) their deadline. Click a box to see those items.</p>
 <div className="grid grid-cols-4 gap-2.5">
 {agingBuckets.map((b, i) => {
 const styles = [
 'bg-surface border-border-subtle text-text-primary',
 'bg-status-warning/10 border-status-warning/20 text-status-warning',
 'bg-risk-high/10 border-risk-high/20 text-risk-high',
 'bg-risk-critical/10 border-risk-critical/20 text-risk-critical shadow-sm',
 ][i];
 return (
 <button
 key={b.bucketKey}
 type="button"
 onClick={() => navigateTo('remediation', { agingBucket: b.bucketKey })}
 className={`border rounded-lg p-3 text-center transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-info ${styles}`}
 aria-label={`${b.count} items aging ${b.label}. View in remediation.`}
 >
 <span className={`text-xl font-bold tabular-nums ${styles.split(' ').pop()}`}>{b.count}</span>
 <span className="block text-[10px] uppercase tracking-wider font-semibold mt-1 opacity-80">{b.label}</span>
 </button>
 );
 })}
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary m-0">
 Critical Action Queue
 </h3>
 <span className="text-[11px] text-text-tertiary">Workflow navigation path</span>
 </div>

 <div className="space-y-2.5">
 {DEV_ACTIVE_REMEDIATIONS.map((item) => (
 <div 
 key={item.id}
 className="group p-3.5 rounded-lg border border-border bg-surface hover:border-border-strong transition-all space-y-2"
 >
 <div className="flex items-start justify-between gap-3">
 <button 
 type="button"
 onClick={() => handleItemClick(item, 'item')}
 className="text-left text-sm font-bold text-text-primary group-hover:text-info transition-colors leading-snug focus:outline-none focus:ring-2 focus:ring-info rounded"
 >
 {item.title}
 </button>
 <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border shrink-0 ${
 item.severity === 'critical' ? 'bg-risk-critical/10 text-risk-critical ' : 'bg-status-warning/10 text-status-warning '
 }`}>
 {item.dueDate}
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-y-1.5 text-xs pt-1 border-t border-border-subtle text-text-secondary">
 <div className="flex items-center gap-1.5 mr-3">
 <UserCheck aria-hidden="true" size={13} className="text-text-tertiary" />
 <span>Owner: <strong className="text-text-primary font-medium">{item.owner}</strong></span>
 </div>

 <div className="flex items-center gap-1.5 ml-auto">
 <span className="text-text-tertiary">Path:</span>
 
 <button 
 type="button"
 onClick={() => handleItemClick(item, 'vendor')}
 className="text-info hover:underline font-semibold px-1.5 py-0.5 rounded bg-info/5 border border-info/20 text-[11px] focus:outline-none focus:ring-2 focus:ring-info"
 title="Jump to Vendor Profile"
 >
 {item.vendorName}
 </button>

 <span className="text-text-tertiary" aria-hidden="true">→</span>

 <button 
 type="button"
 onClick={() => handleItemClick(item, 'finding')}
 className="text-info hover:underline font-semibold px-1.5 py-0.5 rounded bg-info/5 border border-info/20 text-[11px] focus:outline-none focus:ring-2 focus:ring-info"
 title="Inspect underlying evidence finding"
 >
 Finding Audit
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
 <div className="flex items-center gap-1.5">
 <CheckCircle2 aria-hidden="true" size={15} className="text-status-success" />
 <span>Velocity: <strong className="text-text-primary font-semibold">14.2d avg</strong> (30d)</span>
 </div>
 <button 
 type="button"
 onClick={() => navigateTo('remediation')}
 className="font-bold text-info hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-info rounded px-1"
 >
 <span>View all {openCount}</span>
 <ArrowRight aria-hidden="true" size={13} strokeWidth={2} />
 </button>
 </div>

 </CardContent>
 </Card>
 );
}