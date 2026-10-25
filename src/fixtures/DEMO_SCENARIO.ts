// src/fixtures/DEMO_SCENARIO.ts

export const DEMO_CONFIG = {
 isDemoModeActive: true,
 demoScenarioName: "Q4 High-Criticality Vendor Review"
};

export const DEMO_VENDORS = [
 {
 id: 'vend-001',
 name: 'CloudScale Infrastructure',
 code: 'VND-001',
 domain: 'cloudscale-infra.io',
 category: 'Cloud & Hosting Services',
 criticality: 'Tier 1 - Critical',
 riskScore: 88,
 inherentRisk: 100,
 residualRisk: 88,
 contractStart: '2024-01-15',
 contractEnd: '2027-01-15',
 riskLevel: 'Critical Exposure',
 evidenceConfidence: '91.7% (Expiring Attestation)',
 lastMaterialChange: 'Today, 09:14 AM',
 owner: 'Sarah Jenkins',
 monitoringStatus: 'Active Continuous Monitoring',
 evidenceStatus: 'Expiring',
 assessmentStatus: 'Pending Review',
 openIssues: 5,
 dependentSystems: [
 { name: 'Core Billing Engine (US-East)', dataHandled: 'Financial Ledger & PCI', residency: 'AWS us-east-1' },
 { name: 'Identity Federation Gateway', dataHandled: 'Customer PII & OAuth Tokens', residency: 'AWS us-west-2' },
 { name: 'Telemetry Analytics Pipeline', dataHandled: 'Encrypted Log Data', residency: 'AWS eu-central-1' }
 ],
 evidence: [
 { name: 'SOC 2 Type II Report', status: 'Expired', date: 'Expired Oct 1, 2026', confidence: 'Low' },
 { name: 'ISO 27001 Certification', status: 'Verified', date: 'Valid through Mar 2027', confidence: 'High' },
 { name: 'SIG Lite Questionnaire', status: 'Completed', date: 'Submitted Sep 14, 2026', confidence: 'High' }
 ],
 remediation: [
 { id: 'rem-102', title: 'Expired SOC 2 Type II Attestation Document Renewal', owner: 'Sarah Jenkins', aging: '62 days overdue', severity: 'high' },
 { id: 'rem-108', title: 'Perimeter Gateway Cipher Suite Hardening', owner: 'External Vendor', aging: '14 days open', severity: 'moderate' }
 ],
 decisions: [
 { date: 'Oct 5, 2026', action: 'Approved conditional use (Tier 1 override)', actor: 'S. Jenkins', rationale: 'Critical dependency for billing engine; compensating controls verified.' },
 { date: 'Sep 12, 2026', action: 'Initial onboarding security review', actor: 'M. Chen', rationale: 'Passed automated posture scan; assigned Tier 1 critical status.' }
 ]
 },
 {
 id: 'vend-003',
 name: 'Apex Gateway Payments',
 code: 'VND-003',
 domain: 'apexpayments.com',
 category: 'Financial Infrastructure',
 criticality: 'Tier 1 - Critical',
 riskScore: 76,
 inherentRisk: 88,
 residualRisk: 76,
 contractStart: '2024-03-10',
 contractEnd: '2027-03-10',
 riskLevel: 'Elevated Exposure',
 evidenceConfidence: '88.4% (Acquisition Audit)',
 lastMaterialChange: 'Oct 06, 2026 - 08:14 UTC',
 owner: 'Sarah Jenkins',
 monitoringStatus: 'Active Continuous Monitoring',
 evidenceStatus: 'Expiring',
 assessmentStatus: 'Pending Review',
 openIssues: 3,
 dependentSystems: [
 { name: 'Global Payment Gateway API', dataHandled: 'PCI-DSS Financial Data', residency: 'AWS us-east-1' }
 ],
 evidence: [
 { name: 'PCI-DSS Level 1 Attestation', status: 'Verified', date: 'Valid through Dec 2026', confidence: 'High' }
 ],
 remediation: [
 { id: 'REM-001', title: 'Deprecated TLS 1.0/1.1 cipher suites active on endpoints.', owner: 'Sarah Jenkins', aging: '15 days open', severity: 'Critical' }
 ],
 decisions: [
 { date: 'Oct 06, 2026', action: 'Acquisition review initiated', actor: 'M. Chen', rationale: 'Acquired by GlobalTech Financials; re-verifying subprocessor chain.' }
 ]
 }
];