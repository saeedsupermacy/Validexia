// src/features/team/TeamWorkspace.tsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
 Users, Shield, Mail, CheckCircle2, Clock, UserPlus, ArrowRight, X, AlertTriangle, ShieldCheck, Search,
 UserCheck, UserX, RefreshCw, KeyRound
} from 'lucide-react';
import { Card, CardContent, Button, Eyebrow} from '../../shared/ui/core';
import { NetworkErrorBanner, PermissionErrorModal, ExpiredSessionModal } from '../../shared/ui/ErrorStates';
import { getNavParams, clearNavParams } from '../../shared/navigation';
import { auditStore } from '../audit/auditStore';
import { Dialog } from '../../shared/ui/Dialog';

export type UserRole = 'Admin' | 'Analyst' | 'Viewer' | 'Custom';
export type UserStatus = 'Active' | 'Pending Invitation' | 'Suspended';

export interface TeamMember {
 id: string;
 name: string;
 email: string;
 role: UserRole;
 customRoleName?: string;
 status: UserStatus;
 lastActivity: string;
}

export interface RoleDefinition {
 name: UserRole;
 description: string;
 userCount: number;
 permissions: string[];
 isCustom?: boolean;
}

const DEV_TEAM_MEMBERS: TeamMember[] = [
 {
 id: 'usr_01',
 name: 'Sarah Jenkins',
 email: 'sarah.jenkins@validexia.io',
 role: 'Admin',
 status: 'Active',
 lastActivity: '2 mins ago',
 },
 {
 id: 'usr_02',
 name: 'Marcus Chen',
 email: 'marcus.chen@validexia.io',
 role: 'Analyst',
 status: 'Active',
 lastActivity: '1 hour ago',
 },
 {
 id: 'usr_03',
 name: 'Alex Rivera',
 email: 'alex.rivera@validexia.io',
 role: 'Analyst',
 status: 'Active',
 lastActivity: '3 hours ago',
 },
 {
 id: 'usr_04',
 name: 'Elena Rostova',
 email: 'elena.rostova@validexia.io',
 role: 'Viewer',
 status: 'Active',
 lastActivity: '2 days ago',
 },
 {
 id: 'usr_05',
 name: 'David Kim',
 email: 'david.kim@validexia.io',
 role: 'Custom',
 customRoleName: 'External Auditor',
 status: 'Pending Invitation',
 lastActivity: 'Never (Invited today)',
 }
];

const ROLES_DEFINITIONS: RoleDefinition[] = [
 {
 name: 'Admin',
 description: 'Full administrative control over tenant settings, integrations, user provisioning, and destructive overrides.',
 userCount: 1,
 permissions: ['tenant:write', 'users:manage', 'integrations:write', 'decisions:override', 'audit:read']
 },
 {
 name: 'Analyst',
 description: 'Core operational role for reviewing vendor assessments, ingesting evidence artifacts, and managing remediation items.',
 userCount: 2,
 permissions: ['vendors:write', 'evidence:upload', 'remediation:manage', 'assessments:review', 'audit:read']
 },
 {
 name: 'Viewer',
 description: 'Read-only access to risk dashboards, evidence repositories, and verified decision ledgers for executive stakeholders.',
 userCount: 1,
 permissions: ['vendors:read', 'evidence:read', 'reports:generate', 'audit:read']
 },
 {
 name: 'Custom',
 description: 'Configurable role templates (e.g., External Auditor, Legal Counsel) scoped to specific read or compliance sub-ledgers.',
 userCount: 1,
 permissions: ['audit:read', 'reports:generate', 'evidence:read (scoped)'],
 isCustom: true
 }
];

export function TeamWorkspace() {
 const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
 const [searchQuery, setSearchQuery] = useState('');
 const [members, setMembers] = useState<TeamMember[]>(DEV_TEAM_MEMBERS);
 const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
 const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

 // Deep link: pre-fill search when arriving from another tab
 useEffect(() => {
 const params = getNavParams();
 const q = params.search;
 if (q && typeof q === 'string') {
 setSearchQuery(q);
 setActiveTab('users');
 }
 if (q) clearNavParams();
 }, []);
 const [selectedRole, setSelectedRole] = useState<string>('Analyst');
 const [customRoleInput, setCustomRoleInput] = useState('');
 const [inviteEmail, setInviteEmail] = useState('');
 const [, setIsAnimating] = useState(false);

 // Error simulation states
 const [hasNetworkError, setHasNetworkError] = useState(false);
 const [showPermissionModal, setShowPermissionModal] = useState(false);
 const [showSessionExpired, setShowSessionExpired] = useState(false);

 // Refs for Focus Management & Trapping
 const modalRef = useRef<HTMLDivElement>(null);
 const inviteButtonRef = useRef<HTMLButtonElement>(null);

 // Focus Trapping and Escape Key Handler for Modal
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (isInviteModalOpen) {
 setIsInviteModalOpen(false);
 inviteButtonRef.current?.focus();
 }
 if (selectedUser) setSelectedUser(null);
 if (hasNetworkError) setHasNetworkError(false);
 if (showPermissionModal) setShowPermissionModal(false);
 if (showSessionExpired) setShowSessionExpired(false);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [isInviteModalOpen, selectedUser, hasNetworkError, showPermissionModal, showSessionExpired]);

 useEffect(() => {
 if (isInviteModalOpen) {
 requestAnimationFrame(() => setIsAnimating(true));

 const handleModalTab = (e: KeyboardEvent) => {
 if (e.key === 'Tab' && modalRef.current) {
 const focusableElements = modalRef.current.querySelectorAll(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 );
 const firstElement = focusableElements[0] as HTMLElement;
 const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

 if (e.shiftKey) {
 if (document.activeElement === firstElement) {
 lastElement?.focus();
 e.preventDefault();
 }
 } else {
 if (document.activeElement === lastElement) {
 firstElement?.focus();
 e.preventDefault();
 }
 }
 }
 };

 document.addEventListener('keydown', handleModalTab);
 return () => document.removeEventListener('keydown', handleModalTab);
 } else {
 setIsAnimating(false);
 }
 }, [isInviteModalOpen]);

 const filteredMembers = members.filter(user => 
 user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 user.role.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const updateMember = (id: string, patch: Partial<TeamMember>) => {
 setMembers(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
 setSelectedUser(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);
 };

 const selectedUserScopes = selectedUser
 ? ROLES_DEFINITIONS.find(r => r.name === selectedUser.role)?.permissions ?? []
 : [];

 const getStatusBadge = (status: UserStatus) => {
 switch (status) {
 case 'Active':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-success/10 text-status-success ">
 <CheckCircle2 aria-hidden="true" size={12} />
 <span>Active</span>
 </span>
 );
 case 'Pending Invitation':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-status-warning/10 text-status-warning ">
 <Clock aria-hidden="true" size={12} />
 <span>Pending</span>
 </span>
 );
 case 'Suspended':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-critical/10 text-risk-critical ">
 <AlertTriangle aria-hidden="true" size={12} />
 <span>Suspended</span>
 </span>
 );
 }
 };

 const getRoleBadge = (role: UserRole, customName?: string) => {
 const styles: Record<UserRole, string> = {
 'Admin': 'bg-accent-muted text-accent ',
 'Analyst': 'bg-info/10 text-info border-info/30',
 'Viewer': 'bg-surface-hover text-text-secondary border-border',
 'Custom': 'bg-risk-moderate/10 text-risk-moderate '
 };
 return (
 <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[role]}`}>
 {role === 'Custom' && customName ? customName : role}
 </span>
 );
 };

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Team workspace loaded. {filteredMembers.length} team members match your query.
 </div>

 {hasNetworkError && <NetworkErrorBanner onRetry={() => setHasNetworkError(false)} />}
 {showPermissionModal && <PermissionErrorModal onClose={() => setShowPermissionModal(false)} />}
 {showSessionExpired && <ExpiredSessionModal onReauth={() => setShowSessionExpired(false)} />}

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Administration</Eyebrow>
 <h1 className="text-page-title">Team & Access Control</h1>
 <p className="text-body-secondary mt-1">
 Manage user provisioning, roles, and backend-enforced security permissions.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <Button 
 type="button"
 ref={inviteButtonRef}
 variant="primary" 
 onClick={() => setIsInviteModalOpen(true)} 
 className="gap-2 font-bold text-xs h-9"
 >
 <UserPlus aria-hidden="true" size={16} /> Invite Team Member
 </Button>
 </div>
 </div>

 {/* Sub-navigation Tabs */}
 <div className="flex items-center gap-3 border-b border-border pb-4" role="tablist" aria-label="Team views">
 <button
 type="button"
 role="tab"
 aria-selected={activeTab === 'users'}
 aria-controls="users-panel"
 id="users-tab"
 onClick={() => setActiveTab('users')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-info ${
 activeTab === 'users' 
 ? 'bg-surface text-text-primary shadow-sm border border-border-strong' 
 : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
 }`}
 >
 <Users aria-hidden="true" size={15} className={activeTab === 'users' ? 'text-info' : 'text-text-tertiary'} />
 <span>Users ({members.length})</span>
 </button>

 <button
 type="button"
 role="tab"
 aria-selected={activeTab === 'roles'}
 aria-controls="roles-panel"
 id="roles-tab"
 onClick={() => setActiveTab('roles')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-info ${
 activeTab === 'roles' 
 ? 'bg-surface text-text-primary shadow-sm border border-border-strong' 
 : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
 }`}
 >
 <Shield aria-hidden="true" size={15} className={activeTab === 'roles' ? 'text-info' : 'text-text-tertiary'} />
 <span>Roles & Permissions Matrix</span>
 </button>
 </div>

 {/* Users Tab View */}
 {activeTab === 'users' && (
 <div id="users-panel" role="tabpanel" aria-labelledby="users-tab" className="space-y-6">
 <Card className="shadow-sm">
 <CardContent className="p-4 flex items-center justify-between gap-4">
 <div className="relative flex-1 max-w-md">
 <label htmlFor="teamSearchInput" className="sr-only">Search team members</label>
 <Search aria-hidden="true" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
 <input
 id="teamSearchInput"
 type="search"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by name, email, or role..."
 className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info shadow-sm"
 />
 </div>
 <span className="text-xs text-text-tertiary font-mono">Backend RBAC Enforced</span>
 </CardContent>
 </Card>

 <Card className="overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <caption className="sr-only">List of team members, roles, and statuses</caption>
 <thead className="bg-surface-hover border-b border-border text-label">
 <tr>
 <th scope="col" className="py-3 px-5 font-bold uppercase tracking-wider text-[11px]">User & Email</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Role</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
 <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Last Activity</th>
 <th scope="col" className="py-3 px-5 text-right font-bold uppercase tracking-wider text-[11px]"><span className="sr-only">Manage</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle bg-surface">
 {filteredMembers.map((user) => (
 <tr 
 key={user.id}
 tabIndex={0}
 role="button"
 onClick={() => setSelectedUser(user)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 setSelectedUser(user);
 }
 }}
 aria-label={`Configure permissions for ${user.name}`}
 className="hover:bg-surface-hover transition-colors cursor-pointer group focus:outline-none focus:bg-surface-hover focus:ring-2 focus:ring-inset focus:ring-info"
 >
 <td className="py-4 px-5">
 <div className="font-bold text-text-primary text-xs">{user.name}</div>
 <div className="text-[11px] font-mono text-text-tertiary mt-0.5 flex items-center gap-1">
 <Mail aria-hidden="true" size={12} /> <span>{user.email}</span>
 </div>
 </td>

 <td className="py-4 px-4">
 {getRoleBadge(user.role, user.customRoleName)}
 </td>

 <td className="py-4 px-4">
 {getStatusBadge(user.status)}
 </td>

 <td className="py-4 px-4 font-mono text-xs text-text-secondary">
 {user.lastActivity}
 </td>

 <td className="py-4 px-5 text-right">
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
 aria-label={`Configure permissions for ${user.name}`}
 className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-text-secondary bg-base hover:bg-surface-hover border border-border rounded-md transition-colors focus:ring-2 focus:ring-info focus:outline-none"
 >
 Configure <ArrowRight aria-hidden="true" size={12} />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 )}

 {/* Roles & Permissions Tab View */}
 {activeTab === 'roles' && (
 <div id="roles-panel" role="tabpanel" aria-labelledby="roles-tab" className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {ROLES_DEFINITIONS.map((role) => (
 <Card key={role.name} className="shadow-sm flex flex-col justify-between">
 <CardContent className="p-6 space-y-4">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-text-primary m-0">{role.name}</h3>
 {role.isCustom && (
 <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-risk-moderate/10 text-risk-moderate ">Future Custom Role</span>
 )}
 </div>
 <p className="text-xs text-text-tertiary font-mono mt-0.5 m-0">{role.userCount} active users assigned</p>
 </div>
 <div className="p-2.5 rounded-xl bg-base border border-border" aria-hidden="true">
 <ShieldCheck size={18} className="text-info" />
 </div>
 </div>

 <p className="text-xs text-text-secondary leading-relaxed m-0">
 {role.description}
 </p>

 <div className="space-y-2 pt-2 border-t border-border-subtle">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Enforced Backend Scopes</span>
 <div className="flex flex-wrap gap-1.5" aria-label={`Scopes for ${role.name}`}>
 {role.permissions.map((perm, idx) => (
 <span key={idx} className="font-mono text-[11px] px-2 py-0.5 bg-base border border-border rounded text-text-primary">
 {perm}
 </span>
 ))}
 </div>
 </div>
 </CardContent>

 <div className="px-6 py-3 bg-surface-hover/30 border-t border-border flex items-center justify-between text-xs">
 <span className="text-[10px] font-mono text-text-tertiary">🛡️ Server-Side Authorization Validated</span>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* Accessible Invite Modal with Focus Trap */}
 <Dialog open={isInviteModalOpen} onClose={() => { setIsInviteModalOpen(false); inviteButtonRef.current?.focus(); }} title="Invite Team Member" maxWidth="max-w-md">
 <div className="p-6 space-y-6">
 <div className="flex items-start justify-between border-b border-border pb-4">
 <div>
 <h2 id="invite-modal-title" className="text-base font-bold text-text-primary m-0">Invite Team Member</h2>
 <p id="invite-modal-desc" className="text-xs text-text-tertiary mt-0.5 m-0">Invite a teammate to this demo workspace. Demo: no email is sent.</p>
 </div>
 <button 
 type="button"
 onClick={() => {
 setIsInviteModalOpen(false);
 inviteButtonRef.current?.focus();
 }} 
 aria-label="Close invite modal"
 className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 <X aria-hidden="true" size={18} />
 </button>
 </div>

 <div className="space-y-4 text-xs">
 <div className="space-y-1.5">
 <label htmlFor="inviteEmailInput" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Email Address</label>
 <input 
 id="inviteEmailInput"
 type="email" 
 placeholder="colleague@enterprise.com"
 value={inviteEmail}
 onChange={(e) => setInviteEmail(e.target.value)}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-info"
 />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="inviteRoleSelect" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Assigned Role</label>
 <select 
 id="inviteRoleSelect"
 value={selectedRole}
 onChange={(e) => setSelectedRole(e.target.value)}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="Analyst">Analyst (Core Operations)</option>
 <option value="Admin">Admin (Tenant Management)</option>
 <option value="Viewer">Viewer (Read-Only Executive)</option>
 <option value="Custom">Custom Role (Type Custom Name)</option>
 </select>
 </div>

 {selectedRole === 'Custom' && (
 <div className="space-y-1.5 animate-in fade-in duration-200">
 <label htmlFor="customRoleNameInput" className="font-bold uppercase tracking-wider text-[10px] text-accent block">Custom Role Name</label>
 <input 
 id="customRoleNameInput"
 type="text" 
 value={customRoleInput}
 onChange={(e) => setCustomRoleInput(e.target.value)}
 placeholder="e.g. External Auditor, Legal Counsel" 
 className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-transparent rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface focus:border-accent/40 focus:ring-4 focus:ring-accent/10 transition-all"
 />
 </div>
 )}

 <div className="p-3 bg-accent-muted/50 border border-accent/25 rounded-lg text-accent text-[11px] leading-relaxed">
 <strong>Demo note:</strong> no email is sent. Invited members appear in the list with "Pending Invitation" status. Roles are illustrative only.
 </div>
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-border">
 <Button 
 type="button"
 variant="secondary" 
 size="sm" 
 onClick={() => {
 setIsInviteModalOpen(false);
 inviteButtonRef.current?.focus();
 }}
 >
 Cancel
 </Button>
 <Button 
 type="button"
 variant="primary" 
 size="sm" 
 onClick={() => {
 if (inviteEmail.trim()) {
 const newMember: TeamMember = {
 id: `tm-${Date.now()}`,
 name: inviteEmail.split('@')[0],
 email: inviteEmail.trim(),
 role: selectedRole as UserRole,
 customRoleName: selectedRole === 'Custom' && customRoleInput.trim() ? customRoleInput.trim() : undefined,
 status: 'Pending Invitation',
 lastActivity: 'Invited just now',
 };
 setMembers(prev => [...prev, newMember]);
 auditStore.appendRecord('Current User', 'TEAM_INVITE_SENT', inviteEmail.trim(), `Invited as ${selectedRole}${newMember.customRoleName ? ` (${newMember.customRoleName})` : ''}`);
 setInviteEmail('');
 setCustomRoleInput('');
 }
 setIsInviteModalOpen(false);
 inviteButtonRef.current?.focus();
 }}
 disabled={!inviteEmail.trim()}
 >
 Send Invitation
 </Button>
 </div>
 </div>
 </Dialog>

 {/* User Detail Drawer — opened by clicking a row or "Configure" */}
 {selectedUser && createPortal(
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="user-drawer-title"
 className="fixed inset-0 z-[100] flex justify-end bg-black/50 animate-in fade-in duration-200"
 onClick={() => setSelectedUser(null)}
 >
 <div 
 onClick={(e) => e.stopPropagation()}
 className="bg-surface border-l border-border w-full max-w-md h-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-200"
 >
 <div className="flex items-start justify-between border-b border-border px-6 py-5 shrink-0">
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-full bg-accent-muted text-accent flex items-center justify-center text-sm font-bold shrink-0" aria-hidden="true">
 {selectedUser.name.split(' ').map(n => n[0]).join('')}
 </div>
 <div>
 <h2 id="user-drawer-title" className="text-base font-bold text-text-primary m-0">{selectedUser.name}</h2>
 <p className="text-xs font-mono text-text-tertiary mt-0.5 m-0 flex items-center gap-1">
 <Mail aria-hidden="true" size={12} /> {selectedUser.email}
 </p>
 </div>
 </div>
 <button 
 type="button"
 onClick={() => setSelectedUser(null)} 
 aria-label="Close user details"
 className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 <X aria-hidden="true" size={18} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
 <div className="flex items-center gap-2">
 {getRoleBadge(selectedUser.role, selectedUser.customRoleName)}
 {getStatusBadge(selectedUser.status)}
 </div>

 <div className="grid grid-cols-2 gap-4 text-xs">
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Last Activity</span>
 <span className="text-text-primary font-medium font-mono block mt-1">{selectedUser.lastActivity}</span>
 </div>
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Mode</span>
 <span className="text-text-primary font-medium block mt-1 flex items-center gap-1.5">
 <ShieldCheck aria-hidden="true" size={13} className="text-status-warning" />
 Demo (client-side)
 </span>
 </div>
 </div>

 <div className="space-y-2.5">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
 <KeyRound aria-hidden="true" size={12} /> Enforced Permission Scopes
 </span>
 <div className="flex flex-wrap gap-1.5">
 {selectedUserScopes.map((perm, idx) => (
 <span key={idx} className="font-mono text-[11px] px-2 py-0.5 bg-base border border-border rounded text-text-primary">
 {perm}
 </span>
 ))}
 </div>
 </div>

 <div className="space-y-2">
 <label htmlFor="drawerRoleSelect" className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">Assigned Role</label>
 <select 
 id="drawerRoleSelect"
 value={selectedUser.role}
 onChange={(e) => updateMember(selectedUser.id, { role: e.target.value as UserRole })}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option value="Admin">Admin (Tenant Management)</option>
 <option value="Analyst">Analyst (Core Operations)</option>
 <option value="Viewer">Viewer (Read-Only Executive)</option>
 <option value="Custom">Custom Role</option>
 </select>
 </div>
 </div>

 <div className="border-t border-border px-6 py-4 shrink-0 flex items-center gap-2.5">
 {selectedUser.status === 'Suspended' ? (
 <Button 
 type="button"
 variant="primary" 
 size="sm" 
 onClick={() => updateMember(selectedUser.id, { status: 'Active' })}
 className="flex-1 gap-1.5 text-xs font-semibold"
 >
 <UserCheck aria-hidden="true" size={14} /> Reactivate User
 </Button>
 ) : (
 <Button 
 type="button"
 variant="secondary" 
 size="sm" 
 onClick={() => updateMember(selectedUser.id, { status: 'Suspended' })}
 className="flex-1 gap-1.5 text-xs font-semibold text-risk-critical hover:bg-risk-critical/10"
 >
 <UserX aria-hidden="true" size={14} /> Suspend Access
 </Button>
 )}
 {selectedUser.status === 'Pending Invitation' && (
 <Button 
 type="button"
 variant="secondary" 
 size="sm" 
 onClick={() => updateMember(selectedUser.id, { status: 'Active', lastActivity: 'Just now (invitation accepted)' })}
 className="flex-1 gap-1.5 text-xs font-semibold"
 >
 <RefreshCw aria-hidden="true" size={14} /> Resend Invitation
 </Button>
 )}
 </div>
 </div>
 </div>
 , document.body)}

 </div>
 );
}