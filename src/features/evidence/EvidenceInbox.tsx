// src/features/evidence/EvidenceInbox.tsx
import { useState, useEffect } from 'react';
import {
 FileText, CheckCircle2, AlertTriangle, Clock, 
 XCircle, Loader2, ArrowRight, Search, UserCheck, Upload 
} from 'lucide-react';
import { Card, CardContent, Button, Eyebrow} from '../../shared/ui/core';
import { EvidenceInspectorWorkspace } from './EvidenceInspectorWorkspace';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';

export type EvidenceInboxStatus = 'Uploaded' | 'Processing' | 'Needs review' | 'Verified' | 'Rejected' | 'Expired';

export interface EvidenceInboxItem {
 id: string;
 documentName: string;
 vendorName: string;
 evidenceType: string;
 receivedTimestamp: string;
 status: EvidenceInboxStatus;
 expirationDate: string;
 assignedReviewer: string;
 nextAction: string;
}

const DEV_INBOX_ITEMS: EvidenceInboxItem[] = [
 {
 id: 'inbox-01',
 documentName: 'CloudScale_SOC2_TypeII_2026.pdf',
 vendorName: 'CloudScale Infrastructure',
 evidenceType: 'SOC 2 Type II',
 receivedTimestamp: 'Today, 09:14 AM',
 status: 'Needs review',
 expirationDate: 'Oct 1, 2026',
 assignedReviewer: 'Sarah Jenkins',
 nextAction: 'Verify attestation date and map unpatched CVE exceptions'
 },
 {
 id: 'inbox-02',
 documentName: 'SecureAuth_ISO27001_Audit_Q4.pdf',
 vendorName: 'SecureAuth Identity',
 evidenceType: 'ISO 27001',
 receivedTimestamp: 'Yesterday, 04:30 PM',
 status: 'Processing',
 expirationDate: 'Jun 14, 2027',
 assignedReviewer: 'Automated Pipeline',
 nextAction: 'Awaiting OCR & control mapping vector extraction'
 },
 {
 id: 'inbox-03',
 documentName: 'ApexGateway_SIG_Lite_v4.xlsx',
 vendorName: 'Apex Gateway Payments',
 evidenceType: 'SIG Questionnaire',
 receivedTimestamp: 'Oct 3, 2026',
 status: 'Uploaded',
 expirationDate: 'Pending extraction',
 assignedReviewer: 'Unassigned',
 nextAction: 'Assign reviewer and initiate document ingestion'
 },
 {
 id: 'inbox-04',
 documentName: 'DataFlow_PenTest_Report_2026.pdf',
 vendorName: 'DataFlow Analytics',
 evidenceType: 'Penetration Test',
 receivedTimestamp: 'Sep 28, 2026',
 status: 'Verified',
 expirationDate: 'Aug 22, 2027',
 assignedReviewer: 'Alex Rivera',
 nextAction: 'Archived to Evidence Repository'
 },
 {
 id: 'inbox-05',
 documentName: 'SynapseAI_DPA_Exhibit_B.pdf',
 vendorName: 'Synapse AI Services',
 evidenceType: 'DPA / Legal Exhibit',
 receivedTimestamp: 'Sep 20, 2026',
 status: 'Rejected',
 expirationDate: 'N/A',
 assignedReviewer: 'Marcus Chen',
 nextAction: 'Request counter-signed legal signature from vendor'
 },
 {
 id: 'inbox-06',
 documentName: 'Legacy_CloudHost_SOC2_2025.pdf',
 vendorName: 'Legacy Host Corp',
 evidenceType: 'SOC 2 Type II',
 receivedTimestamp: 'Oct 1, 2025',
 status: 'Expired',
 expirationDate: 'Expired Oct 1, 2026',
 assignedReviewer: 'Sarah Jenkins',
 nextAction: 'Request updated annual attestation document'
 }
];

export function EvidenceInbox() {
 const [inboxItems] = useState<EvidenceInboxItem[]>(DEV_INBOX_ITEMS);
 const [statusFilter, setStatusFilter] = useState<string>('All');
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedItemForReview, setSelectedItemForReview] = useState<EvidenceInboxItem | null>(null);

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
 if (selectedItemForReview) setSelectedItemForReview(null);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedItemForReview]);

 const filteredItems = inboxItems.filter(item => {
 const matchesSearch = 
 item.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.evidenceType.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
 return matchesSearch && matchesStatus;
 });

 const getStatusBadge = (status: EvidenceInboxStatus) => {
 switch (status) {
 case 'Uploaded':
 return <span className="px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-surface text-text-tertiary border border-border-strong">Uploaded</span>;
 case 'Processing':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-info/10 text-info">
 <Loader2 aria-hidden="true" size={12} className="animate-spin" /> Processing
 </span>
 );
 case 'Needs review':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-warning/10 text-status-warning ">
 <AlertTriangle aria-hidden="true" size={12} /> Needs Review
 </span>
 );
 case 'Verified':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-success/10 text-status-success ">
 <CheckCircle2 aria-hidden="true" size={12} /> Verified
 </span>
 );
 case 'Rejected':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">
 <XCircle aria-hidden="true" size={12} /> Rejected
 </span>
 );
 case 'Expired':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-high/10 text-risk-high ">
 <Clock aria-hidden="true" size={12} /> Expired
 </span>
 );
 }
 };

 if (selectedItemForReview) {
 return (
 <EvidenceInspectorWorkspace
 documentId={selectedItemForReview.id}
 documentName={selectedItemForReview.documentName}
 vendorName={selectedItemForReview.vendorName}
 onBack={() => setSelectedItemForReview(null)}
 />
 );
 }

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Evidence intake inbox loaded. {filteredItems.length} documents match your filter criteria.
 </div>

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Program</Eyebrow>
 <h1 className="text-page-title">Evidence Intake & Processing Inbox</h1>
 <p className="text-body-secondary mt-1">
 Review, triage, and process incoming compliance artifacts through the extraction and verification pipeline.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button type="button" variant="primary" size="sm" onClick={() => navigateTo('evidence', { openUpload: 'true' })}>
 <Upload aria-hidden="true" size={14} className="mr-1.5" />
 Upload New Artifact
 </Button>
 </div>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 <div className="relative w-full sm:w-80">
 <label htmlFor="evidenceInboxSearch" className="sr-only">Search documents or vendors</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="evidenceInboxSearch"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search documents or vendors..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Status Filters">
 {['All', 'Uploaded', 'Processing', 'Needs review', 'Verified', 'Rejected', 'Expired'].map((status) => (
 <button
 key={status}
 type="button"
 onClick={() => setStatusFilter(status)}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 statusFilter === status 
 ? 'bg-surface-hover text-text-primary font-bold shadow-sm border border-border-strong' 
 : 'bg-base border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
 }`}
 >
 {status}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Evidence Intake Pipeline and Document Inbox Records</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Document & Vendor</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Type / Received</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Pipeline Status</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Reviewer</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Required Next Action</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredItems.length > 0 ? (
 filteredItems.map((item) => (
 <tr 
 key={item.id} 
 onClick={() => setSelectedItemForReview(item)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedItemForReview(item);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Review artifact ${item.documentName} for ${item.vendorName}`}
 className="hover:bg-surface-hover transition-colors cursor-pointer group focus:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-info"
 >
 <td className="py-3.5 px-5">
 <div className="font-bold text-text-primary flex items-center gap-2">
 <FileText aria-hidden="true" size={16} className="text-text-tertiary shrink-0" />
 <span>{item.documentName}</span>
 </div>
 <div className="text-[11px] text-text-tertiary mt-0.5 ml-6">
 {item.vendorName}
 </div>
 </td>

 <td className="py-3.5 px-4">
 <span className="text-xs font-semibold text-text-secondary block">{item.evidenceType}</span>
 <span className="text-[10px] text-text-tertiary font-mono">{item.receivedTimestamp}</span>
 </td>

 <td className="py-3.5 px-4">
 {getStatusBadge(item.status)}
 </td>

 <td className="py-3.5 px-4">
 <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
 <UserCheck aria-hidden="true" size={14} className="text-text-tertiary" />
 <span>{item.assignedReviewer}</span>
 </div>
 </td>

 <td className="py-3.5 px-4 max-w-xs truncate">
 <span className="text-xs text-text-secondary font-medium block truncate" title={item.nextAction}>
 {item.nextAction}
 </span>
 </td>

 <td className="py-3.5 px-5 text-right">
 <Button 
 type="button"
 variant="secondary" 
 size="sm" 
 onClick={(e) => { e.stopPropagation(); setSelectedItemForReview(item); }}
 className="text-xs font-semibold h-8 px-3 gap-1"
 >
 <span>Review</span>
 <ArrowRight aria-hidden="true" size={12} />
 </Button>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={6} className="py-12 text-center text-sm text-text-tertiary">
 No incoming artifacts match the selected intake filter.
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