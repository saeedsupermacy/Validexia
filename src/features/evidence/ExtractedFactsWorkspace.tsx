// src/features/evidence/ExtractedFactsWorkspace.tsx
import { useState, useEffect } from 'react';
import { 
 
 FileText, Search, Check, X, Info, Link 
} from 'lucide-react';
import { Card, CardContent, Eyebrow} from '../../shared/ui/core';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';

export type ExtractionStatus = 'AI Extracted' | 'Manual Verified' | 'Needs Audit';
export type ReviewerDecisionStatus = 'Pending' | 'Verified' | 'Flagged';

export interface ExtractedFactRecord {
 id: string;
 factStatement: string;
 sourceDocument: string;
 vendorName: string;
 exactLocation: string;
 confidenceScore: string;
 extractionStatus: ExtractionStatus;
 reviewerStatus: ReviewerDecisionStatus;
 relatedControl: string;
}

const DEV_FACTS_DATA: ExtractedFactRecord[] = [
 {
 id: 'fact-01',
 factStatement: 'Encryption at rest is enabled using AES-256 keys managed via AWS KMS.',
 sourceDocument: 'CloudScale_SOC2_TypeII_2026.pdf',
 vendorName: 'CloudScale Infrastructure',
 exactLocation: 'Page 14, Section 4.1 (Data Encryption)',
 confidenceScore: '96.4% High',
 extractionStatus: 'AI Extracted',
 reviewerStatus: 'Verified',
 relatedControl: 'CC6.1 Logical Access Controls'
 },
 {
 id: 'fact-02',
 factStatement: 'Multi-factor authentication (MFA) is strictly enforced for all administrative console access.',
 sourceDocument: 'SecureAuth_ISO27001_Audit_Q4.pdf',
 vendorName: 'SecureAuth Identity',
 exactLocation: 'Page 8, Sub-clause 9.1.2 (Privileged Access)',
 confidenceScore: '92.1% High',
 extractionStatus: 'AI Extracted',
 reviewerStatus: 'Pending',
 relatedControl: 'ISO A.9 Access Control'
 },
 {
 id: 'fact-03',
 factStatement: 'Perimeter gateway firewall utilizes deprecated cipher suites on port 8443.',
 sourceDocument: 'ApexGateway_PenTest_2026.pdf',
 vendorName: 'Apex Gateway Payments',
 exactLocation: 'Page 22, Findings Log #3',
 confidenceScore: '74.5% Medium',
 extractionStatus: 'Needs Audit',
 reviewerStatus: 'Flagged',
 relatedControl: 'OWASP Top 10 / Vuln Mgmt'
 },
 {
 id: 'fact-04',
 factStatement: 'Automated daily database backups are replicated across multi-region object storage.',
 sourceDocument: 'DataFlow_SIG_Lite_v4.xlsx',
 vendorName: 'DataFlow Analytics',
 exactLocation: 'Tab 3, Row 44 (Disaster Recovery)',
 confidenceScore: '98.9% High',
 extractionStatus: 'Manual Verified',
 reviewerStatus: 'Verified',
 relatedControl: 'SIG-BCR-02 Backup Integrity'
 }
];

export function ExtractedFactsWorkspace() {
 const [facts, setFacts] = useState<ExtractedFactRecord[]>(DEV_FACTS_DATA);
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('All');

 // Deep link: pre-fill search when arriving from another tab
 useEffect(() => {
 const params = getNavParams();
 const q = params.search || params.vendorName;
 if (q && typeof q === 'string') {
 setSearchQuery(q);
 }
 if (q) clearNavParams();
 }, []);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (searchQuery) setSearchQuery('');
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [searchQuery]);

 const filteredFacts = facts.filter(f => {
 const matchesSearch = 
 f.factStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
 f.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 f.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()) ||
 f.relatedControl.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesStatus = statusFilter === 'All' || f.reviewerStatus === statusFilter;
 return matchesSearch && matchesStatus;
 });

 const handleUpdateStatus = (id: string, newStatus: ReviewerDecisionStatus) => {
 setFacts(prev => prev.map(f => f.id === id ? { ...f, reviewerStatus: newStatus } : f));
 };

 const getReviewerBadge = (status: ReviewerDecisionStatus) => {
 switch (status) {
 case 'Verified':
 return <span className="px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-success/10 text-status-success ">Verified</span>;
 case 'Pending':
 return <span className="px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-warning/10 text-status-warning ">Pending Review</span>;
 case 'Flagged':
 return <span className="px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">Flagged / Disputed</span>;
 }
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Extracted evidence facts ledger loaded. {filteredFacts.length} fact records match your filter criteria.
 </div>

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Program</Eyebrow>
 <h1 className="text-page-title">Extracted Evidence Facts Ledger</h1>
 <p className="text-body-secondary mt-1">
 Inspect parsed compliance facts with strict source provenance, page citations, and confidence tracing.
 </p>
 </div>
 </div>

 {/* Epistemic Provenance Notice */}
 <div className="bg-base border border-border p-4 rounded-xl flex items-start gap-3 text-xs text-text-secondary">
 <Info aria-hidden="true" size={16} className="text-info shrink-0 mt-0.5" />
 <p className="m-0">
 <strong className="text-text-primary">Epistemic Rule:</strong> AI-extracted compliance facts are unverified assertions until explicitly reviewed and tied to a verified control mapping. Provenance citations are mandatory for all risk model ingestions.
 </p>
 </div>

 {/* Filters & Search */}
 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 <div className="relative w-full sm:w-80">
 <label htmlFor="factsSearchInput" className="sr-only">Search facts, vendors, controls</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="factsSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search facts, vendors, controls..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Reviewer Status Filters">
 {['All', 'Verified', 'Pending', 'Flagged'].map((st) => (
 <button
 key={st}
 type="button"
 onClick={() => setStatusFilter(st)}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 statusFilter === st 
 ? 'bg-surface-hover text-text-primary font-bold shadow-sm border border-border-strong' 
 : 'bg-base border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
 }`}
 >
 {st}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Facts Table Ledger */}
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <caption className="sr-only">Extracted Evidence Facts and Provenance Ledger</caption>
 <thead className="text-label whitespace-nowrap">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Extracted Statement</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Source & Location Citation</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Related Control & Vendor</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Confidence & Parsing</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Reviewer Status</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]">Governance Actions</th>
 </tr>
 </thead>
 <tbody className="bg-surface">
 {filteredFacts.length > 0 ? (
 filteredFacts.map((fact) => (
 <tr key={fact.id} className="hover:bg-surface-hover transition-colors group">
 <td className="py-4 px-5 max-w-sm">
 <p className="text-xs font-bold text-text-primary leading-normal m-0">
 "{fact.factStatement}"
 </p>
 </td>

 <td className="py-4 px-4 whitespace-nowrap">
 <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
 <FileText aria-hidden="true" size={14} className="text-text-tertiary shrink-0" />
 <span className="truncate">{fact.sourceDocument}</span>
 </div>
 <span className="text-[10px] font-mono text-info mt-0.5 block">{fact.exactLocation}</span>
 </td>

 <td className="py-4 px-4 whitespace-nowrap">
 <span className="text-xs font-mono font-medium text-text-primary bg-base px-2 py-1 rounded border border-border block w-fit">
 {fact.relatedControl}
 </span>
 <span className="text-[11px] text-text-tertiary mt-1 block">{fact.vendorName}</span>
 </td>

 <td className="py-4 px-4 whitespace-nowrap">
 <span className="text-xs font-mono font-bold text-text-primary block">{fact.confidenceScore}</span>
 <span className="text-[10px] text-text-tertiary uppercase font-bold">{fact.extractionStatus}</span>
 </td>

 <td className="py-4 px-4 whitespace-nowrap">
 {getReviewerBadge(fact.reviewerStatus)}
 </td>

 <td className="py-4 px-5 text-right whitespace-nowrap">
 <div className="flex items-center justify-end gap-2">
 <button 
 type="button"
 onClick={() => navigateTo('evidence', { vendorName: fact.vendorName })}
 className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded text-[11px] font-semibold text-accent bg-accent-muted hover:bg-accent-muted transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-info "
 >
 <Link aria-hidden="true" size={12} className="opacity-70" /> Show Citation
 </button>
 <button
 type="button"
 onClick={() => handleUpdateStatus(fact.id, 'Verified')}
 className={`inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-info ${
 fact.reviewerStatus === 'Verified' 
 ? 'bg-status-success text-white border border-transparent shadow-sm' 
 : 'bg-status-success/10 text-status-success border border-transparent hover:bg-status-success/15 dark:text-status-success'
 }`}
 >
 <Check aria-hidden="true" size={14} />
 <span>Verify</span>
 </button>

 <button
 type="button"
 onClick={() => handleUpdateStatus(fact.id, 'Flagged')}
 className={`inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-info ${
 fact.reviewerStatus === 'Flagged' 
 ? 'bg-risk-critical text-white border border-transparent shadow-sm' 
 : 'bg-risk-critical/10 text-risk-critical border border-transparent hover:bg-risk-critical/15 dark:text-risk-critical'
 }`}
 >
 <X aria-hidden="true" size={14} />
 <span>Flag</span>
 </button>
 </div>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={6} className="py-12 text-center text-sm text-text-tertiary">
 No extracted facts match your filter criteria.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </Card>

 </div>
 );
}