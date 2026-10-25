// src/shared/ui/CommandPalette.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
 Search, LayoutDashboard, Building2, ClipboardCheck, 
 
 PlusCircle, FilePlus, CornerDownLeft
} from 'lucide-react';
import { getVendors } from '../../data/vendors';
import { fetchGlobalSearch, type SearchResult } from '../../features/search/searchService';
import { navigateTo, type ViewKey } from '../../shared/navigation';

export interface CommandPaletteProps {
 isOpen: boolean;
 onClose: () => void;
}

/** Route a cross-entity search result to its view, preserving the record ID where the destination supports it. */
function goToSearchResult(result: SearchResult, onClose: () => void): void {
 const parts = result.url.split('/').filter(Boolean);
 const section = parts[0];
 const id = parts[1];
 let view: ViewKey = 'command';
 let params: Record<string, string> | undefined;
 switch (section) {
 case 'vendors':
 view = 'vendors';
 if (id) params = { vendorId: id };
 break;
 case 'assessments':
 view = 'assessments';
 break;
 case 'evidence':
 view = 'evidence';
 break;
 case 'risk-events':
 view = 'risk-events';
 break;
 case 'decisions':
 view = 'decisions';
 break;
 default:
 view = 'command';
 }
 navigateTo(view, params);
 onClose();
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedIndex, setSelectedIndex] = useState(0);
 const [dataResults, setDataResults] = useState<SearchResult[]>([]);
 const inputRef = useRef<HTMLInputElement>(null);
 const listRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 if (isOpen) {
 document.addEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'hidden';
 setTimeout(() => inputRef.current?.focus(), 10);
 }
 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'unset';
 };
 }, [isOpen, onClose]);

 const flattenedItems = useMemo(() => {
 const flat: Array<{ id: string; group: string; label: string; icon: React.ElementType; globalIndex: number; action: () => void; extra?: React.ReactNode }> = [];
 let index = 0;
 const query = searchQuery.toLowerCase();

 // 1. Dynamic Vendor Search (from the canonical registry — all vendors, matched by ID)
 const vendorMatches = getVendors().filter(v => v.name.toLowerCase().includes(query) || v.code.toLowerCase().includes(query));
 if (vendorMatches.length > 0) {
 vendorMatches.forEach(v => {
 flat.push({
 id: v.id,
 group: 'Vendors',
 label: v.name,
 icon: Building2,
 globalIndex: index++,
 action: () => { navigateTo('vendors', { vendorId: v.id }); onClose(); },
 extra: <span className="text-[10px] font-mono text-text-tertiary ml-2 border border-border px-1.5 rounded bg-surface">{v.code}</span>
 });
 });
 }

 // 2. Cross-entity search results (assessments, evidence, risk events, decisions).
 // Vendor category is excluded here — the palette handles vendors directly above with real IDs.
 if (dataResults.length > 0) {
 dataResults.forEach(r => {
 flat.push({
 id: r.id,
 group: 'Search Results',
 label: r.title,
 icon: Search,
 globalIndex: index++,
 action: () => goToSearchResult(r, onClose),
 extra: <span className="text-[10px] text-text-tertiary ml-2 truncate max-w-[180px]">{r.subtitle}</span>
 });
 });
 }

 // 3. Static Commands
 const staticCommands = [
 { group: 'Navigation', items: [
 { id: 'nav-cc', label: 'Go to Command Center', icon: LayoutDashboard },
 { id: 'nav-vendors', label: 'Vendors', icon: Building2 },
 { id: 'nav-assessments', label: 'Assessments', icon: ClipboardCheck },
 ]},
 { group: 'Create', items: [
 { id: 'create-vendor', label: 'Add Vendor', icon: PlusCircle },
 { id: 'create-assessment', label: 'Start Assessment', icon: FilePlus },
 ]}
 ];

 staticCommands.forEach(group => {
 const filtered = group.items.filter(item => item.label.toLowerCase().includes(query));
 filtered.forEach(item => {
 flat.push({
 ...item,
 group: group.group,
 globalIndex: index++,
 action: () => {
 const dest: Record<string, 'command' | 'vendors' | 'assessments'> = {
 'nav-cc': 'command', 'nav-vendors': 'vendors', 'nav-assessments': 'assessments',
 'create-vendor': 'vendors', 'create-assessment': 'assessments',
 };
 navigateTo(dest[item.id] || 'command'); onClose(); }
 });
 });
 });

 return flat;
 }, [searchQuery, dataResults, onClose]);

 // Debounced cross-entity search (replaces the old standalone GlobalSearchModal)
 useEffect(() => {
 const q = searchQuery.trim();
 if (!q) { setDataResults([]); return; }
 const t = setTimeout(() => {
 fetchGlobalSearch(q)
 .then(r => setDataResults(r.filter(x => x.category !== 'vendor')))
 .catch(() => setDataResults([]));
 }, 250);
 return () => clearTimeout(t);
 }, [searchQuery]);

 useEffect(() => {
 setSelectedIndex(0);
 }, [searchQuery]);

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (flattenedItems.length === 0) return;
 if (e.key === 'ArrowDown') {
 e.preventDefault();
 setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
 scrollToItem((selectedIndex + 1) % flattenedItems.length);
 } else if (e.key === 'ArrowUp') {
 e.preventDefault();
 setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
 scrollToItem((selectedIndex - 1 + flattenedItems.length) % flattenedItems.length);
 } else if (e.key === 'Enter') {
 e.preventDefault();
 flattenedItems[selectedIndex]?.action();
 }
 };

 const scrollToItem = (index: number) => {
 const element = listRef.current?.querySelector(`[data-index="${index}"]`) as HTMLElement;
 if (element) element.scrollIntoView({ block: 'nearest' });
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
 <div className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity animate-in fade-in duration-200" onClick={onClose} aria-hidden="true" />
 
 <div className="relative w-full max-w-2xl bg-surface rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200" role="dialog" aria-modal="true" aria-label="Command Palette">
 <div className="flex items-center px-4 border-b border-border bg-base/50">
 <Search aria-hidden="true" size={18} strokeWidth={1.5} className="text-text-tertiary shrink-0" />
 <input
 ref={inputRef}
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onKeyDown={handleKeyDown}
 className="w-full bg-transparent px-3 py-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-0"
 placeholder="Search vendors, assessments, evidence... (Ctrl+K)"
 />
 <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] font-medium text-text-tertiary bg-surface border border-border px-1.5 py-0.5 rounded shrink-0">ESC</kbd>
 </div>

 <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
 {flattenedItems.length > 0 ? (
 flattenedItems.map(({ group, label, icon: Icon, globalIndex, action, extra }, i, arr) => {
 const isNewGroup = i === 0 || arr[i - 1].group !== group;
 const isSelected = selectedIndex === globalIndex;
 return (
 <React.Fragment key={globalIndex}>
 {isNewGroup && <div className="px-3 py-2 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">{group}</div>}
 <button
 type="button"
 data-index={globalIndex}
 onClick={action}
 onMouseEnter={() => setSelectedIndex(globalIndex)}
 className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors focus:outline-none ${isSelected ? 'bg-surface-hover text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
 >
 <div className="flex items-center gap-3">
 <Icon size={16} strokeWidth={1.5} className={isSelected ? 'text-info' : 'text-text-tertiary'} />
 <span className="font-medium">{label}</span>
 {extra}
 </div>
 {isSelected && <CornerDownLeft size={14} className="text-text-tertiary" strokeWidth={1.5} />}
 </button>
 </React.Fragment>
 );
 })
 ) : (
 <div className="py-14 text-center text-sm text-text-tertiary">No results found for "{searchQuery}"</div>
 )}
 </div>
 </div>
 </div>
 );
}