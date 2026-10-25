/**
 * Single source of truth for remediation items.
 * Both RemediationWorkspace (full detail view) and RemediationHealthCard
 * (command center summary) read from here — they can never disagree.
 * Items are keyed by vendor ID, matching src/data/vendors.ts.
 */

export type RemediationStatus = 'Open' | 'In progress' | 'Blocked' | 'Awaiting vendor' | 'Ready for validation' | 'Resolved' | 'Accepted risk';
export type RemediationSeverity = 'Critical' | 'High' | 'Moderate' | 'Low';

/** SLA thresholds in days, per severity — matches industry practice (not a flat 90d). */
export function slaDaysForSeverity(severity: RemediationSeverity): number {
  switch (severity) {
    case 'Critical': return 14;
    case 'High': return 30;
    case 'Moderate': return 60;
    case 'Low': return 90;
  }
}

/** True if the item has exceeded its severity-based SLA. */
export function isSlaBreached(item: { severity: RemediationSeverity; agingDays: number }): boolean {
  return item.agingDays > slaDaysForSeverity(item.severity);
}

export interface CanonicalRemediation {
  id: string;
  /** Short title for cards and table rows */
  title: string;
  /** Full description for the detail view */
  issue: string;
  vendorId: string;
  vendorName: string;
  owner: string;
  severity: RemediationSeverity;
  status: RemediationStatus;
  /** Days since the issue was identified — single consistent age everywhere */
  agingDays: number;
  dueDate: string;
  riskDescription: string;
  evidenceFindingRef: string;
  recommendedAction: string;
  progressPercent: number;
  decisionLinkage: string;
}

export const DEV_REMEDIATIONS: CanonicalRemediation[] = [
  {
    id: 'REM-001',
    title: 'Deprecated TLS 1.0/1.1 cipher suites on payment gateway',
    issue: 'Deprecated TLS 1.0/1.1 cipher suites active on public payment gateway endpoints.',
    vendorId: 'vend-003',
    vendorName: 'Apex Gateway Payments',
    owner: 'Sarah Jenkins',
    severity: 'Critical',
    status: 'In progress',
    agingDays: 45,
    dueDate: 'Nov 24, 2026',
    riskDescription: 'Exposure to man-in-the-middle decryption attacks and PCI-DSS compliance failure.',
    evidenceFindingRef: 'PEN-2026-APEX-01 (Finding #3)',
    recommendedAction: 'Enforce strict TLS 1.2+ configuration via load balancer security policy update.',
    progressPercent: 65,
    decisionLinkage: 'DEC-2026-104 (Mandatory Remediation)',
  },
  {
    id: 'REM-002',
    title: 'Expired SOC 2 Type II attestation renewal',
    issue: 'SOC 2 Type II attestation expired without annual renewal submission.',
    vendorId: 'vend-001',
    vendorName: 'CloudScale Infrastructure',
    owner: 'Sarah Jenkins',
    severity: 'High',
    status: 'Awaiting vendor',
    agingDays: 62,
    dueDate: 'Overdue (62d)',
    riskDescription: 'Loss of verified security assurance for core hosting environment handling Tier 1 PII.',
    evidenceFindingRef: 'SOC2-2026-CS-04 (Expiration Notice)',
    recommendedAction: 'Issue formal demand notice for updated 2026 SOC 2 Type II report.',
    progressPercent: 30,
    decisionLinkage: 'DEC-2026-092 (Escalated Review)',
  },
  {
    id: 'REM-003',
    title: 'Unpatched Zero-Day (CVE-2026-1045) on perimeter gateway',
    issue: 'Unpatched Zero-Day (CVE-2026-1045) exposed on perimeter scan. Critical vulnerability patching SLA breached.',
    vendorId: 'vend-002',
    vendorName: 'SecureAuth Identity',
    owner: 'Marcus Chen',
    severity: 'Critical',
    status: 'Ready for validation',
    agingDays: 94,
    dueDate: 'Overdue (94d)',
    riskDescription: 'Vulnerability to remote code execution via unpatched perimeter gateway.',
    evidenceFindingRef: 'CVE-2026-1045 (Perimeter Scan)',
    recommendedAction: 'Apply vendor patch immediately and verify via rescan.',
    progressPercent: 90,
    decisionLinkage: 'DEC-2026-110 (Control Enforcement)',
  },
];

/** Full remediation list — the single dataset every view reads. */
export function getRemediations(): CanonicalRemediation[] {
  return [...loadCustomRemediations(), ...DEV_REMEDIATIONS];
}

/** Remediation items for a specific vendor. */
export function getRemediationsForVendor(vendorId: string): CanonicalRemediation[] {
  return getRemediations().filter(r => r.vendorId === vendorId);
}

const CUSTOM_REMEDIATIONS_KEY = 'vx-custom-remediations';

function loadCustomRemediations(): CanonicalRemediation[] {
  try {
    const raw = localStorage.getItem(CUSTOM_REMEDIATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface NewRemediationInput {
  title: string;
  issue: string;
  vendorId: string;
  vendorName: string;
  owner: string;
  severity: RemediationSeverity;
}

/** Create a remediation item from the app (e.g. a vendor's detail page). Persists locally. */
export function addRemediation(input: NewRemediationInput): CanonicalRemediation {
  const at = Date.now();
  const record: CanonicalRemediation = {
    id: `REM-C${at.toString().slice(-5)}`,
    status: 'Open',
    agingDays: 0,
    dueDate: 'TBD',
    riskDescription: input.issue,
    evidenceFindingRef: '—',
    recommendedAction: 'Triage and assign an owner.',
    progressPercent: 0,
    decisionLinkage: '—',
    ...input,
  };
  try {
    localStorage.setItem(CUSTOM_REMEDIATIONS_KEY, JSON.stringify([record, ...loadCustomRemediations()].slice(0, 200)));
  } catch {
    // storage unavailable — still returned for this session
  }
  return record;
}
