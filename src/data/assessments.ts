/**
 * User-launched assessments.
 * The Assessments workspace ships with demo records; anything the user
 * launches (e.g. from a vendor's detail page) is persisted here and merged
 * in, so launched assessments survive tab switches and reloads.
 */
import type { AssessmentRecord } from '../features/assessments/AssessmentsWorkspace';

const CUSTOM_ASSESSMENTS_KEY = 'vx-custom-assessments';

function loadCustomAssessments(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ASSESSMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCustomAssessments(): AssessmentRecord[] {
  return loadCustomAssessments();
}

export interface NewAssessmentInput {
  vendorName: string;
  assessmentType: string;
}

/** Launch an assessment from the app. Persists locally. */
export function addAssessment(input: NewAssessmentInput): AssessmentRecord {
  const record: AssessmentRecord = {
    id: `assm-custom-${Date.now()}`,
    vendorName: input.vendorName,
    assessmentType: input.assessmentType,
    progress: 0,
    status: 'Awaiting Vendor',
    owner: 'Unassigned',
    deadline: 'TBD',
    isOverdue: false,
    riskRelevance: 'Medium',
    evidenceCoverage: 0,
  };
  try {
    localStorage.setItem(CUSTOM_ASSESSMENTS_KEY, JSON.stringify([record, ...loadCustomAssessments()].slice(0, 200)));
  } catch {
    // storage unavailable — still returned for this session
  }
  return record;
}
