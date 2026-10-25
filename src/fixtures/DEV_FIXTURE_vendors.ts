// src/fixtures/DEV_FIXTURE_vendors.ts
import { VendorDTO } from '../features/vendors/api';

export const DEV_FIXTURE_VENDORS: VendorDTO[] = [
 {
 id: 'vend-001',
 name: 'CloudScale Infrastructure (Mock Data)',
 code: 'VND-001',
 domain: 'cloudscale-infra.io',
 category: 'Cloud & Hosting Services',
 riskScore: 88,
 riskLevel: 'Critical Exposure (Simulation)',
 },
 {
 id: 'vend-002',
 name: 'Apex Gateway Payments (Mock Data)',
 code: 'VND-002',
 domain: 'apexpayments.com',
 category: 'Financial Infrastructure',
 riskScore: 78,
 riskLevel: 'Elevated Exposure (Simulation)',
 },
];