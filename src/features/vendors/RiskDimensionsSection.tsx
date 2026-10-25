// src/features/vendors/RiskDimensionsSection.tsx
import { useState, useEffect } from 'react';
import { 
 ShieldAlert, ShieldCheck, HelpCircle, Clock, Sliders, X, Info 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../shared/ui/core';

export type EpistemicStatus = 'Known High' | 'Known Low' | 'Unknown' | 'Stale' | 'High Confidence' | 'Low Confidence';

export interface RiskDimensionItem {
 id: string;
 category: 'Security / Control Posture' | 'Business Impact' | 'Evidence Confidence' | 'Operational Dependency' | 'Exit Readiness' | 'Compliance & Regulatory';
 dimensionName: string;
 status: EpistemicStatus;
 confidenceScore: string;
 telemetrySummary: string;
 epistemicNote: string;
}

export interface RiskDimensionsModel {
 vendorId: string;
 dimensions: RiskDimensionItem[];
}

const DEFAULT_RISK_DIMENSIONS_MODEL: RiskDimensionsModel = {
 vendorId: 'vend-001',
 dimensions: [
 {
 id: 'dim_sec',
 category: 'Security / Control Posture',
 dimensionName: 'Perimeter Vulnerability Posture',
 status: 'Known High',
 confidenceScore: 'High Confidence (94% telemetry match)',
 telemetrySummary: '1 unpatched critical CVE (CVE-2026-1045) verified on external gateway.',
 epistemicNote: 'Scanned 4 hours ago via continuous automated surface discovery.'
 },
 {
 id: 'dim_biz',
 category: 'Business Impact',
 dimensionName: 'Core Billing & Ledger Coupling',
 status: 'Known High',
 confidenceScore: 'High Confidence (Direct architecture map)',
 telemetrySummary: 'Tightly coupled with automated payment settlements and invoicing queues.',
 epistemicNote: 'Verified against internal microservice dependency graph.'
 },
 {
 id: 'dim_evid',
 category: 'Evidence Confidence',
 dimensionName: 'SOC 2 Type II Attestation',
 status: 'Stale',
 confidenceScore: 'Low Confidence (Expired 4 days ago)',
 telemetrySummary: 'Attestation document expired on Oct 1, 2026; renewal report pending audit.',
 epistemicNote: 'Evidence validity lapsed; compliance status is currently unverified.'
 },
 {
 id: 'dim_dep',
 category: 'Operational Dependency',
 dimensionName: 'Sub-Processor & Cloud Infrastructure',
 status: 'Unknown',
 confidenceScore: 'Unknown / Unmapped',
 telemetrySummary: 'Tier-2 sub-processor data residency in non-standard jurisdictions is unconfirmed.',
 epistemicNote: 'Vendor failed to provide complete fourth-party sub-processor inventory.'
 },
 {
 id: 'dim_exit',
 category: 'Exit Readiness',
 dimensionName: 'Data Escrow & Transition Clause',
 status: 'Known Low',
 confidenceScore: 'High Confidence (Contract clause verified)',
 telemetrySummary: 'Standard 90-day transition assistance and secure data deletion verified in DPA.',
 epistemicNote: 'Legal review completed during Q3 contract onboarding.'
 }
 ]
};

export function RiskDimensionsSection({ model = DEFAULT_RISK_DIMENSIONS_MODEL }: { model?: RiskDimensionsModel }) {
 const [selectedDim, setSelectedDim] = useState<RiskDimensionItem | null>(null);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && selectedDim) {
 setSelectedDim(null);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedDim]);

 // Epistemic Status Badge Styling (Ensuring Unknown/Stale never looks like Low Risk)
 const getEpistemicBadge = (status: EpistemicStatus) => {
 switch (status) {
 case 'Known High':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">
 <ShieldAlert aria-hidden="true" size={12} /> Known High Risk
 </span>
 );
 case 'Stale':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-status-warning/10 text-status-warning ">
 <Clock aria-hidden="true" size={12} /> Stale Evidence
 </span>
 );
 case 'Unknown':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-risk-moderate/15 text-risk-moderate shadow-sm">
 <HelpCircle aria-hidden="true" size={12} /> Unknown / Unverified
 </span>
 );
 case 'Known Low':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-status-success/10 text-status-success ">
 <ShieldCheck aria-hidden="true" size={12} /> Known Low Risk
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-surface text-text-tertiary border border-border">
 {status}
 </span>
 );
 }
 };

 return (
 <Card className="shadow-sm overflow-hidden border-border-strong">
 <CardHeader className="bg-surface border-b border-border px-6 py-4 flex flex-row items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info">
 <Sliders size={18} />
 </div>
 <div>
 <CardTitle className="text-base font-bold text-text-primary">Risk Dimensions & Epistemic Certainty</CardTitle>
 <p className="text-xs text-text-secondary mt-0.5">Granular control breakdown with explicit confidence and uncertainty tracking</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono text-text-tertiary bg-base px-2.5 py-1 rounded border border-border">
 {model.dimensions.length} Core Dimensions Tracked
 </span>
 </div>
 </CardHeader>

 <CardContent className="p-6 space-y-4 bg-surface">
 
 {/* Notice on Epistemic Transparency */}
 <div className="bg-base border border-border p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-text-secondary">
 <Info aria-hidden="true" size={16} className="text-info shrink-0 mt-0.5" />
 <p className="m-0">
 Risk dimensions are evaluated with distinct confidence states. <strong className="text-text-primary">Unknown</strong> or <strong className="text-text-primary">Stale</strong> dimensions are intentionally highlighted to prevent unverified assumptions from mimicking low risk.
 </p>
 </div>

 {/* Dimensions List */}
 <div className="space-y-3">
 {model.dimensions.map((dim) => (
 <div 
 key={dim.id}
 onClick={() => setSelectedDim(dim)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedDim(dim);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect risk dimension ${dim.dimensionName}: ${dim.telemetrySummary}`}
 className="p-4 rounded-xl border border-border bg-base flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-info transition-all group focus:outline-none focus:ring-2 focus:ring-info"
 >
 <div className="space-y-1 min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">{dim.category}</span>
 <span aria-hidden="true" className="text-text-tertiary">•</span>
 <span className="text-xs font-mono text-text-tertiary">{dim.confidenceScore}</span>
 </div>
 <h4 className="text-sm font-bold text-text-primary group-hover:text-info transition-colors m-0">
 {dim.dimensionName}
 </h4>
 <p className="text-xs text-text-secondary line-clamp-1 m-0">{dim.telemetrySummary}</p>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
 {getEpistemicBadge(dim.status)}
 </div>
 </div>
 ))}
 </div>

 {/* Inspectable Modal */}
 {selectedDim && (
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="risk-dimension-modal-title"
 className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
 onClick={() => setSelectedDim(null)}
 >
 <div className="bg-surface border border-border-strong rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between border-b border-border pb-4">
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">{selectedDim.category}</span>
 <h3 id="risk-dimension-modal-title" className="text-base font-bold text-text-primary mt-0.5 m-0">{selectedDim.dimensionName}</h3>
 </div>
 <button 
 type="button"
 onClick={() => setSelectedDim(null)}
 aria-label="Close risk dimension inspector"
 className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 <X aria-hidden="true" size={16} />
 </button>
 </div>

 <div className="space-y-4 text-xs">
 <div className="flex items-center justify-between bg-base p-3.5 rounded-xl border border-border">
 <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Epistemic Status</span>
 {getEpistemicBadge(selectedDim.status)}
 </div>

 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Confidence Rationale</span>
 <p className="text-xs font-mono text-text-primary bg-surface-hover p-3 rounded-lg border border-border m-0">
 {selectedDim.confidenceScore}
 </p>
 </div>

 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Telemetry Summary</span>
 <p className="text-sm font-semibold text-text-primary leading-relaxed bg-surface-hover p-4 rounded-xl border border-border m-0">
 {selectedDim.telemetrySummary}
 </p>
 </div>

 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Epistemic Trace Note</span>
 <p className="text-xs text-text-secondary leading-normal italic m-0">
 "{selectedDim.epistemicNote}"
 </p>
 </div>
 </div>

 <div className="pt-2 border-t border-border flex justify-end">
 <Button type="button" size="sm" onClick={() => setSelectedDim(null)}>
 Close Inspector
 </Button>
 </div>
 </div>
 </div>
 )}

 </CardContent>
 </Card>
 );
}