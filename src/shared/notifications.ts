// src/shared/notifications.ts
// Single source of truth for topbar notifications.
// Built from the same live data the Command Center renders, so the bell
// badge count and the notification list always agree with the product.
import type { ViewKey } from './navigation';
import { getVendors } from '../data/vendors';
import { getTriageItems } from '../features/command-center/CommandCenter';
import { DEV_ACTIVE_REMEDIATIONS } from '../features/command-center/RemediationHealthCard';
import { OPEN_EVENTS } from '../features/command-center/RiskEventsSummaryCard';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  view: ViewKey;
  params?: Record<string, string>;
  time: string;
}

const TRIAGE_VIEW: Record<string, ViewKey> = {
  remediation: 'remediation',
  evidence: 'evidence',
  assessment: 'assessments',
  monitoring: 'monitoring',
  vendor: 'vendors',
  fourth_party: 'fourth-parties',
  risk: 'risk-events',
  contract: 'vendors',
};

export function buildNotifications(): AppNotification[] {
  const out: AppNotification[] = [];

  // 1. Overdue triage items — the curated "needs attention" queue (incl. contract expirations)
  for (const item of getTriageItems()) {
    if (item.status !== 'overdue') continue;
    out.push({
      id: `triage-${item.id}`,
      title: `${item.what}`,
      body: `${item.vendor} · ${item.whenLabel}`,
      severity: 'critical',
      view: TRIAGE_VIEW[item.category] || 'vendors',
      params: { vendorName: item.vendor },
      time: item.whenLabel,
    });
  }

  // 2. SLA-breached remediations
  for (const r of DEV_ACTIVE_REMEDIATIONS) {
    if (r.agingDays <= 90) continue;
    out.push({
      id: `sla-${r.id}`,
      title: `SLA breached: ${r.title}`,
      body: `${r.vendorName} · open ${r.agingDays} days`,
      severity: 'critical',
      view: 'remediation',
      params: { search: r.vendorName },
      time: `${r.agingDays}d open`,
    });
  }

  // 3. Critical open risk events
  for (const ev of OPEN_EVENTS) {
    if (ev.severity !== 'Critical') continue;
    out.push({
      id: `risk-${ev.id}`,
      title: ev.title,
      body: `${ev.vendorName} · ${ev.detectedDate}`,
      severity: 'critical',
      view: 'risk-events',
      params: { search: ev.vendorName },
      time: ev.detectedDate,
    });
  }

  // 4. Vendors with missing evidence
  for (const v of getVendors()) {
    if (v.evidenceStatus !== 'Missing') continue;
    out.push({
      id: `ev-${v.id}`,
      title: `Missing evidence: ${v.name}`,
      body: `No verified audit artifacts on file`,
      severity: 'high',
      view: 'vendors',
      params: { vendorName: v.name, evidenceStatus: 'Missing' },
      time: 'now',
    });
  }

  return out;
}

const READ_KEY = 'vx-read-notifications';

export function getReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable — read state just won't persist
  }
}

export function markNotificationRead(id: string): string[] {
  const next = Array.from(new Set([...getReadIds(), id]));
  saveReadIds(next);
  return next;
}

export function markAllNotificationsRead(ids: string[]): string[] {
  const next = Array.from(new Set([...getReadIds(), ...ids]));
  saveReadIds(next);
  return next;
}
