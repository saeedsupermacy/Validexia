// src/fixtures/DEV_FIXTURE_organizations.ts

export interface DEV_FIXTURE_Organization {
 id: string;
 name: string;
 tier: string;
 role: string;
 isCurrent: boolean;
}

export const DEV_FIXTURE_ORGANIZATIONS: DEV_FIXTURE_Organization[] = [
 {
 id: 'org_dev_01',
 name: 'Validexia Enterprise (Local Dev)',
 tier: 'Enterprise Tier 1',
 role: 'Administrator',
 isCurrent: true,
 },
 {
 id: 'org_dev_02',
 name: 'GlobalTech Financials (Sandbox)',
 tier: 'Sandbox Tier 2',
 role: 'Analyst',
 isCurrent: false,
 },
];