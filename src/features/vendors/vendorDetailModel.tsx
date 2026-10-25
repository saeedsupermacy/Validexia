// src/features/vendors/vendorDetailModel.tsx
// Honest per-vendor detail models.
//
// The "Why This Exposure?", "Business Impact", and "Risk Dimensions" sections
// used to render the SAME static narrative for every vendor — a brand-new
// Tier 3 vendor would show SecureAuth/CloudScale's story ("1.4M user records",
// "Core Billing & Invoicing Dependency", CVE-2026-1045...).
//
// Now: vendors that ship with authored demo content keep it; everyone else
// (user-added vendors, and eventually real backend vendors) gets a model
// synthesized from their OWN record — tier, risk score, evidence and
// assessment state — with explicit "not yet known" states instead of
// borrowed fiction.
import { Database, Server, DollarSign, ShieldAlert } from 'lucide-react';
import type { VendorRecord } from '../../data/vendors';
import type { ExposureExplanationModel, ExposureDimension } from './WhyThisExposure';
import type { BusinessImpactModel, BusinessImpactDimension } from './BusinessImpactSection';
import type { RiskDimensionsModel, RiskDimensionItem, EpistemicStatus } from './RiskDimensionsSection';

/** Vendor ids that ship with authored demo narratives. */
const AUTHORED_IDS = new Set([
  'vend-001', 'vend-002', 'vend-003', 'vend-004',
  'vend-005', 'vend-006', 'vend-007', 'vend-008',
]);

export function hasAuthoredDetail(id: string): boolean {
  return AUTHORED_IDS.has(id);
}

function tierLabel(tier: string): string {
  return tier === 'Tier 1' ? 'Tier 1 - Critical'
    : tier === 'Tier 2' ? 'Tier 2 - Important'
    : 'Tier 3 - Standard';
}

// ---------------------------------------------------------------------------
// Why This Exposure?
// ---------------------------------------------------------------------------

export function buildExposureModel(vendor: VendorRecord): ExposureExplanationModel {
  const band = vendor.riskLevel;
  const assessed = vendor.assessmentStatus !== 'Not Started';

  const dims: ExposureDimension[] = [
    {
      id: 'security_posture',
      label: 'Security / Control Posture',
      status: band === 'Critical' ? 'Critical' : band === 'High' ? 'Warning' : 'Unknown',
      scoreImpact: assessed ? `${vendor.riskScore} pts risk` : 'pending assessment',
      narrative: assessed
        ? `Risk score of ${vendor.riskScore} (${band}). Detailed control telemetry arrives with the assessment.`
        : 'No security assessment completed yet. Launch an assessment to evaluate the control posture.',
    },
    {
      id: 'business_criticality',
      label: 'Business Criticality',
      status: vendor.criticality === 'Tier 1' ? 'Warning' : 'Healthy',
      scoreImpact: vendor.criticality === 'Tier 1' ? '+20 pts risk' : 'baseline',
      narrative: `Classified as ${tierLabel(vendor.criticality)}.${vendor.criticality === 'Tier 1' ? ' High operational coupling — assess promptly.' : ''}`,
    },
    {
      id: 'evidence_quality',
      label: 'Evidence Quality',
      status: vendor.evidenceStatus === 'Missing' ? 'Warning' : vendor.evidenceStatus === 'Verified' ? 'Healthy' : 'Warning',
      scoreImpact: vendor.evidenceStatus === 'Missing' ? '+10 pts risk' : '0 pts impact',
      narrative: vendor.evidenceStatus === 'Missing'
        ? 'No evidence artifacts submitted yet. Request baseline documents from the vendor.'
        : `Evidence status: ${vendor.evidenceStatus}.`,
    },
    {
      id: 'material_events',
      label: 'Material Events',
      status: 'Healthy',
      scoreImpact: '0 pts impact',
      narrative: 'No material risk events recorded for this vendor in the past 90 days.',
    },
    {
      id: 'open_remediation',
      label: 'Open Remediation',
      status: vendor.openIssues > 0 ? 'Warning' : 'Healthy',
      scoreImpact: vendor.openIssues > 0 ? `${vendor.openIssues} open` : '0 pts impact',
      narrative: vendor.openIssues > 0
        ? `${vendor.openIssues} open remediation item${vendor.openIssues === 1 ? '' : 's'} tracked for this vendor.`
        : 'No open remediation items for this vendor.',
    },
    {
      id: 'dependency_exposure',
      label: 'Dependency Exposure',
      status: 'Unknown',
      scoreImpact: 'not mapped',
      narrative: 'No sub-processors mapped yet. Dependencies appear here once discovered or declared.',
    },
    {
      id: 'exit_readiness',
      label: 'Exit Readiness',
      status: 'Unknown',
      scoreImpact: 'not evaluated',
      narrative: 'Exit readiness has not been evaluated for this vendor yet.',
    },
  ];

  return {
    vendorId: vendor.id,
    compositeScore: vendor.riskScore,
    engineState: 'Live',
    summaryStatement: `"${vendor.name}" is a ${tierLabel(vendor.criticality)} vendor with a risk score of ${vendor.riskScore} (${band}).${assessed ? '' : ' No assessment has been completed yet, so this breakdown reflects its classification and recorded state only — it will deepen as evidence and assessments arrive.'}`,
    dimensions: dims,
  };
}

// ---------------------------------------------------------------------------
// Business Impact & Enterprise Coupling
// ---------------------------------------------------------------------------

export function buildBusinessImpactModel(vendor: VendorRecord): BusinessImpactModel {
  const sev = (vendor.criticality === 'Tier 1' ? 'High' : vendor.criticality === 'Tier 2' ? 'Moderate' : 'Low') as BusinessImpactDimension['severity'];
  const tierName = vendor.criticality === 'Tier 1' ? 'Extreme' : vendor.criticality === 'Tier 2' ? 'Significant' : 'Limited';

  const dims: BusinessImpactDimension[] = [
    {
      id: 'data_sensitivity',
      label: 'Data Sensitivity',
      icon: <Database aria-hidden="true" size={16} className="text-info" />,
      severity: sev,
      headline: 'No data classification recorded yet',
      detailedAnalysis: 'Record what data this vendor handles during onboarding or assessment to evaluate exposure.',
      metricLabel: 'Records Processed',
      metricValue: 'Not yet known',
    },
    {
      id: 'operational_criticality',
      label: 'Operational Criticality',
      icon: <Server aria-hidden="true" size={16} className="text-risk-critical" />,
      severity: sev,
      headline: 'Operational coupling not yet mapped',
      detailedAnalysis: 'Map dependent systems to understand what breaks if this vendor goes down.',
      metricLabel: 'Max Tolerable Downtime',
      metricValue: 'Not yet known',
    },
    {
      id: 'revenue_dependency',
      label: 'Revenue Dependency',
      icon: <DollarSign aria-hidden="true" size={16} className="text-risk-high" />,
      severity: sev,
      headline: 'No revenue dependency recorded',
      detailedAnalysis: 'Revenue impact is evaluated once the vendor\u2019s role in billing flows is documented.',
      metricLabel: 'Throughput Share',
      metricValue: 'Not yet known',
    },
    {
      id: 'regulatory_impact',
      label: 'Regulatory Impact',
      icon: <ShieldAlert aria-hidden="true" size={16} className="text-status-warning" />,
      severity: sev,
      headline: 'Regulatory exposure not yet assessed',
      detailedAnalysis: 'Compliance obligations (DPA, SOC 2, PCI-DSS) are confirmed during assessment.',
      metricLabel: 'Statutory Exposure',
      metricValue: 'Not yet known',
    },
  ];

  return {
    vendorId: vendor.id,
    overallImpactTier: `${vendor.criticality} - ${tierName} Business Exposure`,
    summaryRationale: `"${vendor.name}" is classified as ${tierLabel(vendor.criticality)}. Impact dimensions are populated as the vendor is assessed — nothing is assumed in the meantime.`,
    dimensions: dims,
  };
}

// ---------------------------------------------------------------------------
// Risk Dimensions & Epistemic Certainty
// ---------------------------------------------------------------------------

export function buildRiskDimensionsModel(vendor: VendorRecord): RiskDimensionsModel {
  const assessed = vendor.assessmentStatus !== 'Not Started';
  const secStatus: EpistemicStatus =
    !assessed ? 'Unknown'
    : vendor.riskLevel === 'Critical' || vendor.riskLevel === 'High' ? 'Known High'
    : vendor.riskLevel === 'Low' ? 'Known Low' : 'Unknown';
  const evStatus: EpistemicStatus =
    vendor.evidenceStatus === 'Verified' ? 'High Confidence'
    : vendor.evidenceStatus === 'Missing' ? 'Unknown'
    : 'Low Confidence';

  const dims: RiskDimensionItem[] = [
    {
      id: 'dim_sec',
      category: 'Security / Control Posture',
      dimensionName: 'Perimeter Vulnerability Posture',
      status: secStatus,
      confidenceScore: assessed ? `Risk score ${vendor.riskScore} (${vendor.riskLevel})` : 'No assessment yet',
      telemetrySummary: assessed
        ? `Risk score of ${vendor.riskScore} recorded for this vendor.`
        : 'No security telemetry recorded yet — launch an assessment.',
      epistemicNote: assessed ? 'Derived from the recorded risk score.' : 'Complete the vendor assessment to establish this dimension.',
    },
    {
      id: 'dim_biz',
      category: 'Business Impact',
      dimensionName: 'Operational Coupling',
      status: vendor.criticality === 'Tier 1' ? 'Known High' : vendor.criticality === 'Tier 3' ? 'Known Low' : 'Unknown',
      confidenceScore: `Tier classification (${vendor.criticality})`,
      telemetrySummary: `Classified as ${tierLabel(vendor.criticality)} at onboarding.`,
      epistemicNote: 'Tier reflects the onboarding questionnaire answers.',
    },
    {
      id: 'dim_evid',
      category: 'Evidence Confidence',
      dimensionName: 'Attestation & Artifacts',
      status: evStatus,
      confidenceScore: `Evidence status: ${vendor.evidenceStatus}`,
      telemetrySummary: vendor.evidenceStatus === 'Missing'
        ? 'No evidence artifacts on file for this vendor.'
        : `Evidence on file is marked ${vendor.evidenceStatus}.`,
      epistemicNote: vendor.evidenceStatus === 'Missing'
        ? 'Upload or request evidence to move this from Unknown.'
        : 'Review the Evidence tab for artifact detail.',
    },
    {
      id: 'dim_dep',
      category: 'Operational Dependency',
      dimensionName: 'Sub-processor & Dependency Map',
      status: 'Unknown',
      confidenceScore: 'Not mapped',
      telemetrySummary: 'No dependencies recorded for this vendor yet.',
      epistemicNote: 'Dependencies appear here once discovered or declared.',
    },
    {
      id: 'dim_exit',
      category: 'Business Impact',
      dimensionName: 'Exit Readiness',
      status: 'Unknown',
      confidenceScore: 'Not evaluated',
      telemetrySummary: 'Exit readiness has not been evaluated for this vendor.',
      epistemicNote: 'Evaluated as part of the offboarding readiness review.',
    },
    {
      id: 'dim_comp',
      category: 'Compliance & Regulatory',
      dimensionName: 'Regulatory Obligations',
      status: 'Unknown',
      confidenceScore: 'Not assessed',
      telemetrySummary: 'Applicable frameworks (DPA, SOC 2, PCI-DSS) not yet confirmed.',
      epistemicNote: 'Confirmed during the vendor assessment.',
    },
  ];

  return { vendorId: vendor.id, dimensions: dims };
}
