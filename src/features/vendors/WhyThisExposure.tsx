// src/features/vendors/WhyThisExposure.tsx
import { 
 ShieldAlert, Info 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/core';
import { navigateTo } from '../../shared/navigation';

export interface ExposureDimension {
 id: string;
 label: string;
 status: 'Critical' | 'Warning' | 'Healthy' | 'Unknown';
 scoreImpact: string;
 narrative: string;
}

export interface ExposureExplanationModel {
 vendorId: string;
 compositeScore: number;
 engineState: 'Live' | 'Scheduled Recompute';
 summaryStatement: string;
 dimensions: ExposureDimension[];
}

interface WhyThisExposureProps {
 model?: ExposureExplanationModel;
 vendorName?: string;
}

// Each risk driver deep-links to the tab that owns that data.
const DIMENSION_DESTINATIONS: Record<string, 'remediation' | 'evidence' | 'risk-events' | 'fourth-parties' | 'vendors' | 'decisions'> = {
 security_posture: 'remediation',
 business_criticality: 'vendors',
 evidence_quality: 'evidence',
 material_events: 'risk-events',
 open_remediation: 'remediation',
 dependency_exposure: 'fourth-parties',
 exit_readiness: 'decisions',
};

const DEFAULT_FALLBACK_MODEL: ExposureExplanationModel = {
 vendorId: 'vend-001',
 compositeScore: 88,
 engineState: 'Live',
 summaryStatement: 'Composite risk posture is heavily weighted by an expired SOC 2 attestation combined with active perimeter CVE remediation aging past SLA thresholds.',
 dimensions: [
 {
 id: 'security_posture',
 label: 'Security / Control Posture',
 status: 'Critical',
 scoreImpact: '+32 pts risk',
 narrative: '1 unpatched CVE (CVE-2026-1045) detected on customer-facing perimeter gateway.'
 },
 {
 id: 'business_criticality',
 label: 'Business Criticality',
 status: 'Warning',
 scoreImpact: '+20 pts risk',
 narrative: 'Classified as Tier 1 - Critical with direct read/write conduits to the core billing ledger.'
 },
 {
 id: 'evidence_quality',
 label: 'Evidence Quality',
 status: 'Critical',
 scoreImpact: '+18 pts risk',
 narrative: 'Primary SOC 2 Type II attestation expired 4 days ago; recertification report pending.'
 },
 {
 id: 'material_events',
 label: 'Material Events',
 status: 'Healthy',
 scoreImpact: '0 pts impact',
 narrative: 'Zero dark web credential leaks or executive leadership changes recorded in the past 90 days.'
 },
 {
 id: 'open_remediation',
 label: 'Open Remediation',
 status: 'Warning',
 scoreImpact: '+10 pts risk',
 narrative: '5 active findings in queue, including 1 overdue finding exceeding 60-day SLA.'
 },
 {
 id: 'dependency_exposure',
 label: 'Dependency Exposure',
 status: 'Warning',
 scoreImpact: '+8 pts risk',
 narrative: '12 sub-processors mapped, with 2 operating in non-standard regulatory jurisdictions.'
 },
 {
 id: 'exit_readiness',
 label: 'Exit Readiness',
 status: 'Healthy',
 scoreImpact: '0 pts impact',
 narrative: 'Data escrow agreements and standard contractual transition clauses verified in DPA.'
 }
 ]
};

export function WhyThisExposure({ model = DEFAULT_FALLBACK_MODEL, vendorName }: WhyThisExposureProps) {
 const getStatusBadge = (status: ExposureDimension['status']) => {
 switch (status) {
 case 'Critical':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">Critical</span>;
 case 'Warning':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-warning/10 text-status-warning ">Warning</span>;
 case 'Healthy':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-success/10 text-status-success ">Healthy</span>;
 default:
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-surface text-text-tertiary border border-border">Pending Sync</span>;
 }
 };

 return (
 <Card className="shadow-sm overflow-hidden border-border-strong">
 <CardHeader className="bg-surface border-b border-border px-6 py-4 flex flex-row items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-risk-critical/10 border border-risk-critical/20 flex items-center justify-center text-risk-critical">
 <ShieldAlert size={18} />
 </div>
 <div>
 <CardTitle className="text-base font-bold text-text-primary">Why This Exposure?</CardTitle>
 <p className="text-xs text-text-secondary mt-0.5">Deterministic risk driver decomposition engine</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-base border border-border text-text-secondary">
 Engine State: <strong className="text-text-primary">{model.engineState}</strong>
 </span>
 </div>
 </CardHeader>

 <CardContent className="p-6 space-y-6 bg-surface">
 
 {/* Executive Summary Rationale */}
 <div className="bg-surface-hover/60 border border-border p-4 rounded-xl space-y-1.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Synthesized Risk Driver Rationale</span>
 <p className="text-sm font-semibold text-text-primary leading-relaxed m-0">
 "{model.summaryStatement}"
 </p>
 </div>

 {/* 7-Dimension Breakdown Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
 {model.dimensions.map((dim) => {
 const dest = DIMENSION_DESTINATIONS[dim.id];
 return (
 <button
 type="button"
 key={dim.id}
 onClick={() => dest && vendorName && navigateTo(dest, { vendorName })}
 className="p-3.5 rounded-xl border border-border bg-base flex flex-col justify-between space-y-2 hover:border-info hover:shadow-sm transition-all text-left focus:outline-none focus:ring-2 focus:ring-info cursor-pointer"
 aria-label={`${dim.label}: ${dim.narrative} View details.`}
 >
 <div className="flex items-start justify-between gap-2">
 <span className="text-xs font-bold text-text-primary">{dim.label}</span>
 <div className="flex items-center gap-2 shrink-0">
 <span className="text-[11px] font-mono font-bold text-text-tertiary tabular-nums">{dim.scoreImpact}</span>
 {getStatusBadge(dim.status)}
 </div>
 </div>
 <p className="text-xs text-text-secondary leading-normal m-0">
 {dim.narrative}
 </p>
 </button>
 );
 })}
 </div>

 {/* Footer Note on Future Decision Engine Support */}
 <div className="flex items-center gap-2 pt-2 border-t border-border-subtle text-xs text-text-tertiary">
 <Info aria-hidden="true" size={14} className="shrink-0 text-info" />
 <span className="m-0">This telemetry structure is fully modeled for automated ingestion via future governance decision engine webhooks.</span>
 </div>

 </CardContent>
 </Card>
 );
}