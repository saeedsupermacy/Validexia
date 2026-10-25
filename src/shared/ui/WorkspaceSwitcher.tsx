// src/shared/ui/WorkspaceSwitcher.tsx
import { useState, useRef, useEffect } from 'react';
import { Building2, Check, ChevronDown, Search, Settings, Shield } from 'lucide-react';
import { DEVELOPMENT_ORGANIZATIONS, OrganizationFixture } from '../../fixtures/organizations';
import { navigateTo } from '../../shared/navigation';

interface WorkspaceSwitcherProps {
 onOrganizationChange?: (orgId: string) => void;
}

export function WorkspaceSwitcher({ onOrganizationChange }: WorkspaceSwitcherProps) {
 const [isOpen, setIsOpen] = useState(false);
 const [organizations, setOrganizations] = useState<OrganizationFixture[]>(() => {
 try {
 const savedId = localStorage.getItem('vx-workspace');
 if (savedId && DEVELOPMENT_ORGANIZATIONS.some(o => o.id === savedId)) {
 return DEVELOPMENT_ORGANIZATIONS.map(o => ({ ...o, isCurrent: o.id === savedId }));
 }
 } catch {}
 return DEVELOPMENT_ORGANIZATIONS;
 });
 const [searchQuery, setSearchQuery] = useState('');
 const dropdownRef = useRef<HTMLDivElement>(null);

 const currentOrg = organizations.find(o => o.isCurrent) || organizations[0];

 // Close on outside click or Escape
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key === 'Escape') setIsOpen(false);
 };
 document.addEventListener('mousedown', handleClickOutside);
 document.addEventListener('keydown', handleKeyDown);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 document.removeEventListener('keydown', handleKeyDown);
 };
 }, []);

 const handleSelect = (id: string) => {
 try { localStorage.setItem('vx-workspace', id); } catch {}
 setOrganizations(prev => prev.map(org => ({
 ...org,
 isCurrent: org.id === id
 })));
 setIsOpen(false);
 if (onOrganizationChange) {
 onOrganizationChange(id);
 }
 };

 const filteredOrgs = organizations.filter(org => 
 org.name.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="relative" ref={dropdownRef}>
 {/* Trigger Button */}
 <button
 type="button"
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info group text-left"
 aria-expanded={isOpen}
 aria-haspopup="menu"
 aria-label="Switch organization workspace"
 >
 <div aria-hidden="true" className="w-7 h-7 rounded bg-surface border border-border flex items-center justify-center text-text-primary shrink-0 shadow-sm">
 <Building2 size={15} strokeWidth={1.5} />
 </div>
 <div className="hidden md:block text-left truncate max-w-[160px]">
 <span className="block text-xs font-medium text-text-primary truncate">{currentOrg.name}</span>
 <span className="block text-[10px] text-text-tertiary capitalize">{currentOrg.tier} • {currentOrg.role}</span>
 </div>
 <ChevronDown aria-hidden="true" size={14} strokeWidth={1.5} className="text-text-tertiary group-hover:text-text-secondary transition-colors ml-1 shrink-0" />
 </button>

 {/* Dropdown Menu */}
 {isOpen && (
 <div role="menu" className="absolute left-0 mt-2 w-72 rounded-lg bg-surface border border-border shadow-lg z-50 overflow-hidden animate-in fade-in-50 duration-150">
 <div className="p-3 border-b border-border bg-base/50">
 <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Switch Workspace</p>
 {organizations.length > 2 && (
 <div className="relative">
 <Search aria-hidden="true" size={14} className="absolute left-2.5 top-2.5 text-text-tertiary" strokeWidth={1.5} />
 <label htmlFor="workspaceSearchInput" className="sr-only">Filter workspaces</label>
 <input
 id="workspaceSearchInput"
 type="search"
 placeholder="Filter workspaces..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md shadow-sm focus:outline-none focus:border-info text-text-primary placeholder:text-text-tertiary"
 autoFocus
 />
 </div>
 )}
 </div>

 <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOrgs.length > 0 ? (
 filteredOrgs.map((org) => (
 <button
 key={org.id}
 type="button"
 role="menuitem"
 onClick={() => handleSelect(org.id)}
 className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors focus:outline-none focus:ring-2 focus:ring-info ${
 org.isCurrent ? 'bg-surface-hover text-text-primary font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
 }`}
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <Shield aria-hidden="true" size={14} strokeWidth={1.5} className={org.isCurrent ? 'text-info shrink-0' : 'text-text-tertiary shrink-0'} />
 <div className="truncate">
 <p className="text-xs truncate m-0">{org.name}</p>
 <p className="text-[10px] text-text-tertiary capitalize m-0">{org.tier}</p>
 </div>
 </div>
 {org.isCurrent && <Check aria-hidden="true" size={14} strokeWidth={2} className="text-info shrink-0 ml-2" />}
 </button>
 ))
 ) : (
 <div className="py-4 text-center text-xs text-text-tertiary">
 No organizations found.
 </div>
 )}
 </div>

 <div className="p-2 border-t border-border bg-base/30 flex items-center justify-between">
 <span className="text-[11px] text-text-tertiary px-1 capitalize">{currentOrg.tier} plan</span>
 <button 
 type="button"
 onClick={() => { setIsOpen(false); navigateTo('settings'); }}
 className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-info"
 >
 <Settings aria-hidden="true" size={13} strokeWidth={1.5} />
 <span>Settings</span>
 </button>
 </div>
 </div>
 )}
 </div>
 );
}