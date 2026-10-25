// src/features/fourth-parties/FourthPartiesWorkspace.tsx
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';
import { DeepLinkBanner } from '../../shared/ui/DeepLinkBanner';
import { 
 Waypoints, Search, Building2, Database, FileText, Activity, ArrowRight, X, Link 
} from 'lucide-react';
import { Card, CardContent, Button, EmptyState, Eyebrow} from '../../shared/ui/core';
import { NetworkErrorBanner, PermissionErrorModal, ExpiredSessionModal } from '../../shared/ui/ErrorStates';

export type FourthPartyCriticality = 'Tier 1' | 'Tier 2' | 'Tier 3';

export interface FourthPartyRecord {
 id: string;
 primaryVendor: string;
 fourthPartyName: string;
 service: string;
 dataAccessed: string;
 relationshipType: 'Infrastructure Host' | 'CDN / Edge' | 'Identity Provider' | 'Payment Gateway' | 'Analytics & Logging';
 criticality: FourthPartyCriticality;
 evidenceStatus: 'Verified' | 'Awaiting Review' | 'Missing' | 'Expired';
 monitoringStatus: 'Active' | 'Degraded' | 'Paused';
 knownIssues: string;
 exitImplications: string;
 evidenceRef: string;
 riskEventRef: string;
 decisionRef: string;
}

const DEV_FOURTH_PARTIES: FourthPartyRecord[] = [
 {
 id: 'FP-06',
 primaryVendor: 'GlobalHR Systems',
 fourthPartyName: 'AWS eu-central-1 (Frankfurt)',
 service: 'HR Data Processing & Payroll Compute (new sub-processor)',
 dataAccessed: 'Employee PII & Payroll Records (EU)',
 relationshipType: 'Infrastructure Host',
 criticality: 'Tier 2',
 evidenceStatus: 'Awaiting Review',
 monitoringStatus: 'Active',
 knownIssues: 'Newly detected. Alters approved geographic data residency boundaries — requires DPA review.',
 exitImplications: 'Medium friction. Data residency re-certification required before production cutover.',
 evidenceRef: 'Pending — sub-processor disclosure requested',
 riskEventRef: 'None',
 decisionRef: 'Pending — DPA review (due in 7 days)'
 },
 {
 id: 'FP-01',
 primaryVendor: 'CloudScale Infrastructure',
 fourthPartyName: 'AWS (Amazon Web Services)',
 service: 'Core EC2 Compute & S3 Object Storage',
 dataAccessed: 'Tier 1 Customer PII & Production Workloads',
 relationshipType: 'Infrastructure Host',
 criticality: 'Tier 1',
 evidenceStatus: 'Verified',
 monitoringStatus: 'Active',
 knownIssues: 'None. Continuous API telemetry shows stable multi-region redundancy.',
 exitImplications: 'High friction. Full container migration and S3 state re-indexing required (Estimated 60-90 days).',
 evidenceRef: 'AWS_SOC2_TypeII_2026.pdf',
 riskEventRef: 'RE-2026-044 (AWS US-East Latency Spike)',
 decisionRef: 'DEC-2026-012 (Cloud Hosting Approval)'
 },
 {
 id: 'FP-02',
 primaryVendor: 'CloudScale Infrastructure',
 fourthPartyName: 'Fastly Global CDN',
 service: 'Edge Caching & DDoS Mitigation',
 dataAccessed: 'Static Assets & TLS Termination Headers',
 relationshipType: 'CDN / Edge',
 criticality: 'Tier 2',
 evidenceStatus: 'Verified',
 monitoringStatus: 'Active',
 knownIssues: 'Minor cipher deprecation warning on secondary edge POPs.',
 exitImplications: 'Moderate friction. DNS CNAME redirection to Cloudflare or Akamai (Estimated 5 business days).',
 evidenceRef: 'Fastly_ISO27001_Cert.pdf',
 riskEventRef: 'RE-2026-118 (Edge Cipher Update)',
 decisionRef: 'DEC-2026-045 (CDN Integration)'
 },
 {
 id: 'FP-03',
 primaryVendor: 'SecureAuth Identity',
 fourthPartyName: 'Twilio Verify',
 service: 'SMS OTP & Voice Authentication Fallback',
 dataAccessed: 'User Mobile Numbers & One-Time Passcodes',
 relationshipType: 'Identity Provider',
 criticality: 'Tier 1',
 evidenceStatus: 'Expired',
 monitoringStatus: 'Degraded',
 knownIssues: 'SMS interception vulnerabilities noted in recent carrier routing audits.',
 exitImplications: 'Critical friction. Halts MFA recovery workflows until FIDO2/WebAuthn is fully mandated.',
 evidenceRef: 'Twilio_SOC2_2025.pdf (Expired)',
 riskEventRef: 'RE-2026-204 (SMS Carrier Gateway Outage)',
 decisionRef: 'DEC-2026-088 (MFA Exception Review)'
 },
 {
 id: 'FP-04',
 primaryVendor: 'Apex Gateway Payments',
 fourthPartyName: 'Stripe Connect',
 service: 'Merchant Account Settlement Routing',
 dataAccessed: 'Tokenized Cardholder Data & Transaction Logs',
 relationshipType: 'Payment Gateway',
 criticality: 'Tier 1',
 evidenceStatus: 'Verified',
 monitoringStatus: 'Active',
 knownIssues: 'None. Direct API compliance maintained under PCI-DSS Level 1.',
 exitImplications: 'Severe friction. Re-integration of checkout webhooks and merchant ledger reconciliation (Estimated 45 days).',
 evidenceRef: 'Stripe_PCI_DSS_Attestation.pdf',
 riskEventRef: 'None',
 decisionRef: 'DEC-2026-033 (Payment Routing)'
 },
 {
 id: 'FP-05',
 primaryVendor: 'DataFlow Analytics',
 fourthPartyName: 'Snowflake Data Cloud',
 service: 'Multi-Tenant Data Warehouse',
 dataAccessed: 'Aggregated Business Intelligence & Log Telemetry',
 relationshipType: 'Analytics & Logging',
 criticality: 'Tier 2',
 evidenceStatus: 'Awaiting Review',
 monitoringStatus: 'Active',
 knownIssues: 'Subprocessor region mapping requires DPA exhibit update for EU data residency.',
 exitImplications: 'Moderate friction. Data export to alternative data lakehouse (Estimated 14 days).',
 evidenceRef: 'Snowflake_SOC2_2026.pdf',
 riskEventRef: 'RE-2026-302 (DPA Region Flag)',
 decisionRef: 'DEC-2026-102 (Analytics Architecture)'
 }
];

export function FourthPartiesWorkspace() {
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
 const [criticalityFilter, setCriticalityFilter] = useState<string>('All');
 const [relationshipFilter, setRelationshipFilter] = useState<string>('All');
 const [selectedRecord, setSelectedRecord] = useState<FourthPartyRecord | null>(null);

 // Error simulation states
 const [hasNetworkError, setHasNetworkError] = useState(false);
 const [showPermissionModal, setShowPermissionModal] = useState(false);
 const [showSessionExpired, setShowSessionExpired] = useState(false);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (selectedRecord) setSelectedRecord(null);
 if (hasNetworkError) setHasNetworkError(false);
 if (showPermissionModal) setShowPermissionModal(false);
 if (showSessionExpired) setShowSessionExpired(false);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedRecord, hasNetworkError, showPermissionModal, showSessionExpired]);

 const filteredRecords = useMemo(() => {
 return DEV_FOURTH_PARTIES.filter(fp => {
 const matchesSearch = 
 fp.primaryVendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
 fp.fourthPartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 fp.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
 fp.dataAccessed.toLowerCase().includes(searchQuery.toLowerCase());

 const matchesCriticality = criticalityFilter === 'All' || fp.criticality === criticalityFilter;
 const matchesRelationship = relationshipFilter === 'All' || fp.relationshipType === relationshipFilter;

 return matchesSearch && matchesCriticality && matchesRelationship;
 });
 }, [searchQuery, criticalityFilter, relationshipFilter]);

 const getCriticalityBadge = (crit: FourthPartyCriticality) => {
 const styles = {
 'Tier 1': 'bg-risk-critical/10 text-risk-critical ',
 'Tier 2': 'bg-risk-high/10 text-risk-high ',
 'Tier 3': 'bg-status-success/10 text-status-success '
 };
 return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[crit]}`}>{crit}</span>;
 };

 const getEvidenceBadge = (status: FourthPartyRecord['evidenceStatus']) => {
 switch (status) {
 case 'Verified': return <span className="text-status-success font-semibold">Verified</span>;
 case 'Awaiting Review': return <span className="text-info font-semibold">Awaiting Review</span>;
 case 'Missing': return <span className="text-risk-critical font-semibold">Missing</span>;
 case 'Expired': return <span className="text-risk-critical font-semibold">Expired</span>;
 }
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Fourth parties workspace loaded. {filteredRecords.length} subprocessor records match your filter criteria.
 </div>

 {hasNetworkError && <NetworkErrorBanner onRetry={() => setHasNetworkError(false)} />}
 {showPermissionModal && <PermissionErrorModal onClose={() => setShowPermissionModal(false)} />}
 {showSessionExpired && <ExpiredSessionModal onReauth={() => setShowSessionExpired(false)} />}

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Intelligence</Eyebrow>
 <h1 className="text-page-title">Fourth Parties & Hidden Dependency Risk</h1>
          {deepLink && (
            <div className="mt-3">
              <DeepLinkBanner
                label={`Search = "${deepLink}"`}
                source="Command Center"
                onClear={() => { setDeepLink(null); setSearchQuery(''); }}
              />
            </div>
          )}
 <p className="text-body-secondary mt-1">
 Expose unvetted subprocessors, underlying cloud hosts, and upstream supply chain dependencies.
 </p>
 </div>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <label htmlFor="fourthPartySearchInput" className="sr-only">Search primary vendors, fourth parties, services</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="fourthPartySearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search primary vendors, fourth parties, services..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="flex flex-wrap items-center gap-3">
 <div>
 <label htmlFor="fourthPartyCriticalityFilter" className="sr-only">Filter by criticality tier</label>
 <select
 id="fourthPartyCriticalityFilter"
 value={criticalityFilter}
 onChange={(e) => setCriticalityFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Criticalities</option>
 <option value="Tier 1">Tier 1</option>
 <option value="Tier 2">Tier 2</option>
 <option value="Tier 3">Tier 3</option>
 </select>
 </div>

 <div>
 <label htmlFor="fourthPartyRelationshipFilter" className="sr-only">Filter by relationship type</label>
 <select
 id="fourthPartyRelationshipFilter"
 value={relationshipFilter}
 onChange={(e) => setRelationshipFilter(e.target.value)}
 className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Relationship Types</option>
 <option value="Infrastructure Host">Infrastructure Host</option>
 <option value="CDN / Edge">CDN / Edge</option>
 <option value="Identity Provider">Identity Provider</option>
 <option value="Payment Gateway">Payment Gateway</option>
 <option value="Analytics & Logging">Analytics & Logging</option>
 </select>
 </div>
 </div>
 </CardContent>
 </Card>

 {filteredRecords.length > 0 ? (
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Fourth Parties and Subprocessor Dependency Records</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Primary Vendor & Subprocessor</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Service & Data</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Relationship</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Criticality</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Evidence</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Known Issues</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]"><span className="sr-only">Action</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredRecords.map((fp) => (
 <tr 
 key={fp.id} 
 onClick={() => setSelectedRecord(fp)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedRecord(fp);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect fourth party record ${fp.fourthPartyName} for primary vendor ${fp.primaryVendor}`}
 className="hover:bg-surface-hover transition-colors cursor-pointer group focus:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-info"
 >
 <td className="py-4 px-5">
 <div className="font-bold text-text-primary group-hover:text-info transition-colors">
 {fp.fourthPartyName}
 </div>
 <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1">
 <Building2 aria-hidden="true" size={12} /> Via: <span className="font-semibold text-text-secondary">{fp.primaryVendor}</span>
 </div>
 </td>

 <td className="py-4 px-4 max-w-xs">
 <div className="font-semibold text-text-primary text-xs truncate">{fp.service}</div>
 <div className="text-[11px] text-text-tertiary mt-0.5 truncate">{fp.dataAccessed}</div>
 </td>

 <td className="py-4 px-4 text-xs font-medium text-text-secondary">
 {fp.relationshipType}
 </td>

 <td className="py-4 px-4">
 {getCriticalityBadge(fp.criticality)}
 </td>

 <td className="py-4 px-4 text-xs">
 {getEvidenceBadge(fp.evidenceStatus)}
 </td>

 <td className="py-4 px-4 max-w-xs truncate text-xs text-text-secondary">
 {fp.knownIssues}
 </td>

 <td className="py-4 px-5 text-right">
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); setSelectedRecord(fp); }}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
 className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-text-secondary bg-base hover:bg-surface-hover border border-border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-info"
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
 icon={Waypoints}
 title={deepLink ? `No Results for "${deepLink}"` : "No Fourth-Party Subprocessors Found"}
 description={deepLink ? "No records match this deep link. The item may have been resolved, archived, or renamed." : "No fourth-party dependency records match your current filter or search criteria."}
 whatItIs="Inventory tracking upstream cloud hosts, CDNs, and hidden subservice providers utilized by your vendors."
 whyItsEmpty="Applied search query, criticality, or relationship filters eliminated all matching records."
 actionLabel={deepLink ? "Clear Deep Link" : "Reset Filters"}
 onAction={() => { setDeepLink(null); setSearchQuery(''); setCriticalityFilter('All'); setRelationshipFilter('All'); }}
 />
 )}

 {selectedRecord && createPortal(
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="fourth-party-modal-title"
 className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
 >
 <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 space-y-6">
 
 <div className="flex items-start justify-between border-b border-border pb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono text-xs font-bold text-info bg-info/10 px-2 py-0.5 rounded border border-info/30">{selectedRecord.id}</span>
 {getCriticalityBadge(selectedRecord.criticality)}
 <span className="text-xs font-bold text-text-secondary">{selectedRecord.relationshipType}</span>
 </div>
 <h2 id="fourth-party-modal-title" className="text-base font-bold text-text-primary mt-1 m-0">{selectedRecord.fourthPartyName}</h2>
 </div>
 <button 
 type="button"
 onClick={() => setSelectedRecord(null)} 
 className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 aria-label="Close fourth-party inspector"
 >
 <X aria-hidden="true" size={18} />
 </button>
 </div>

 <div className="space-y-4 text-xs">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Primary Vendor Relationship</span>
 <div className="font-bold text-text-primary flex items-center gap-1.5 mt-1">
 <Building2 aria-hidden="true" size={14} className="text-text-tertiary" /> {selectedRecord.primaryVendor}
 </div>
 </div>

 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Data Accessed</span>
 <div className="font-bold text-text-primary flex items-center gap-1.5 mt-1">
 <Database aria-hidden="true" size={14} className="text-text-tertiary" /> {selectedRecord.dataAccessed}
 </div>
 </div>
 </div>

 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Exit & Replacement Implications</span>
 <p className="text-text-primary font-medium leading-relaxed m-0">{selectedRecord.exitImplications}</p>
 </div>

 <div className="bg-base border border-border p-4 rounded-xl space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Known Issues & Telemetry Signals</span>
 <p className="text-text-primary font-medium leading-relaxed m-0">{selectedRecord.knownIssues}</p>
 </div>

 <div className="border-t border-border-subtle pt-4 space-y-3">
 <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary m-0">System & Evidence Linkage</h4>
 
 <div className="flex items-center justify-between p-3 bg-base border border-border rounded-lg">
 <div className="flex items-center gap-2">
 <FileText aria-hidden="true" size={16} className="text-text-tertiary" />
 <div>
 <div className="font-semibold text-text-primary text-xs">Supporting Evidence Artifact</div>
 <div className="text-[11px] font-mono text-info">{selectedRecord.evidenceRef}</div>
 </div>
 </div>
 <button type="button" onClick={() => { setSelectedRecord(null); navigateTo('evidence', { vendorName: selectedRecord.primaryVendor }); }} className="text-[11px] font-semibold text-text-secondary hover:underline hover:text-info cursor-pointer focus:outline-none focus:ring-2 focus:ring-info rounded">View Evidence</button>
 </div>

 <div className="flex items-center justify-between p-3 bg-base border border-border rounded-lg">
 <div className="flex items-center gap-2">
 <Activity aria-hidden="true" size={16} className="text-text-tertiary" />
 <div>
 <div className="font-semibold text-text-primary text-xs">Risk Event / Signal Trace</div>
 <div className="text-[11px] font-mono text-risk-high font-bold">{selectedRecord.riskEventRef}</div>
 </div>
 </div>
 <button type="button" onClick={() => { setSelectedRecord(null); navigateTo('risk-events', { vendorName: selectedRecord.primaryVendor }); }} className="text-[11px] font-semibold text-text-secondary hover:underline hover:text-info cursor-pointer focus:outline-none focus:ring-2 focus:ring-info rounded">View Risk Event</button>
 </div>

 <div className="flex items-center justify-between p-3 bg-base border border-border rounded-lg">
 <div className="flex items-center gap-2">
 <Link aria-hidden="true" size={16} className="text-text-tertiary" />
 <div>
 <div className="font-semibold text-text-primary text-xs">Governing Decision Record</div>
 <div className="text-[11px] font-mono text-accent font-bold">{selectedRecord.decisionRef}</div>
 </div>
 </div>
 <button type="button" onClick={() => { setSelectedRecord(null); navigateTo('decisions', { vendorName: selectedRecord.primaryVendor }); }} className="text-[11px] font-semibold text-text-secondary hover:underline hover:text-info cursor-pointer focus:outline-none focus:ring-2 focus:ring-info rounded">View Decision</button>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
 <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedRecord(null)}>
 Close Inspector
 </Button>
 </div>

 </div>
 </div>
 , document.body)}

 </div>
 );
}