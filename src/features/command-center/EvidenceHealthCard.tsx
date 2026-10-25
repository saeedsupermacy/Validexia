// src/features/command-center/EvidenceHealthCard.tsx
import { FileCheck, ShieldAlert, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/core';
import { navigateTo } from '../../shared/navigation';
import { getVendors } from '../../data/vendors';

interface EvidenceMetricItem {
 id: string;
 label: string;
 count: number;
 total: number;
 severity: 'critical' | 'warning' | 'success' | 'neutral';
 description: string;
 filterKey: string;
}


/** Evidence metrics derived from the shared vendor list — never hardcoded. */
function buildEvidenceMetrics(): EvidenceMetricItem[] {
 const total = getVendors().length;
 const countBy = (status: string) => getVendors().filter(v => v.evidenceStatus === status).length;
 const missing = countBy('Missing');
 const expiring = countBy('Expiring');
 const stale = countBy('Stale');
 const verified = countBy('Verified');
 return [
 {
 id: 'ev-1',
 label: 'Critical Gaps (Missing Evidence)',
 count: missing,
 total,
 severity: 'critical',
 description: 'Tier 1 & 2 vendors completely lacking mandatory SOC 2 or ISO certs.',
 filterKey: 'missing'
 },
 {
 id: 'ev-2',
 label: 'Expiring Within 30 Days',
 count: expiring,
 total,
 severity: 'warning',
 description: 'Attestations approaching expiration; renewal requests pending.',
 filterKey: 'expiring'
 },
 {
 id: 'ev-3',
 label: 'Stale / Unverified Evidence',
 count: stale,
 total,
 severity: 'warning',
 description: 'Relying on self-attestation without independent audit validation.',
 filterKey: 'stale'
 },
 {
 id: 'ev-4',
 label: 'Fully Verified & Sufficient',
 count: verified,
 total,
 severity: 'success',
 description: 'Current, independently audited artifacts supporting live decisions.',
 filterKey: 'verified'
 }
 ];
}

export function EvidenceHealthCard() {
 const EVIDENCE_METRICS = buildEvidenceMetrics();
 const total = getVendors().length || 1;
 const verified = EVIDENCE_METRICS[3].count;
 const expiringStale = EVIDENCE_METRICS[1].count + EVIDENCE_METRICS[2].count;
 const missing = EVIDENCE_METRICS[0].count;
 const pct = (n: number) => Math.round((n / total) * 100);
 const sufficientPct = (100 - (missing / total) * 100).toFixed(1);
 const statusMap: Record<string, string> = { missing: 'Missing', expiring: 'Expiring', stale: 'Stale', verified: 'Verified' };
 const handleDrillDown = (filterKey: string, _label: string) => {
 navigateTo('vendors', { evidenceStatus: statusMap[filterKey] || 'All' });
 };

 return (
 <Card className="flex flex-col h-full shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4">
 <div>
 <CardTitle className="flex items-center gap-2">
 <FileCheck aria-hidden="true" size={18} className="text-text-secondary" strokeWidth={1.75} />
 Evidence Sufficiency & Confidence
 </CardTitle>
 <p className="text-xs text-text-secondary mt-1">
 Evaluating whether available documentation is sufficient to support decisions.
 </p>
 </div>
 </CardHeader>

 <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
 
 <div className="space-y-3">
 <div className="flex justify-between text-xs font-bold">
 <span className="text-text-secondary uppercase tracking-wider">Decision Confidence Ratio</span>
 <span className="text-text-primary tabular-nums">{sufficientPct}% Sufficient</span>
 </div>
 
 <div className="flex h-3 w-full rounded-full overflow-hidden bg-surface-hover border border-border-subtle" role="progressbar" aria-valuenow={Number(sufficientPct)} aria-valuemin={0} aria-valuemax={100} aria-label="Decision confidence ratio">
 <div style={{ width: `${pct(verified)}%` }} className="bg-status-success" title={`Verified & Current (${pct(verified)}%)`} />
 <div style={{ width: `${pct(expiringStale)}%` }} className="bg-status-warning" title={`Expiring or Stale (${pct(expiringStale)}%)`} />
 <div style={{ width: `${pct(missing)}%` }} className="bg-risk-critical" title={`Critical Missing Gaps (${pct(missing)}%)`} />
 </div>

 <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-text-secondary">
 <div className="flex items-center gap-2">
 <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full shrink-0 bg-status-success" />
 <span className="truncate">Verified <strong className="text-text-primary font-semibold tabular-nums">({verified})</strong></span>
 </div>
 <div className="flex items-center justify-center gap-2">
 <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full shrink-0 bg-status-warning" />
 <span className="truncate font-medium text-status-warning">Expiring/Stale <strong className="tabular-nums">({expiringStale})</strong></span>
 </div>
 <div className="flex items-center justify-end gap-2">
 <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full shrink-0 bg-risk-critical" />
 <span className="text-risk-critical font-semibold truncate">Missing <strong className="tabular-nums">({missing})</strong></span>
 </div>
 </div>
 </div>

 <div className="space-y-2.5">
 {EVIDENCE_METRICS.map((item) => {
 const isCritical = item.severity === 'critical';
 const isWarning = item.severity === 'warning';
 
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => handleDrillDown(item.filterKey, item.label)}
 className={`w-full group text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-info ${
 isCritical 
 ? 'bg-risk-critical/5 hover:bg-risk-critical/10 border-risk-critical/20' 
 : isWarning 
 ? 'bg-status-warning/5 hover:bg-status-warning/10 border-status-warning/20' 
 : 'bg-surface border-border-subtle hover:bg-surface-hover'
 }`}
 >
 <div className="flex items-start gap-3 min-w-0">
 <div className="mt-0.5 shrink-0" aria-hidden="true">
 {isCritical && <ShieldAlert size={16} className="text-risk-critical" strokeWidth={2} />}
 {isWarning && <Clock size={16} className="text-status-warning" strokeWidth={2} />}
 {item.severity === 'success' && <CheckCircle2 size={16} className="text-status-success" strokeWidth={2} />}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-sm font-bold text-text-primary group-hover:text-info transition-colors m-0">
 {item.count} vendors have {item.label.toLowerCase()}
 </p>
 </div>
 <p className="text-xs text-text-secondary mt-0.5 leading-snug m-0">
 {item.description}
 </p>
 </div>
 </div>

 <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-text-tertiary group-hover:text-info transition-colors">
 <span className="hidden sm:inline">Inspect</span>
 <ArrowRight aria-hidden="true" size={14} strokeWidth={2} className="transform group-hover:translate-x-0.5 transition-transform" />
 </div>
 </button>
 );
 })}
 </div>

 </CardContent>
 </Card>
 );
}