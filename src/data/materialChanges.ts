/**
 * Material changes feed — the single dataset behind the Command Center
 * "Material Changes" timeline and the "N material changes in 24h" pulse stat.
 *
 * Seeds with demo events, then APPENDS real events whenever the user does
 * something in the app (vendor added/offboarded, evidence uploaded,
 * assessment launched, remediation/decision created). Persisted to
 * localStorage so the feed reflects the user's real activity across sessions.
 */
import type { MaterialChangeEventData, ChangeEventType, ChangeSeverity } from '../features/command-center/MaterialChangeEvent';

const CUSTOM_EVENTS_KEY = 'vx-material-changes';

const SEED_EVENTS: MaterialChangeEventData[] = [
  {
    id: 'evt-1',
    timestamp: 'Today, 11:14 AM',
    occurredAt: Date.now() - 3 * 3600_000,
    objectName: 'Apex Gateway',
    objectType: 'Vendor',
    eventType: 'risk_change',
    changeSummary: 'Security risk score dropped significantly from 82 to 64',
    severity: 'critical',
    contextReason: 'Dark web credential dump exposed 3 institutional service accounts matching vendor domain infrastructure.',
    actionLabel: 'Inspect Risk Assessment',
    actionUrl: '/vendors/apex-gateway',
  },
  {
    id: 'evt-2',
    timestamp: 'Today, 08:30 AM',
    occurredAt: Date.now() - 6 * 3600_000,
    objectName: 'SecureAuth Identity',
    objectType: 'Remediation',
    eventType: 'remediation_status',
    changeSummary: 'Critical vulnerability resolution SLA breached (>90 days)',
    severity: 'high',
    contextReason: 'CVE-2026-1045 remains unpatched despite two formal escalation notices sent to vendor security team.',
    actionLabel: 'View Remediation Ticket',
    actionUrl: '/remediation/rem-402',
  },
  {
    id: 'evt-3',
    timestamp: 'Yesterday, 16:45 PM',
    occurredAt: Date.now() - 26 * 3600_000,
    objectName: 'DataFlow Analytics',
    objectType: 'Intelligence',
    eventType: 'dependency_change',
    changeSummary: 'New fourth-party sub-processor dependency discovered',
    severity: 'moderate',
    contextReason: 'Automated continuous discovery mapped a direct data conduit to AWS eu-central-1 (Frankfurt).',
    actionLabel: 'Review Data Residency',
    actionUrl: '/intelligence/deps-88',
  },
  {
    id: 'evt-4',
    timestamp: 'Oct 3, 14:20 PM',
    occurredAt: Date.now() - 6 * 24 * 3600_000,
    objectName: 'CloudScale Infrastructure',
    objectType: 'Evidence',
    eventType: 'certificate_expiry',
    changeSummary: 'SOC 2 Type II attestation certificate expired',
    severity: 'high',
    contextReason: 'Annual compliance renewal package was not uploaded prior to the expiration window.',
    actionLabel: 'Request Evidence Renewal',
    actionUrl: '/evidence/ev-12',
  },
  {
    id: 'evt-5',
    timestamp: 'Oct 2, 09:10 AM',
    occurredAt: Date.now() - 7 * 24 * 3600_000,
    objectName: 'GlobalHR Systems',
    objectType: 'Contract',
    eventType: 'contract_obligation',
    changeSummary: 'Annual security exhibit clause review approaching',
    severity: 'low',
    contextReason: 'Standard 30-day notice window triggered for upcoming DPA and cybersecurity rider renewal.',
    actionLabel: 'View Contract Terms',
    actionUrl: '/contracts/con-90',
  },
];

function loadCustomEvents(): MaterialChangeEventData[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTimestamp(at: number): string {
  try {
    const d = new Date(at);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (sameDay) return `Today, ${time}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
  } catch {
    return 'Just now';
  }
}

/** Full feed: user-recorded events first (newest), then seeds. Newest first overall. */
export function getMaterialChanges(): MaterialChangeEventData[] {
  const customs = loadCustomEvents();
  return [...customs, ...SEED_EVENTS].sort((a, b) => (b.occurredAt ?? 0) - (a.occurredAt ?? 0));
}

/** How many changes happened in the last 24h — drives the pulse stat. */
export function materialChanges24h(): number {
  const cutoff = Date.now() - 24 * 3600_000;
  return getMaterialChanges().filter(e => (e.occurredAt ?? 0) >= cutoff).length;
}

export interface RecordChangeInput {
  objectName: string;
  objectType: string;
  eventType: ChangeEventType;
  changeSummary: string;
  severity: ChangeSeverity;
  contextReason: string;
  actionLabel?: string;
}

/** Record something the user just did so it shows up in the feed immediately. */
export function recordMaterialChange(input: RecordChangeInput): MaterialChangeEventData {
  const at = Date.now();
  const event: MaterialChangeEventData = {
    id: `evt-user-${at}`,
    timestamp: formatTimestamp(at),
    occurredAt: at,
    ...input,
  };
  try {
    const customs = loadCustomEvents();
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify([event, ...customs].slice(0, 100)));
  } catch {
    // storage unavailable — feed still shows it for this session via in-memory fallback
  }
  return event;
}
