import { useState, useEffect, useRef } from 'react';
import { Cpu, ChevronDown } from 'lucide-react';
import { Button } from '../core';

export type AIContextType = 'vendor' | 'evidence' | 'assessment' | 'risk-event' | 'decision';

interface AIAction {
 id: string;
 label: string;
}

const CONTEXT_ACTIONS: Record<AIContextType, AIAction[]> = {
 vendor: [
 { id: 'v-exposure', label: "Explain this vendor's exposure" },
 { id: 'v-compare', label: 'Compare vendor against policy baseline' },
 { id: 'v-remediation', label: 'Summarize overdue remediation' }
 ],
 evidence: [
 { id: 'e-find', label: 'Find evidence supporting this finding' },
 { id: 'e-missing', label: 'Identify missing evidence requirements' },
 { id: 'e-extract', label: 'Extract commitments from MSA' }
 ],
 assessment: [
 { id: 'a-draft-clarification', label: 'Draft clarification questions' },
 { id: 'a-control-gaps', label: 'Highlight unanswered controls' }
 ],
 'risk-event': [
 { id: 'r-summarize', label: 'Summarize what materially changed' },
 { id: 'r-impact', label: 'Analyze downstream blast radius' }
 ],
 decision: [
 { id: 'd-brief', label: 'Prepare a decision brief' },
 { id: 'd-risk-accept', label: 'Draft risk acceptance justification' }
 ]
};

interface AIContextualMenuProps {
 context: AIContextType;
 onSelectAction: (actionId: string, actionLabel: string) => void;
 isLoading?: boolean;
}

export function AIContextualMenu({ context, onSelectAction, isLoading }: AIContextualMenuProps) {
 const actions = CONTEXT_ACTIONS[context];
 const [isOpen, setIsOpen] = useState(false);
 const menuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') setIsOpen(false);
 };
 const handleClickOutside = (e: MouseEvent) => {
 if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
 setIsOpen(false);
 }
 };
 if (isOpen) {
 document.addEventListener('keydown', handleKeyDown);
 document.addEventListener('mousedown', handleClickOutside);
 }
 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [isOpen]);

 return (
 <div className="relative inline-block text-left" ref={menuRef}>
 <Button 
 type="button"
 variant="outline" 
 size="sm" 
 onClick={() => setIsOpen(!isOpen)}
 disabled={isLoading}
 aria-expanded={isOpen}
 aria-haspopup="menu"
 className="h-9 border-accent/25 hover:border-accent/50 text-accent bg-transparent hover:bg-accent-muted/50"
 >
 <Cpu aria-hidden="true" size={14} strokeWidth={1.5} className="mr-2" />
 <span>{isLoading ? 'Analyzing...' : 'Computation Actions'}</span>
 <ChevronDown aria-hidden="true" size={14} strokeWidth={1.5} className="ml-1.5 opacity-50" />
 </Button>

 {isOpen && (
 <div role="menu" className="absolute right-0 mt-2 w-72 rounded-xl bg-surface/95 backdrop-blur-sm border border-border shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
 <div className="px-3 py-2 border-b border-border-subtle bg-base/80">
 <span className="text-[11px] font-medium text-text-tertiary tracking-wide">
 Contextual Analysis
 </span>
 </div>
 <div className="p-1.5">
 {actions.map((action) => (
 <button
 key={action.id}
 type="button"
 role="menuitem"
 onClick={() => {
 onSelectAction(action.id, action.label);
 setIsOpen(false);
 }}
 className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-2.5 group"
 >
 <Cpu aria-hidden="true" size={14} strokeWidth={1.5} className="text-text-tertiary group-hover:text-accent shrink-0" />
 <span>{action.label}</span>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}