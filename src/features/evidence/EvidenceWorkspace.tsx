// src/features/evidence/EvidenceWorkspace.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
 FileCheck, Search, Download, Plus, SlidersHorizontal, RotateCcw, FileSearch
, X} from 'lucide-react';
import { Card, CardContent, Button, EmptyState, Eyebrow} from '../../shared/ui/core';
import { NetworkErrorBanner, PermissionErrorModal, ExpiredSessionModal } from '../../shared/ui/ErrorStates';
import { navigateTo, getNavParams, clearNavParams } from '../../shared/navigation';
import { auditStore } from '../audit/auditStore';
import { Dialog } from '../../shared/ui/Dialog';
import { DeepLinkBanner } from '../../shared/ui/DeepLinkBanner';
import {
  getEvidence, addEvidence,
  type EvidenceRecord, type EvidenceStatus, type ConfidenceLevel, type EvidenceType,
} from '../../data/evidence';
import { resolveVendorId, getVendors } from '../../data/vendors';
import { recordMaterialChange } from '../../data/materialChanges';
import { showToast } from '../../shared/ui/toast';

// Re-exported for any existing importers of the workspace module.
export type { EvidenceRecord, EvidenceStatus, ConfidenceLevel, EvidenceType };

export function EvidenceWorkspace() {
 const [searchQuery, setSearchQuery] = useState('');

 // Deep link: pre-fill search from another tab (accepts search or vendorName).
 // openUpload=true opens the upload modal straight away (e.g. from a vendor's page).
 const [deepLink, setDeepLink] = useState<string | null>(null);
 const [deepLinkSource, setDeepLinkSource] = useState<string>('another tab');
 const [deepLinkVendor, setDeepLinkVendor] = useState<string | null>(null);
 const highlightRowRef = useRef<HTMLTableRowElement | null>(null);
 useEffect(() => {
 const params = getNavParams();
 const q = params.search || params.vendorName;
 if (q && typeof q === 'string') {
 setSearchQuery(q as string);
 setDeepLink(q as string);
 if (params.vendorName && typeof params.vendorName === 'string') {
 setUploadVendor(params.vendorName as string);
 setDeepLinkVendor(params.vendorName as string);
 }
 }
 if (params.from && typeof params.from === 'string') {
 setDeepLinkSource(params.from as string);
 }
 if (params.openUpload === 'true') {
 setIsUploadOpen(true);
 }
 if (q || params.openUpload) clearNavParams();
 }, []);
 // Scroll the deep-linked row into view.
 useEffect(() => {
 if (deepLink && highlightRowRef.current) {
 highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 }, [deepLink, searchQuery]);
 const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
 const [isUploadOpen, setIsUploadOpen] = useState(false);
 const [vendorFilter, setVendorFilter] = useState<string>('All');
 const [typeFilter, setTypeFilter] = useState<string>('All');
 const [statusFilter, setStatusFilter] = useState<string>('All');
 const [confidenceFilter, setConfidenceFilter] = useState<string>('All');
 const [ownerFilter, setOwnerFilter] = useState<string>('All');

 // Error simulation states
 const [hasNetworkError, setHasNetworkError] = useState(false);
 const [showPermissionModal, setShowPermissionModal] = useState(false);
 const [showSessionExpired, setShowSessionExpired] = useState(false);

 const [isFilterOpen, setIsFilterOpen] = useState(false);
 const filterRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
 setIsFilterOpen(false);
 }
 };
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (isFilterOpen) setIsFilterOpen(false);
 if (hasNetworkError) setHasNetworkError(false);
 if (showPermissionModal) setShowPermissionModal(false);
 if (showSessionExpired) setShowSessionExpired(false);
 }
 };
 if (isFilterOpen) {
 document.addEventListener('mousedown', handleClickOutside);
 }
 document.addEventListener('keydown', handleKeyDown);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 document.removeEventListener('keydown', handleKeyDown);
 };
 }, [isFilterOpen, hasNetworkError, showPermissionModal, showSessionExpired]);

 const handleExportCitations = () => {
 const headers = ['Citation Ref', 'Artifact', 'Vendor', 'Type', 'Status', 'Confidence', 'Control Mapping', 'Expiration', 'Findings', 'Owner'];
 const rows = filteredEvidence.map(ev => [
 ev.citationRef, `"${ev.artifactName.replace(/"/g, '""')}"`, `"${ev.vendorName}"`,
 ev.evidenceType, ev.status, ev.confidence, `"${ev.controlMapping}"`,
 ev.expirationDate, ev.findingsCount, `"${ev.owner}"`
 ]);
 const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
 const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `validexia-evidence-citations-${new Date().toISOString().slice(0, 10)}.csv`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 };

 const [records, setRecords] = useState<EvidenceRecord[]>(() => getEvidence());
 const [uploadFile, setUploadFile] = useState<File | null>(null);
 const [uploadVendor, setUploadVendor] = useState<string>('CloudScale Infrastructure');
 const fileInputRef = useRef<HTMLInputElement>(null);

 const closeUploadModal = () => {
 setIsUploadOpen(false);
 setUploadFile(null);
 };

 const handleUploadSubmit = () => {
 if (!uploadFile) return;
 const vendorId = resolveVendorId(uploadVendor) ?? 'vend-upload';
 const newRec = addEvidence({
 artifactName: uploadFile.name.replace(/\.[^.]+$/, ''),
 vendorName: uploadVendor,
 vendorId,
 evidenceType: 'DPA / Legal Exhibit',
 owner: 'Unassigned',
 });
 setRecords(getEvidence());
 auditStore.appendRecord('Current User', 'EVIDENCE_UPLOADED', newRec.id, `Uploaded "${uploadFile.name}" for ${uploadVendor}`);
 recordMaterialChange({
 objectName: uploadVendor,
 objectType: 'Evidence',
 eventType: 'evidence_change',
 changeSummary: `New evidence artifact uploaded for ${uploadVendor}`,
 severity: 'info',
 contextReason: `"${newRec.artifactName}" added via direct upload. Status: Awaiting Review.`,
 actionLabel: 'View Artifact',
 });
 showToast(`Evidence uploaded for ${uploadVendor}`, 'success');
 setUploadFile(null);
 setIsUploadOpen(false);
 };

 const filteredEvidence = useMemo(() => {
 return records.filter(ev => {
 const matchesSearch = 
 ev.artifactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
 ev.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 ev.citationRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
 ev.controlMapping.toLowerCase().includes(searchQuery.toLowerCase());

 const matchesVendor = vendorFilter === 'All' || ev.vendorName === vendorFilter;
 const matchesType = typeFilter === 'All' || ev.evidenceType === typeFilter;
 const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;
 const matchesConfidence = confidenceFilter === 'All' || ev.confidence === confidenceFilter;
 const matchesOwner = ownerFilter === 'All' || ev.owner === ownerFilter;

 return matchesSearch && matchesVendor && matchesType && matchesStatus && matchesConfidence && matchesOwner;
 });
 }, [records, searchQuery, vendorFilter, typeFilter, statusFilter, confidenceFilter, ownerFilter]);

 const activeFilterCount = useMemo(() => {
 let count = 0;
 if (vendorFilter !== 'All') count++;
 if (typeFilter !== 'All') count++;
 if (statusFilter !== 'All') count++;
 if (confidenceFilter !== 'All') count++;
 if (ownerFilter !== 'All') count++;
 return count;
 }, [vendorFilter, typeFilter, statusFilter, confidenceFilter, ownerFilter]);

 const getStatusBadge = (status: EvidenceStatus) => {
 switch (status) {
 case 'Verified':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-success/10 text-status-success ">Verified</span>;
 case 'Expiring':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-warning/10 text-status-warning ">Expiring</span>;
 case 'Expired':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">Expired</span>;
 case 'Awaiting Review':
 return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-info/10 text-info">Awaiting Review</span>;
 }
 };

 const getConfidenceBadge = (confidence: ConfidenceLevel) => {
 switch (confidence) {
 case 'High': return <span className="text-status-success font-semibold">High Confidence</span>;
 case 'Medium': return <span className="text-status-warning font-semibold">Medium</span>;
 case 'Low': return <span className="text-risk-critical font-semibold">Low Confidence</span>;
 }
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Evidence and compliance assurance workspace loaded. {filteredEvidence.length} artifacts match your current filters.
 </div>

 {hasNetworkError && <NetworkErrorBanner onRetry={() => setHasNetworkError(false)} />}
 {showPermissionModal && <PermissionErrorModal onClose={() => setShowPermissionModal(false)} />}
 {showSessionExpired && <ExpiredSessionModal onReauth={() => setShowSessionExpired(false)} />}

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Program</Eyebrow>
 <h1 className="text-page-title">Evidence & Compliance Assurance</h1>
 {deepLink && (
 <div className="mt-3">
 <DeepLinkBanner
 label={`Search = "${deepLink}"`}
 source={deepLinkSource}
 count={filteredEvidence.length}
 backLabel={deepLinkVendor ? `Back to ${deepLinkVendor}` : undefined}
 onBack={deepLinkVendor ? () => {
 const vid = resolveVendorId(deepLinkVendor);
 navigateTo('vendors', vid ? { vendorId: vid } : { search: deepLinkVendor });
 } : undefined}
 onClear={() => { setDeepLink(null); setDeepLinkVendor(null); setSearchQuery(''); }}
 />
 </div>
 )}
 <p className="text-body-secondary mt-1">
 Validate that active risk and compliance decisions are supported by current, verified audit artifacts.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <Button type="button" variant="secondary" size="sm" onClick={handleExportCitations} aria-label={`Export ${filteredEvidence.length} citations to CSV`}>
 <Download aria-hidden="true" size={14} className="mr-1.5" />
 Export Citations
 </Button>
 <Button type="button" variant="primary" size="sm" onClick={() => setIsUploadOpen(true)}>
 <Plus aria-hidden="true" size={14} className="mr-1.5" />
 Upload Evidence
 </Button>
 </div>
 </div>

 <Card className="shadow-sm relative z-30" style={{ overflow: 'visible' }}>
 <CardContent className="p-4 space-y-4">
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 <div className="flex items-center gap-2 flex-1">
 <div className="relative w-full sm:w-80">
 <label htmlFor="evidenceSearchInput" className="sr-only">Search artifacts, citations, controls</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="evidenceSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search artifacts, citations, controls..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="relative" ref={filterRef}>
 <Button
 type="button"
 variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
 size="sm"
 onClick={() => setIsFilterOpen(prev => !prev)}
 className="h-9 px-3.5 gap-2 shrink-0 font-semibold"
 >
 <SlidersHorizontal aria-hidden="true" size={14} />
 <span>Filter</span>
 {activeFilterCount > 0 && (
 <span className="w-5 h-5 rounded-full bg-surface text-text-primary text-[10px] font-bold flex items-center justify-center ml-0.5">
 {activeFilterCount}
 </span>
 )}
 </Button>

 {isFilterOpen && (
 <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-surface border border-border-strong rounded-xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in duration-150">
 <div className="flex items-center justify-between border-b border-border pb-3">
 <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">Filter Evidence Hub</span>
 <button 
 type="button"
 onClick={() => {
 setVendorFilter('All');
 setTypeFilter('All');
 setStatusFilter('All');
 setConfidenceFilter('All');
 setOwnerFilter('All');
 }}
 className="text-xs text-info hover:underline font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-info rounded"
 >
 <RotateCcw aria-hidden="true" size={12} /> Reset all
 </button>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="evidenceVendorSelect" className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">Vendor</label>
 <select
 id="evidenceVendorSelect"
 value={vendorFilter}
 onChange={(e) => setVendorFilter(e.target.value)}
 className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Vendors</option>
 {Array.from(new Set([...getVendors().map(v => v.name), ...records.map(r => r.vendorName), uploadVendor])).sort().map(vn => (
 <option key={vn} value={vn}>{vn}</option>
 ))}
 </select>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="evidenceTypeSelect" className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">Evidence Type</label>
 <select
 id="evidenceTypeSelect"
 value={typeFilter}
 onChange={(e) => setTypeFilter(e.target.value)}
 className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Types</option>
 <option value="SOC 2 Type II">SOC 2 Type II</option>
 <option value="ISO 27001">ISO 27001</option>
 <option value="Penetration Test">Penetration Test</option>
 <option value="SIG Questionnaire">SIG Questionnaire</option>
 <option value="DPA / Legal Exhibit">DPA / Legal Exhibit</option>
 </select>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="evidenceStatusSelect" className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">Status</label>
 <select
 id="evidenceStatusSelect"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Statuses</option>
 <option value="Verified">Verified</option>
 <option value="Expiring">Expiring</option>
 <option value="Expired">Expired</option>
 <option value="Awaiting Review">Awaiting Review</option>
 </select>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="evidenceConfidenceSelect" className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">Confidence</label>
 <select
 id="evidenceConfidenceSelect"
 value={confidenceFilter}
 onChange={(e) => setConfidenceFilter(e.target.value)}
 className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Confidence Levels</option>
 <option value="High">High</option>
 <option value="Medium">Medium</option>
 <option value="Low">Low</option>
 </select>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="evidenceOwnerSelect" className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">Owner</label>
 <select
 id="evidenceOwnerSelect"
 value={ownerFilter}
 onChange={(e) => setOwnerFilter(e.target.value)}
 className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="All">All Owners</option>
 {Array.from(new Set(records.map(r => r.owner))).sort().map(ow => (
 <option key={ow} value={ow}>{ow}</option>
 ))}
 </select>
 </div>

 <div className="pt-2 border-t border-border flex justify-end">
 <Button type="button" size="sm" onClick={() => setIsFilterOpen(false)} className="w-full">
 Apply Filters ({filteredEvidence.length} results)
 </Button>
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="flex items-center gap-4 text-xs text-text-secondary font-mono">
 <span>Showing <strong className="text-text-primary font-bold">{filteredEvidence.length}</strong> of {records.length} artifacts</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {filteredEvidence.length > 0 ? (
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Evidence and Compliance Assurance Vault Records</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Artifact & Vendor</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Type / Source</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Control Mapping</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Status & Expiration</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Confidence</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Findings</th>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Citation Ref</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredEvidence.map((ev) => {
 const isHighlighted = !!deepLink && (
 ev.vendorName.toLowerCase().includes(deepLink.toLowerCase()) ||
 ev.artifactName.toLowerCase().includes(deepLink.toLowerCase()) ||
 ev.citationRef.toLowerCase() === deepLink.toLowerCase()
 );
 return (
 <tr 
 key={ev.id}
 ref={isHighlighted ? highlightRowRef : undefined}
 onClick={() => setSelectedEvidence(ev)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedEvidence(ev);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect evidence artifact ${ev.artifactName}`}
 className={`hover:bg-surface-hover transition-colors cursor-pointer group focus:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-info ${isHighlighted ? 'bg-info/10 shadow-[inset_3px_0_0_0_var(--color-info)]' : ''}`}
 >
 <td className="py-3.5 px-5">
 <div className="font-bold text-text-primary group-hover:text-info transition-colors">
 {ev.artifactName}
 </div>
 <div className="text-[11px] text-text-tertiary mt-0.5">
 {ev.vendorName} • <span className="font-semibold text-text-secondary">Owner: {ev.owner}</span>
 </div>
 </td>

 <td className="py-3.5 px-4">
 <span className="text-xs font-semibold text-text-secondary block">{ev.evidenceType}</span>
 <span className="text-[10px] text-text-tertiary font-mono">{ev.source}</span>
 </td>

 <td className="py-3.5 px-4">
 <span className="text-xs font-mono font-medium text-text-primary bg-base px-2 py-1 rounded border border-border">
 {ev.controlMapping}
 </span>
 </td>

 <td className="py-3.5 px-4">
 <div className="flex items-center gap-2">
 {getStatusBadge(ev.status)}
 </div>
 <span className="text-[11px] font-mono text-text-tertiary mt-1 block">Exp: {ev.expirationDate}</span>
 </td>

 <td className="py-3.5 px-4 text-xs">
 {getConfidenceBadge(ev.confidence)}
 </td>

 <td className="py-3.5 px-4">
 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
 ev.findingsCount > 0 ? 'bg-risk-critical/10 text-risk-critical' : 'text-text-tertiary'
 }`}>
 {ev.findingsCount} findings
 </span>
 </td>

 <td className="py-3.5 px-5 font-mono text-xs text-info font-bold">
 <div className="flex items-center justify-between gap-4">
 <span>{ev.citationRef}</span>
 <button 
 type="button"
 className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-accent bg-accent-muted hover:bg-accent-muted rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-info "
 onClick={(e) => {
 e.stopPropagation();
 navigateTo('ai-playground', { vendorName: ev.vendorName });
 }}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
 }}
 >
 <FileSearch aria-hidden="true" size={12} className="opacity-70" /> Analyze Document
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 ) : (
 <EmptyState
 icon={FileCheck}
 title={deepLink ? `No Results for "${deepLink}"` : "No Evidence Artifacts Found"}
 description={deepLink ? "No records match this deep link. The item may have been resolved, archived, or renamed." : "No compliance artifacts or documents match your search criteria."}
 whatItIs="An immutable vault storing SOC 2 reports, penetration tests, and compliance certifications."
 whyItsEmpty="No evidence artifacts have been uploaded, or current filter criteria eliminated all records."
 actionLabel={deepLink ? "Clear Deep Link" : "Upload New Evidence"}
 onAction={() => setIsUploadOpen(true)}
 />
 )}

 {selectedEvidence && createPortal(
 <div role="dialog" aria-modal="true" aria-labelledby="evidence-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200" onClick={() => setSelectedEvidence(null)}>
 <div className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-start justify-between">
 <div>
 <h2 id="evidence-title" className="text-base font-bold text-text-primary m-0">{selectedEvidence.artifactName}</h2>
 <p className="text-sm text-text-secondary mt-1">{selectedEvidence.vendorName} · {selectedEvidence.evidenceType}</p>
 </div>
 <button type="button" onClick={() => setSelectedEvidence(null)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-info" aria-label="Close">
 <X size={18} />
 </button>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Status</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvidence.status}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Confidence</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvidence.confidence}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Control</div>
 <div className="text-sm font-mono text-text-primary mt-1">{selectedEvidence.controlMapping}</div>
 </div>
 <div className="p-3 bg-base border border-border rounded-lg">
 <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Expires</div>
 <div className="text-sm font-bold text-text-primary mt-1">{selectedEvidence.expirationDate}</div>
 </div>
 </div>
 <div className="flex justify-end gap-2">
 <button type="button" onClick={() => { setSelectedEvidence(null); navigateTo('vendors', { vendorId: selectedEvidence.vendorId }); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-info">
 View Vendor
 </button>
 <button type="button" onClick={() => setSelectedEvidence(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-info">
 Close
 </button>
 </div>
 </div>
 </div>,
 document.body)}

 <Dialog open={isUploadOpen} onClose={closeUploadModal} title="Upload Evidence" maxWidth="max-w-md">
 <div className="p-6 space-y-5">
 <div>
 <h2 id="upload-title" className="text-base font-bold text-text-primary m-0">Upload Evidence</h2>
 <p className="text-sm text-text-secondary mt-1">Add a new artifact to the repository.</p>
 </div>
 <input
 ref={fileInputRef}
 type="file"
 accept=".pdf,.docx,.xlsx"
 className="sr-only"
 aria-label="Choose evidence file"
 onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
 />
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-info transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 <p className="text-sm font-semibold text-text-primary">{uploadFile ? uploadFile.name : 'Drop files here or click to browse'}</p>
 <p className="text-xs text-text-tertiary mt-1">PDF, DOCX, XLSX up to 50MB</p>
 </button>
 <div>
 <label htmlFor="upload-vendor" className="block text-xs font-semibold text-text-secondary mb-1.5">Vendor</label>
 <select
 id="upload-vendor"
 value={uploadVendor}
 onChange={(e) => setUploadVendor(e.target.value)}
 className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-info"
 >
 {Array.from(new Set([...getVendors().map(v => v.name), ...records.map(r => r.vendorName), uploadVendor])).sort().map(vn => (
 <option key={vn} value={vn}>{vn}</option>
 ))}
 </select>
 </div>
 <div className="flex justify-end gap-2">
 <Button variant="secondary" size="sm" onClick={closeUploadModal}>Cancel</Button>
 <Button variant="primary" size="sm" onClick={handleUploadSubmit} disabled={!uploadFile}>Upload</Button>
 </div>
 </div>
 </Dialog>
 </div>
 );
}