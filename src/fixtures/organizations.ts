export interface OrganizationFixture {
 id: string;
 name: string;
 tier: 'Enterprise' | 'Growth' | 'Sandbox';
 role: 'Owner' | 'Security Admin' | 'Auditor';
 isCurrent?: boolean;
}

export const DEVELOPMENT_ORGANIZATIONS: OrganizationFixture[] = [
 { id: 'org_validexia_prod', name: 'Validexia Enterprise Global', tier: 'Enterprise', role: 'Security Admin', isCurrent: true },
 { id: 'org_validexia_eu', name: 'Validexia EU Compliance Hub', tier: 'Growth', role: 'Security Admin', isCurrent: false },
 { id: 'org_sandbox_test', name: 'Sandbox & QA Environment', tier: 'Sandbox', role: 'Owner', isCurrent: false },
];