// src/features/command-center/PortfolioRiskCard.tsx
import { ShieldQuestion, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CountUp} from '../../shared/ui/core';
import { navigateTo } from '../../shared/navigation';
import { buildPortfolioMatrix, portfolioHeadline } from '../../data/vendors';
import type { PortfolioCell } from '../../data/vendors';

function RiskMatrixCell({ data }: { data: PortfolioCell }) {
 const bgColors: Record<string, string> = {
 Critical: 'bg-risk-critical/15 hover:bg-risk-critical/20 border-risk-critical/25 text-risk-critical',
 High: 'bg-risk-high/15 hover:bg-risk-high/20 border-risk-high/25 text-risk-high',
 Moderate: 'bg-status-warning/15 hover:bg-status-warning/20 border-status-warning/25 text-status-warning',
 Low: 'bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] border-border-subtle text-text-primary'
 };

 const riskLabel = data.risk;

 return (
 <button 
 type="button"
 className={`relative group flex flex-col items-center justify-center p-3 border rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info w-full h-full min-h-[72px] shadow-sm ${bgColors[data.risk]}`}
 onClick={() => navigateTo('vendors', { riskLevels: data.risk, criticalities: data.tier })}
 aria-label={`${data.count} vendors in ${data.tier} with ${riskLabel} risk. ${data.unverified} unverified. View filtered.`}
 >
 <span className="text-xl font-bold tabular-nums tracking-tight">{data.count}</span>
 
 <div className="flex gap-2 mt-1 opacity-90" aria-hidden="true">
 {data.unverified > 0 && (
 <div className="flex items-center gap-0.5 text-[10px] text-risk-high font-semibold">
 <ShieldQuestion aria-hidden="true" size={11} strokeWidth={2.5} />
 <span>{data.unverified}</span>
 </div>
 )}
 </div>

 <div className="absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-surface border border-border-strong rounded-lg shadow-xl p-3 text-left cursor-default pointer-events-none animate-in fade-in duration-150">
 <p className="text-xs font-bold text-text-primary mb-2 border-b border-border pb-1.5">{data.tier} / {riskLabel} Risk</p>
 <div className="text-[11px] text-text-secondary space-y-1.5">
 <div className="flex justify-between"><span>Total Vendors:</span> <span className="font-semibold text-text-primary tabular-nums">{data.count}</span></div>
 <div className="flex justify-between"><span>Unverified Evidence:</span> <span className="font-semibold text-risk-high tabular-nums">{data.unverified}</span></div>
 
 </div>
 </div>
 </button>
 );
}

export function PortfolioRiskCard() {
 const matrix = buildPortfolioMatrix();
 const headline = portfolioHeadline();
 const cell = (tier: string, risk: string) => matrix.find(c => c.tier === tier && c.risk === risk)!;
 const TIERS = ['Tier 1', 'Tier 2', 'Tier 3'] as const;
 return (
 <Card className="flex flex-col shadow-sm" style={{ overflow: 'visible' }}>
 <CardHeader className="border-b border-border px-6 py-4">
 <div>
 <CardTitle>Portfolio Exposure & Concentration</CardTitle>
 <p className="text-xs text-text-secondary mt-1 flex items-start gap-1.5 leading-relaxed">
 <Info aria-hidden="true" size={14} className="text-info shrink-0 mt-0.5" />
 <span>
 <strong className="text-text-primary font-semibold"><CountUp value={headline.tier1HighCritical} /> Tier-1 vendors</strong> exhibit High or Critical security risk, and <strong className="text-text-primary font-semibold"><CountUp value={headline.unverified} /></strong> lack verified evidence confidence.
 </span>
 </p>
 </div>
 </CardHeader>
 
 <CardContent className="p-6 flex flex-col space-y-6">
 
 <table className="sr-only">
 <caption>Portfolio Risk Distribution by Business Impact and Security Risk</caption>
 <thead>
 <tr>
 <th scope="col">Business Impact</th>
 <th scope="col">Low Risk</th>
 <th scope="col">Moderate Risk</th>
 <th scope="col">High Risk</th>
 <th scope="col">Critical Risk</th>
 </tr>
 </thead>
 <tbody>
 {TIERS.map(tier => (
 <tr key={tier}>
 <td>{tier}</td>
 {(['Low', 'Moderate', 'High', 'Critical'] as const).map(risk => {
 const c = cell(tier, risk);
 return <td key={risk}>{c.count} vendors ({c.unverified} unverified)</td>;
 })}
 </tr>
 ))}
 </tbody>
 </table>

 <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-2.5 items-center" aria-hidden="true">
 <div></div>
 <div className="text-center text-[10px] uppercase font-bold tracking-wider text-text-tertiary pb-1">Low</div>
 <div className="text-center text-[10px] uppercase font-bold tracking-wider text-text-tertiary pb-1">Moderate</div>
 <div className="text-center text-[10px] uppercase font-bold tracking-wider text-text-tertiary pb-1">High</div>
 <div className="text-center text-[10px] uppercase font-bold tracking-wider text-risk-critical pb-1">Critical</div>
 
 <div className="text-right pr-3 text-xs font-bold text-text-primary">Tier 1<span className="block text-[10px] font-normal text-text-tertiary mt-0.5">Critical</span></div>
 <RiskMatrixCell data={cell('Tier 1', 'Low')} />
 <RiskMatrixCell data={cell('Tier 1', 'Moderate')} />
 <RiskMatrixCell data={cell('Tier 1', 'High')} />
 <RiskMatrixCell data={cell('Tier 1', 'Critical')} />

 <div className="text-right pr-3 text-xs font-bold text-text-primary">Tier 2<span className="block text-[10px] font-normal text-text-tertiary mt-0.5">Important</span></div>
 <RiskMatrixCell data={cell('Tier 2', 'Low')} />
 <RiskMatrixCell data={cell('Tier 2', 'Moderate')} />
 <RiskMatrixCell data={cell('Tier 2', 'High')} />
 <RiskMatrixCell data={cell('Tier 2', 'Critical')} />

 <div className="text-right pr-3 text-xs font-bold text-text-primary">Tier 3<span className="block text-[10px] font-normal text-text-tertiary mt-0.5">Standard</span></div>
 <RiskMatrixCell data={cell('Tier 3', 'Low')} />
 <RiskMatrixCell data={cell('Tier 3', 'Moderate')} />
 <RiskMatrixCell data={cell('Tier 3', 'High')} />
 <RiskMatrixCell data={cell('Tier 3', 'Critical')} />
 </div>

 <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
 <div className="flex items-center gap-1.5">
 <ShieldQuestion aria-hidden="true" size={13} strokeWidth={2.5} className="text-risk-high" />
 <span>Unverified Evidence (Low Confidence)</span>
 </div>

 </div>
 
 </CardContent>
 </Card>
 );
}