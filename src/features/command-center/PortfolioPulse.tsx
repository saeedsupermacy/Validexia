// src/features/command-center/PortfolioPulse.tsx
import { HeartPulse, UserCheck, Zap } from 'lucide-react';
import { getVendors } from '../../data/vendors';
import { navigateTo } from '../../shared/navigation';
import { CountUp } from '../../shared/ui/core';

const RISK_PENALTY: Record<string, number> = { Critical: 12, High: 7, Moderate: 3, Low: 0 };
const TIER_WEIGHT: Record<string, number> = { 'Tier 1': 1.5, 'Tier 2': 1, 'Tier 3': 0.5 };

/**
 * Portfolio health: 100 minus per-vendor risk penalties (tier-weighted),
 * plus a kicker for missing evidence. Transparent and recomputed from the
 * shared vendor list — never hardcoded.
 */
export function portfolioHealthScore(): number {
  const penalty = getVendors().reduce((sum, v) => {
    const base = (RISK_PENALTY[v.riskLevel] ?? 0) * (TIER_WEIGHT[v.criticality] ?? 1);
    const evidenceKicker = v.evidenceStatus === 'Missing' ? 5 : 0;
    return sum + base + evidenceKicker;
  }, 0);
  return Math.max(0, Math.round(100 - penalty));
}

/** Vendors that need a human right now: high/critical risk or missing evidence. */
export function vendorsNeedingAttention(): number {
  return getVendors().filter(
    v => v.riskLevel === 'High' || v.riskLevel === 'Critical' || v.evidenceStatus === 'Missing'
  ).length;
}

function healthBand(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Healthy', className: 'text-status-success' };
  if (score >= 50) return { label: 'Watch', className: 'text-status-warning' };
  return { label: 'At Risk', className: 'text-risk-critical' };
}

export function PortfolioPulse({ changed24h, breachedCount }: { changed24h: number; breachedCount: number }) {
  const score = portfolioHealthScore();
  const band = healthBand(score);
  const needsYou = vendorsNeedingAttention();

  const scrollToChanges = () => {
    document.getElementById('material-changes-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5 rounded-xl border border-border-subtle bg-surface shadow-sm"
      role="region"
      aria-label="Portfolio pulse summary"
    >
      <button
        type="button"
        onClick={() => navigateTo('vendors')}
        className="flex items-center gap-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-info px-1 -ml-1"
        aria-label={`Portfolio health score ${score} out of 100, rated ${band.label}. View vendors.`}
        title="Portfolio health starts at 100. Risky vendors lower it — critical ones the most, and Tier 1 vendors count extra. Missing evidence lowers it too. Higher is healthier."
      >
        <span className="w-9 h-9 rounded-full bg-risk-critical/10 flex items-center justify-center shrink-0">
          <HeartPulse size={17} strokeWidth={1.75} className={band.className} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-bold tabular-nums tracking-tight text-text-primary leading-none">
            <CountUp value={score} /><span className="text-xs font-semibold text-text-tertiary">/100</span>
          </span>
          <span className={`block text-[11px] font-semibold mt-1 ${band.className}`}>{band.label} · Portfolio health</span>
        </span>
      </button>

      <span aria-hidden="true" className="hidden sm:block w-px h-9 bg-border-subtle" />

      <button
        type="button"
        onClick={() => navigateTo('vendors', { needsAttention: 'true', from: 'Command Center' })}
        className="flex items-center gap-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-info px-1 -ml-1"
        aria-label={`${needsYou} of ${getVendors().length} vendors need your attention. View vendors that need attention.`}
        title="Vendors with high or critical risk, or missing evidence. Click to see exactly these vendors."
      >
        <span className="w-9 h-9 rounded-full bg-status-warning/10 flex items-center justify-center shrink-0">
          <UserCheck size={17} strokeWidth={1.75} className="text-status-warning" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-bold tabular-nums tracking-tight text-text-primary leading-none">
            <CountUp value={needsYou} /><span className="text-xs font-semibold text-text-tertiary">/{getVendors().length}</span>
          </span>
          <span className="block text-[11px] font-medium text-text-secondary mt-1">vendors need you now</span>
        </span>
      </button>

      <span aria-hidden="true" className="hidden sm:block w-px h-9 bg-border-subtle" />

      <button
        type="button"
        onClick={scrollToChanges}
        className="flex items-center gap-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-info px-1 -ml-1"
        aria-label={`${changed24h} material changes in the last 24 hours. Scroll to feed.`}
        title="Anything important that changed in the last 24 hours — risk scores, evidence, remediations, contracts. Click to jump to the feed below."
      >
        <span className="w-9 h-9 rounded-full bg-status-info/10 flex items-center justify-center shrink-0">
          <Zap size={17} strokeWidth={1.75} className="text-status-info" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-bold tabular-nums tracking-tight text-text-primary leading-none">
            <CountUp value={changed24h} />
          </span>
          <span className="block text-[11px] font-medium text-text-secondary mt-1">material changes in 24h</span>
        </span>
      </button>

      <span aria-hidden="true" className="hidden sm:block w-px h-9 bg-border-subtle" />

      <button
        type="button"
        onClick={() => navigateTo('remediation')}
        className="flex items-center gap-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-info px-1 -ml-1"
        aria-label={`${breachedCount} SLA-breached remediations. View remediation.`}
        title="Remediation items that missed their fix deadline. Click to open the remediation queue."
      >
        <span className="w-9 h-9 rounded-full bg-risk-critical/10 flex items-center justify-center shrink-0">
          <HeartPulse size={17} strokeWidth={1.75} className="text-risk-critical" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-bold tabular-nums tracking-tight text-text-primary leading-none">
            <CountUp value={breachedCount} />
          </span>
          <span className="block text-[11px] font-medium text-text-secondary mt-1">SLA breached</span>
        </span>
      </button>
    </div>
  );
}
