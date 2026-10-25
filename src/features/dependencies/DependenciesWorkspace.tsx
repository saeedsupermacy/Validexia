// src/features/dependencies/DependenciesWorkspace.tsx
import { useState, useMemo, useEffect } from 'react';
import { 
 Network, Search, Server, Database, Cpu, Building2, 
 Layers, ShieldAlert, Table, Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, EmptyState, Eyebrow} from '../../shared/ui/core';
import { NetworkErrorBanner, PermissionErrorModal, ExpiredSessionModal } from '../../shared/ui/ErrorStates';
import { getNavParams, clearNavParams } from '../../shared/navigation';

export type NodeType = 'Vendor' | 'Service' | 'System' | 'Data' | 'Fourth Party' | 'Business Process';

export interface DependencyNode {
 id: string;
 name: string;
 type: NodeType;
 criticality: 'Tier 1' | 'Tier 2' | 'Tier 3';
 riskScore: number;
 owner: string;
 connectedTo: string[];
 blastRadiusSummary: string;
}

const DEV_DEPENDENCY_GRAPH: DependencyNode[] = [
 {
 id: 'node-v1',
 name: 'CloudScale Infrastructure',
 type: 'Vendor',
 criticality: 'Tier 1',
 riskScore: 88,
 owner: 'Sarah Jenkins',
 connectedTo: ['node-srv1', 'node-sys1', 'node-data1', 'node-bp1', 'node-fp1'],
 blastRadiusSummary: 'Failure affects core cloud hosting, user authentication systems, and financial ledger data processing.'
 },
 {
 id: 'node-v2',
 name: 'SecureAuth Identity',
 type: 'Vendor',
 criticality: 'Tier 1',
 riskScore: 92,
 owner: 'Marcus Chen',
 connectedTo: ['node-srv2', 'node-sys1', 'node-bp2'],
 blastRadiusSummary: 'Failure halts single sign-on (SSO) and administrative console access organization-wide.'
 },
 {
 id: 'node-v3',
 name: 'Apex Gateway Payments',
 type: 'Vendor',
 criticality: 'Tier 1',
 riskScore: 76,
 owner: 'Sarah Jenkins',
 connectedTo: ['node-srv3', 'node-sys2', 'node-data2', 'node-bp3'],
 blastRadiusSummary: 'Failure blocks credit card processing and real-time merchant settlement pipelines.'
 },
 {
 id: 'node-srv1',
 name: 'Compute & Kubernetes Cluster',
 type: 'Service',
 criticality: 'Tier 1',
 riskScore: 85,
 owner: 'Cloud Infrastructure Team',
 connectedTo: ['node-sys1', 'node-sys2'],
 blastRadiusSummary: 'Primary container runtime hosting microservices architecture.'
 },
 {
 id: 'node-sys1',
 name: 'Identity & Access Management (IAM)',
 type: 'System',
 criticality: 'Tier 1',
 riskScore: 90,
 owner: 'Security Engineering',
 connectedTo: ['node-bp1', 'node-bp2'],
 blastRadiusSummary: 'Controls authentication tokens and session lifecycles for all internal staff.'
 },
 {
 id: 'node-sys2',
 name: 'Payment Processing Engine',
 type: 'System',
 criticality: 'Tier 1',
 riskScore: 78,
 owner: 'FinTech Engineering',
 connectedTo: ['node-bp3'],
 blastRadiusSummary: 'Handles inbound checkout requests and gateway routing.'
 },
 {
 id: 'node-data1',
 name: 'Customer PII & Credentials',
 type: 'Data',
 criticality: 'Tier 1',
 riskScore: 82,
 owner: 'Data Governance',
 connectedTo: ['node-bp1'],
 blastRadiusSummary: 'Sensitive user records subject to GDPR and CCPA regulatory governance.'
 },
 {
 id: 'node-data2',
 name: 'PCI-DSS Cardholder Data',
 type: 'Data',
 criticality: 'Tier 1',
 riskScore: 88,
 owner: 'Compliance Team',
 connectedTo: ['node-bp3'],
 blastRadiusSummary: 'Encrypted tokenized card data requiring strict PCI scoping.'
 },
 {
 id: 'node-fp1',
 name: 'Global CDN Edge (Fastly / AWS CloudFront)',
 type: 'Fourth Party',
 criticality: 'Tier 2',
 riskScore: 45,
 owner: 'Reliability Engineering',
 connectedTo: ['node-srv1'],
 blastRadiusSummary: 'Upstream CDN dependency feeding static assets to CloudScale nodes.'
 },
 {
 id: 'node-bp1',
 name: 'User Onboarding & Authentication',
 type: 'Business Process',
 criticality: 'Tier 1',
 riskScore: 84,
 owner: 'Product Operations',
 connectedTo: [],
 blastRadiusSummary: 'Core customer acquisition pipeline.'
 },
 {
 id: 'node-bp2',
 name: 'Enterprise Employee Access Review',
 type: 'Business Process',
 criticality: 'Tier 2',
 riskScore: 60,
 owner: 'IT Security',
 connectedTo: [],
 blastRadiusSummary: 'Quarterly compliance recertification workflow.'
 },
 {
 id: 'node-bp3',
 name: 'Monthly Subscription Billing',
 type: 'Business Process',
 criticality: 'Tier 1',
 riskScore: 75,
 owner: 'Finance Operations',
 connectedTo: [],
 blastRadiusSummary: 'Automated recurring invoice generation and settlement.'
 }
];

export function DependenciesWorkspace() {
 const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
 const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);

 // Deep link: pre-fill search when arriving from another tab (e.g. vendor context)
 useEffect(() => {
 const params = getNavParams();
 const q = params.search || params.vendorName;
 if (q && typeof q === 'string') {
 setSearchQuery(q);
 }
 if (q) clearNavParams();
 }, []);

 // Error simulation states
 const [hasNetworkError, setHasNetworkError] = useState(false);
 const [showPermissionModal, setShowPermissionModal] = useState(false);
 const [showSessionExpired, setShowSessionExpired] = useState(false);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (selectedNode) setSelectedNode(null);
 if (hasNetworkError) setHasNetworkError(false);
 if (showPermissionModal) setShowPermissionModal(false);
 if (showSessionExpired) setShowSessionExpired(false);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [selectedNode, hasNetworkError, showPermissionModal, showSessionExpired]);

 const filteredNodes = useMemo(() => {
 return DEV_DEPENDENCY_GRAPH.filter(node => {
 const matchesSearch = 
 node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 node.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
 node.blastRadiusSummary.toLowerCase().includes(searchQuery.toLowerCase());
 
 const matchesType = selectedTypeFilter === 'All' || node.type === selectedTypeFilter;
 return matchesSearch && matchesType;
 });
 }, [searchQuery, selectedTypeFilter]);

 const getNodeIcon = (type: NodeType) => {
 switch (type) {
 case 'Vendor': return <Building2 aria-hidden="true" size={16} className="text-info" />;
 case 'Service': return <Cpu aria-hidden="true" size={16} className="text-accent" />;
 case 'System': return <Server aria-hidden="true" size={16} className="text-status-success" />;
 case 'Data': return <Database aria-hidden="true" size={16} className="text-risk-high" />;
 case 'Fourth Party': return <Network aria-hidden="true" size={16} className="text-status-warning" />;
 case 'Business Process': return <Layers aria-hidden="true" size={16} className="text-accent" />;
 }
 };

 const getConnectedEntities = (node: DependencyNode) => {
 return DEV_DEPENDENCY_GRAPH.filter(n => node.connectedTo.includes(n.id));
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Dependencies workspace loaded. {filteredNodes.length} nodes match your filter criteria.
 </div>

 {hasNetworkError && <NetworkErrorBanner onRetry={() => setHasNetworkError(false)} />}
 {showPermissionModal && <PermissionErrorModal onClose={() => setShowPermissionModal(false)} />}
 {showSessionExpired && <ExpiredSessionModal onReauth={() => setShowSessionExpired(false)} />}

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Intelligence</Eyebrow>
 <h1 className="text-page-title">Dependency & Blast Radius Intelligence</h1>
 <p className="text-body-secondary mt-1">
 Trace downstream business impact across vendors, services, systems, data stores, and fourth parties.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-2 bg-base p-1 rounded-xl border border-border" role="group" aria-label="View Mode Toggle">
 <button
 type="button"
 onClick={() => setViewMode('graph')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-info ${
 viewMode === 'graph' ? 'bg-surface text-text-primary shadow-sm border border-border-strong' : 'text-text-secondary hover:text-text-primary'
 }`}
 >
 <Share2 aria-hidden="true" size={14} /> Relationship Map
 </button>
 <button
 type="button"
 onClick={() => setViewMode('table')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-info ${
 viewMode === 'table' ? 'bg-surface text-text-primary shadow-sm border border-border-strong' : 'text-text-secondary hover:text-text-primary'
 }`}
 >
 <Table aria-hidden="true" size={14} /> Matrix Table
 </button>
 </div>
 </div>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <label htmlFor="dependencySearchInput" className="sr-only">Search nodes, owners, impact summaries</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="dependencySearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search nodes, owners, impact summaries..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>

 <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Category Filters">
 {['All', 'Vendor', 'Service', 'System', 'Data', 'Fourth Party', 'Business Process'].map(type => (
 <button
 key={type}
 type="button"
 onClick={() => setSelectedTypeFilter(type)}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 selectedTypeFilter === type 
 ? 'bg-surface-hover text-text-primary font-bold' 
 : 'bg-base border border-border text-text-secondary hover:bg-surface-hover'
 }`}
 >
 {type}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>

 {filteredNodes.length === 0 ? (
 <EmptyState
 icon={Network}
 title="No Dependencies Mapped"
 description="No infrastructure components or nodes match your filter or search criteria."
 whatItIs="Topology intelligence mapping how third-party infrastructure impacts internal microservices."
 whyItsEmpty="Current search query or category filters returned zero matching dependency nodes."
 actionLabel="Reset Filters"
 onAction={() => { setSearchQuery(''); setSelectedTypeFilter('All'); }}
 />
 ) : viewMode === 'graph' ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
 <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
 {filteredNodes.map(node => {
 const isSelected = selectedNode?.id === node.id;
 return (
 <Card 
 key={node.id} 
 onClick={() => setSelectedNode(node)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedNode(node);
 }
 }}
 tabIndex={0}
 role="button"
 aria-label={`Inspect dependency node ${node.name}`}
 className={`cursor-pointer transition-all hover:border-border-strong shadow-sm focus:outline-none focus:ring-2 focus:ring-info ${
 isSelected ? 'ring-2 ring-info/50 bg-surface-hover' : 'hover:bg-surface-hover/50'
 }`}
 >
 <CardContent className="p-5 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div aria-hidden="true" className="p-2 rounded-lg bg-base border border-border">
 {getNodeIcon(node.type)}
 </div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary bg-base px-2 py-0.5 rounded border border-border-subtle">
 {node.type}
 </span>
 </div>
 <span className="text-xs font-mono font-bold text-text-primary">
 Risk: {node.riskScore}
 </span>
 </div>

 <div>
 <h3 className="text-sm font-bold text-text-primary m-0">{node.name}</h3>
 <p className="text-xs text-text-secondary mt-1 line-clamp-2 m-0">{node.blastRadiusSummary}</p>
 </div>

 <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-[11px] text-text-tertiary font-mono">
 <span>Owner: {node.owner}</span>
 <span className="text-info font-bold">{node.connectedTo.length} downstream links</span>
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>

 <div className="md:col-span-1 sticky top-6">
 <Card className="shadow-sm overflow-hidden border-accent/25">
 <CardHeader className="bg-surface-hover/40 border-b border-border px-5 py-4">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <ShieldAlert aria-hidden="true" size={15} className="text-accent" />
 Blast Radius Inspector
 </CardTitle>
 </CardHeader>
 <CardContent className="p-5 space-y-5 text-xs">
 {selectedNode ? (
 <>
 <div className="space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Selected Entity</span>
 <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 m-0">
 {getNodeIcon(selectedNode.type)}
 {selectedNode.name}
 </h3>
 </div>

 <div className="p-3 bg-base border border-border rounded-lg space-y-1">
 <strong className="text-text-primary uppercase text-[10px] tracking-wider block">Failure Blast Radius:</strong>
 <p className="text-text-secondary leading-relaxed m-0">{selectedNode.blastRadiusSummary}</p>
 </div>

 <div className="space-y-2">
 <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary m-0">
 Directly Affected Downstream Dependencies ({getConnectedEntities(selectedNode).length})
 </h4>
 {getConnectedEntities(selectedNode).length > 0 ? (
 <div className="space-y-2">
 {getConnectedEntities(selectedNode).map(target => (
 <button
 key={target.id}
 type="button"
 onClick={() => setSelectedNode(target)}
 aria-label={`Inspect downstream dependency ${target.name}`}
 className="w-full text-left p-3 bg-base border border-border rounded-lg flex items-center justify-between gap-2 hover:border-border-strong hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-info"
 >
 <div className="flex items-center gap-2 min-w-0">
 <span aria-hidden="true">{getNodeIcon(target.type)}</span>
 <div className="min-w-0">
 <div className="font-bold text-text-primary truncate">{target.name}</div>
 <div className="text-[10px] text-text-tertiary font-mono">{target.type} • {target.criticality}</div>
 </div>
 </div>
 <span className="text-xs font-mono font-bold text-text-primary shrink-0">{target.riskScore}</span>
 </button>
 ))}
 </div>
 ) : (
 <p className="text-text-tertiary italic">No downstream dependencies registered for this node.</p>
 )}
 </div>
 </>
 ) : (
 <div className="py-12 text-center text-text-tertiary space-y-2">
 <Network aria-hidden="true" size={28} className="mx-auto opacity-40" />
 <p className="font-medium text-text-secondary">Select any node on the left</p>
 <p className="text-[11px]">Inspect what business processes and systems would fail if that vendor or service goes down.</p>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 ) : (
 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">Dependency and Blast Radius Matrix Table</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Entity Name</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Type</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Criticality</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Risk Score</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Owner</th>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">Blast Radius & Impact Summary</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredNodes.map(node => (
 <tr key={node.id} className="hover:bg-surface-hover transition-colors">
 <td className="py-3.5 px-5 font-bold text-text-primary flex items-center gap-2">
 {getNodeIcon(node.type)}
 {node.name}
 </td>
 <td className="py-3.5 px-4 text-xs font-semibold text-text-secondary">{node.type}</td>
 <td className="py-3.5 px-4">
 <span className="text-xs font-bold bg-base px-2 py-0.5 rounded border border-border">{node.criticality}</span>
 </td>
 <td className="py-3.5 px-4 font-mono font-bold text-xs">{node.riskScore}</td>
 <td className="py-3.5 px-4 text-xs text-text-secondary">{node.owner}</td>
 <td className="py-3.5 px-5 text-xs text-text-secondary max-w-md truncate">{node.blastRadiusSummary}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 )}

 </div>
 );
}