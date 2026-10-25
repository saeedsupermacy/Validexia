// src/features/command-center/RiskEventsSummaryCard.tsx
import { AlertTriangle, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/core';
import { navigateTo } from '../../shared/navigation';

export interface RiskEventSummary {
  id: string;
  title: string;
  vendorName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detectedDate: string;
  context: string;
}

export const OPEN_EVENTS: RiskEventSummary[] = [
  { id: 'RE-2026-204', title: 'SMS Carrier Gateway Outage — MFA Bypass Risk', vendorName: 'Twilio Verify', severity: 'Critical', detectedDate: 'Oct 06, 2026', context: 'SMS delivery failing in the EU region — fall back to authenticator apps until the carrier recovers.' },
  { id: 'RE-2026-302', title: 'DPA Region Flag — Unauthorized EU Data Transfer', vendorName: 'Snowflake Data Cloud', severity: 'High', detectedDate: 'Oct 03, 2026', context: 'EU data observed replicating to a US-region bucket against the residency policy.' },
  { id: 'RE-2026-118', title: 'Edge Cipher Deprecation Warning (TLS 1.1)', vendorName: 'Fastly Global CDN', severity: 'Medium', detectedDate: 'Oct 05, 2026', context: 'Legacy endpoints still negotiate TLS 1.1 — upgrade to TLS 1.2+ before the deprecation deadline.' },
  { id: 'RE-2026-310', title: 'Dark Web Credential Exposure - Institutional Service Accounts', vendorName: 'Apex Gateway', severity: 'High', detectedDate: 'Oct 09, 2026', context: '3 institutional service accounts matching the vendor domain found in a credential dump.' },
];

const severityStyles: Record<string, string> = {
  Critical: 'bg-risk-critical/10 text-risk-critical border-risk-critical/25',
  High: 'bg-risk-high/10 text-risk-high border-risk-high/25',
  Medium: 'bg-status-warning/10 text-status-warning border-status-warning/25',
  Low: 'bg-status-info/10 text-status-info border-status-info/25',
};

const severityIcon: Record<string, React.ReactNode> = {
  Critical: <ShieldAlert aria-hidden="true" size={15} strokeWidth={2} className="text-risk-critical" />,
  High: <AlertTriangle aria-hidden="true" size={15} strokeWidth={2} className="text-risk-high" />,
  Medium: <AlertTriangle aria-hidden="true" size={15} strokeWidth={2} className="text-status-warning" />,
  Low: <AlertTriangle aria-hidden="true" size={15} strokeWidth={2} className="text-status-info" />,
};

export function RiskEventsSummaryCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" size={18} className="text-text-secondary" strokeWidth={1.75} />
            Active Risk Events
          </CardTitle>
          <span className="text-xs font-mono bg-base px-2.5 py-1 rounded border border-border">
            <span className="text-risk-critical font-bold">{OPEN_EVENTS.filter(e => e.severity === 'Critical').length} Critical</span>
            <span className="text-text-tertiary"> / {OPEN_EVENTS.length} Open</span>
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-1">Live threat signals requiring assessment.</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {OPEN_EVENTS.map(ev => (
            <button
              key={ev.id}
              type="button"
              onClick={() => navigateTo('risk-events', { search: ev.vendorName, from: 'Command Center' })}
              className="w-full text-left bg-surface border border-border rounded-xl p-4 shadow-sm hover:border-info/50 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-info group cursor-pointer"
              aria-label={`${ev.title}, ${ev.severity} severity. View this risk event.`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center shrink-0" aria-hidden="true">
                    {severityIcon[ev.severity]}
                  </span>
                  <span className="text-xs font-bold text-text-primary tracking-wide uppercase truncate">{ev.vendorName}</span>
                  <span className="text-text-tertiary text-xs" aria-hidden="true">•</span>
                  <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Risk Event</span>
                </div>
                <span className="text-xs font-mono text-text-tertiary tabular-nums bg-base px-2 py-0.5 rounded border border-border">{ev.detectedDate}</span>
              </div>
              <p className="text-sm font-semibold text-text-primary mb-2 leading-snug group-hover:text-info transition-colors">{ev.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed bg-base p-3 rounded-lg border border-border-subtle mb-3">
                <strong className="text-text-primary font-semibold">Context: </strong>
                {ev.context}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${severityStyles[ev.severity]}`}>{ev.severity}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-info" aria-hidden="true">
                  <span>Inspect Event</span>
                  <ArrowUpRight size={13} strokeWidth={2.25} />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="pt-3 flex justify-end">
          <button
            type="button"
            onClick={() => navigateTo('risk-events')}
            className="font-bold text-info hover:underline inline-flex items-center gap-1 text-xs focus:outline-none focus:ring-2 focus:ring-info rounded px-1"
          >
            <span>View all events</span>
            <ArrowUpRight aria-hidden="true" size={13} strokeWidth={2} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
