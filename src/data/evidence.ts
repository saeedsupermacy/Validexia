/**
 * Evidence artifacts — the single dataset behind the Evidence workspace.
 * Seeds with demo artifacts; uploads from the app are persisted here and
 * merged in, so a vendor's detail page and the repository never disagree.
 */

export type EvidenceStatus = 'Verified' | 'Expiring' | 'Expired' | 'Awaiting Review';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type EvidenceType = 'SOC 2 Type II' | 'ISO 27001' | 'Penetration Test' | 'SIG Questionnaire' | 'DPA / Legal Exhibit';

export interface EvidenceRecord {
  id: string;
  artifactName: string;
  vendorName: string;
  vendorId: string;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  confidence: ConfidenceLevel;
  source: 'Automated API Ingestion' | 'Direct Vendor Upload' | 'Third-Party Auditor' | 'Legal Counsel';
  controlMapping: string;
  expirationDate: string;
  findingsCount: number;
  citationRef: string;
  owner: string;
}

const DEV_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: 'ev-001',
    artifactName: 'CloudScale SOC 2 Type II (2026)',
    vendorName: 'CloudScale Infrastructure',
    vendorId: 'vend-001',
    evidenceType: 'SOC 2 Type II',
    status: 'Expired',
    confidence: 'Low',
    source: 'Direct Vendor Upload',
    controlMapping: 'CC6.1 Logical Access Controls',
    expirationDate: 'Oct 1, 2026',
    findingsCount: 2,
    citationRef: 'SOC2-2026-CS-04',
    owner: 'Sarah Jenkins',
  },
  {
    id: 'ev-002',
    artifactName: 'SecureAuth ISO 27001 Certification',
    vendorName: 'SecureAuth Identity',
    vendorId: 'vend-002',
    evidenceType: 'ISO 27001',
    status: 'Verified',
    confidence: 'High',
    source: 'Third-Party Auditor',
    controlMapping: 'ISO A.9 Access Control',
    expirationDate: 'Jun 14, 2027',
    findingsCount: 0,
    citationRef: 'ISO-2025-SA-99',
    owner: 'Marcus Chen',
  },
  {
    id: 'ev-003',
    artifactName: 'Apex Gateway Annual Pen Test Report',
    vendorName: 'Apex Gateway Payments',
    vendorId: 'vend-003',
    evidenceType: 'Penetration Test',
    status: 'Expiring',
    confidence: 'Medium',
    source: 'Automated API Ingestion',
    controlMapping: 'OWASP Top 10 / Vuln Mgmt',
    expirationDate: 'Nov 12, 2026',
    findingsCount: 3,
    citationRef: 'PEN-2026-APEX-01',
    owner: 'Sarah Jenkins',
  },
  {
    id: 'ev-004',
    artifactName: 'DataFlow SIG Lite Security Assessment',
    vendorName: 'DataFlow Analytics',
    vendorId: 'vend-004',
    evidenceType: 'SIG Questionnaire',
    status: 'Verified',
    confidence: 'High',
    source: 'Direct Vendor Upload',
    controlMapping: 'SIG-PRIV-04 Governance',
    expirationDate: 'Aug 22, 2027',
    findingsCount: 0,
    citationRef: 'SIG-2026-DF-12',
    owner: 'Alex Rivera',
  },
  {
    id: 'ev-005',
    artifactName: 'Synapse AI Data Processing Addendum',
    vendorName: 'Synapse AI Services',
    vendorId: 'vend-007',
    evidenceType: 'DPA / Legal Exhibit',
    status: 'Awaiting Review',
    confidence: 'Medium',
    source: 'Legal Counsel',
    controlMapping: 'GDPR Art. 28 Sub-processors',
    expirationDate: 'Jan 10, 2028',
    findingsCount: 1,
    citationRef: 'DPA-SYN-2026',
    owner: 'Marcus Chen',
  },
];

const CUSTOM_EVIDENCE_KEY = 'vx-custom-evidence';

function loadCustomEvidence(): EvidenceRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EVIDENCE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Full artifact list — uploads first, then demo seeds. */
export function getEvidence(): EvidenceRecord[] {
  return [...loadCustomEvidence(), ...DEV_EVIDENCE_RECORDS];
}

/** Artifacts for one vendor, matched by vendor id or name. */
export function getEvidenceForVendor(vendorId: string, vendorName: string): EvidenceRecord[] {
  const name = vendorName.toLowerCase();
  return getEvidence().filter(
    e => e.vendorId === vendorId || e.vendorName.toLowerCase() === name
  );
}

export interface NewEvidenceInput {
  artifactName: string;
  vendorName: string;
  vendorId: string;
  evidenceType: EvidenceType;
  owner: string;
}

/** Persist an uploaded artifact so it appears in the repository and on the vendor's page. */
export function addEvidence(input: NewEvidenceInput): EvidenceRecord {
  const at = Date.now();
  const customs = loadCustomEvidence();
  const record: EvidenceRecord = {
    id: `ev-upload-${at}`,
    status: 'Awaiting Review',
    confidence: 'Medium',
    source: 'Direct Vendor Upload',
    controlMapping: 'Pending classification',
    expirationDate: 'TBD',
    findingsCount: 0,
    citationRef: `UPL-${new Date(at).getFullYear()}-${String(customs.length + DEV_EVIDENCE_RECORDS.length + 1).padStart(3, '0')}`,
    ...input,
  };
  try {
    localStorage.setItem(CUSTOM_EVIDENCE_KEY, JSON.stringify([record, ...customs].slice(0, 200)));
  } catch {
    // storage unavailable — still returned for this session
  }
  return record;
}
