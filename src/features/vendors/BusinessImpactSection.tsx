// src/features/vendors/BusinessImpactSection.tsx
import React, { useState, useEffect } from 'react';
import { 
 Briefcase, Database, DollarSign, ShieldAlert, Clock, 
 RefreshCw, Server, FileText, X 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../shared/ui/core';

export interface BusinessImpactDimension {
 id: string;
 label: string;
 icon: React.ReactNode;
 severity: 'Critical' | 'High' | 'Moderate' | 'Low';
 headline: string;
 detailedAnalysis: string;
 metricLabel: string;
 metricValue: string;
}

export interface BusinessImpactModel {
 vendorId: string;
 overallImpactTier: string;
 summaryRationale: string;
 dimensions: BusinessImpactDimension[];
}

const DEFAULT_BUSINESS_IMPACT_MODEL: BusinessImpactModel = {
 vendorId: 'vend-001',
 overallImpactTier: 'Tier 1 - Extreme Business Exposure',
 summaryRationale: 'While technical perimeter security may be hardened, this vendor represents an existential operational risk due to tight coupling with core billing engines and multi-month vendor replacement friction.',
 dimensions: [
 {
 id: 'data_sensitivity',
 label: 'Data Sensitivity',
 icon: <Database aria-hidden="true" size={16} className="text-info" />,
 severity: 'Critical',
 headline: 'PCI-DSS Level 1 & Customer PII Handled',
 detailedAnalysis: 'Processes unencrypted primary account numbers (PAN) and authentication tokens across 3 active API gateways. Any data exfiltration triggers mandatory 72-hour regulatory disclosure under GDPR/CCPA.',
 metricLabel: 'Records Processed',
 metricValue: '1.4M active user records'
 },
 {
 id: 'operational_criticality',
 label: 'Operational Criticality',
 icon: <Server aria-hidden="true" size={16} className="text-risk-critical" />,
 severity: 'Critical',
 headline: 'Core Billing & Invoicing Dependency',
 detailedAnalysis: 'Serves as the underlying infrastructure for automated invoicing and payment settlement. An outage directly halts cash collection workflows within 4 hours.',
 metricLabel: 'Max Tolerable Downtime',
 metricValue: '2 hours (RTO)'
 },
 {
 id: 'revenue_dependency',
 label: 'Revenue Dependency',
 icon: <DollarSign aria-hidden="true" size={16} className="text-risk-critical" />,
 severity: 'High',
 headline: '$4.2M Quarterly Transaction Throughput',
 detailedAnalysis: 'Directly mediates approximately 35% of total enterprise recurring billing transactions. Failure results in immediate revenue deferral and billing queue stalls.',
 metricLabel: 'Throughput Share',
 metricValue: '35% of ARR flow'
 },
 {
 id: 'regulatory_impact',
 label: 'Regulatory Impact',
 icon: <ShieldAlert aria-hidden="true" size={16} className="text-status-warning" />,
 severity: 'High',
 headline: 'Strict DPA & SOC 2 Mandates',
 detailedAnalysis: 'Bound by strict Data Processing Agreements (DPAs) with severe indemnification caps. Non-compliance exposes the firm to statutory fines up to 4% of global turnover.',
 metricLabel: 'Statutory Exposure',
 metricValue: 'Up to €20M / 4% global rev'
 },
 {
 id: 'recovery_requirements',
 label: 'Recovery Requirements',
 icon: <Clock aria-hidden="true" size={16} className="text-status-warning" />,
 severity: 'Moderate',
 headline: 'Aggressive RPO / RTO SLAs',
 detailedAnalysis: 'Disaster recovery targets demand a Recovery Point Objective (RPO) of zero data loss and Recovery Time Objective (RTO) under 60 minutes for secondary failover.',
 metricLabel: 'SLA Target',
 metricValue: 'RPO: 0 | RTO: <60m'
 },
 {
 id: 'replacement_difficulty',
 label: 'Replacement Difficulty',
 icon: <RefreshCw aria-hidden="true" size={16} className="text-risk-critical" />,
 severity: 'Critical',
 headline: '6–9 Month Technical Migration Horizon',
 detailedAnalysis: 'Proprietary database schemas and custom SDK integrations mean migrating to an alternative cloud hosting provider requires deep engineering refactoring and extensive QA cycles.',
 metricLabel: 'Estimated Migration',
 metricValue: '210 engineering days'
 },
 {
 id: 'internal_system_dependency',
 label: 'Internal System Dependency',
 icon: <Briefcase aria-hidden="true" size={16} className="text-info" />,
 severity: 'High',
 headline: 'Tightly Coupled Microservices',
 detailedAnalysis: 'Connected directly to 4 internal microservices via synchronous gRPC calls. A failure cascades upstream, degrading customer dashboard responsiveness.',
 metricLabel: 'Upstream Services',
 metricValue: '4 dependent clusters'
 },
 {
 id: 'contractual_dependency',
 label: 'Contractual Dependency',
 icon: <FileText aria-hidden="true" size={16} className="text-text-secondary" />,
 severity: 'Moderate',
 headline: 'Multi-Year Lock-in with 90-Day Notice',
 detailedAnalysis: 'Current contract runs through Q4 2028 with strict early termination penalties equivalent to remaining licensing fees.',
 metricLabel: 'Lock-in Horizon',
 metricValue: 'Active through Oct 2028'
 }
 ]
};

export function BusinessImpactSection({ model = DEFAULT_BUSINESS_IMPACT_MODEL }: { model?: BusinessImpactModel }) {
 const [selectedDimension, setSelectedDimension] = useState<BusinessImpactDimension | null>(null);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && selectedDimension) {
 setSelectedDimension(null);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedDimension]);

 const getSeverityBadge = (severity: BusinessImpactDimension['severity']) => {
 switch (severity) {
 case 'Critical':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">Critical</span>;
 case 'High':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-high/10 text-risk-high ">High</span>;
 case 'Moderate':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-warning/10 text-status-warning ">Moderate</span>;
 case 'Low':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-success/10 text-status-success ">Low</span>;
 }
 };

 return (
 <Card className="shadow-sm overflow-hidden border-border-strong">
 <CardHeader className="bg-surface border-b border-border px-6 py-4 flex flex-row items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info">
 <Briefcase size={18} />
 </div>
 <div>
 <CardTitle className="text-base font-bold text-text-primary">Business Impact & Enterprise Coupling</CardTitle>
 <p className="text-xs text-text-secondary mt-0.5">Structured operational, financial, and regulatory exposure dimensions</p>
 </div>
 </div>
 <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-risk-critical/10 text-risk-critical ">
 {model.overallImpactTier}
 </span>
 </CardHeader>

 <CardContent className="p-6 space-y-6 bg-surface">
 
 {/* Summary Rationale */}
 <div className="bg-surface-hover/60 border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Impact Synthesis</span>
 <p className="text-sm font-semibold text-text-primary leading-relaxed m-0">
 "{model.summaryRationale}"
 </p>
 </div>

 {/* 8 Structured Dimensions Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
 {model.dimensions.map((dim) => (
 <div 
 key={dim.id}
 onClick={() => setSelectedDimension(dim)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedDimension(dim);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect business impact dimension ${dim.label}: ${dim.headline}`}
 className="p-4 rounded-xl border border-border bg-base flex flex-col justify-between space-y-3 cursor-pointer hover:border-info transition-all group focus:outline-none focus:ring-2 focus:ring-info"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2">
 <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-surface border border-border-strong flex items-center justify-center shrink-0">
 {dim.icon}
 </div>
 <span className="text-xs font-bold text-text-primary">{dim.label}</span>
 </div>
 {getSeverityBadge(dim.severity)}
 </div>

 <div className="space-y-1">
 <p className="text-xs font-semibold text-text-primary line-clamp-1 group-hover:text-info transition-colors m-0">
 {dim.headline}
 </p>
 <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-1 border-t border-border-subtle">
 <span>{dim.metricLabel}:</span>
 <strong className="text-text-primary font-bold">{dim.metricValue}</strong>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Inspectable Drawer / Modal when a dimension is clicked */}
 {selectedDimension && (
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="business-impact-modal-title"
 className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
 onClick={() => setSelectedDimension(null)}
 >
 <div className="bg-surface border border-border-strong rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between border-b border-border pb-4">
 <div className="flex items-center gap-2.5">
 <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-surface border border-border-strong flex items-center justify-center">
 {selectedDimension.icon}
 </div>
 <div>
 <h3 id="business-impact-modal-title" className="text-base font-bold text-text-primary m-0">{selectedDimension.label}</h3>
 <p className="text-xs text-text-secondary m-0">Detailed operational exposure analysis</p>
 </div>
 </div>
 <button 
 type="button"
 onClick={() => setSelectedDimension(null)}
 aria-label="Close dimension inspector"
 className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 <X aria-hidden="true" size={16} />
 </button>
 </div>

 <div className="space-y-4 text-xs">
 <div className="flex items-center justify-between bg-base p-3 rounded-xl border border-border">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Severity Level</span>
 {getSeverityBadge(selectedDimension.severity)}
 </div>

 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Key Finding</span>
 <p className="text-sm font-bold text-text-primary m-0">{selectedDimension.headline}</p>
 </div>

 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Operational Impact Analysis</span>
 <p className="text-sm text-text-secondary leading-relaxed bg-surface-hover p-4 rounded-xl border border-border font-medium m-0">
 {selectedDimension.detailedAnalysis}
 </p>
 </div>

 <div className="flex items-center justify-between bg-base p-3.5 rounded-xl border border-border font-mono text-xs">
 <span className="text-text-tertiary">{selectedDimension.metricLabel}:</span>
 <strong className="text-text-primary font-bold">{selectedDimension.metricValue}</strong>
 </div>
 </div>

 <div className="pt-2 border-t border-border flex justify-end">
 <Button type="button" size="sm" onClick={() => setSelectedDimension(null)}>
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