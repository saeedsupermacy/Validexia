/**
 * User-recorded governance decisions.
 * The Decisions workspace ships with authored demo records; anything the user
 * records (e.g. from a vendor's detail page) is persisted here and merged in.
 */
import type { DecisionType } from '../features/decisions/DecisionsWorkspace';

const CUSTOM_DECISIONS_KEY = 'vx-custom-decisions';

export interface CustomDecision {
  id: string;
  vendorId: string;
  vendorName: string;
  decisionTitle: string;
  decisionType: DecisionType;
  decisionRationale: string;
  decisionMaker: string;
  timestamp: string;
  occurredAt: number;
}

export interface NewDecisionInput {
  vendorId: string;
  vendorName: string;
  decisionTitle: string;
  decisionType: DecisionType;
  decisionRationale: string;
}

function loadCustomDecisions(): CustomDecision[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DECISIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCustomDecisions(): CustomDecision[] {
  return loadCustomDecisions().sort((a, b) => b.occurredAt - a.occurredAt);
}

export function getCustomDecisionsForVendor(vendorId: string): CustomDecision[] {
  return getCustomDecisions().filter(d => d.vendorId === vendorId);
}

export function addDecision(input: NewDecisionInput): CustomDecision {
  const at = Date.now();
  const record: CustomDecision = {
    id: `dec-custom-${at}`,
    decisionMaker: 'Current User',
    timestamp: new Date(at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    occurredAt: at,
    ...input,
  };
  try {
    localStorage.setItem(CUSTOM_DECISIONS_KEY, JSON.stringify([record, ...loadCustomDecisions()].slice(0, 200)));
  } catch {
    // storage unavailable — still returned for this session
  }
  return record;
}
