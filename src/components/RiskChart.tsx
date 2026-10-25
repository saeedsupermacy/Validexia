// src/components/RiskChart.tsx
import ReactECharts from 'echarts-for-react';
import { useIsDark } from '../shared/hooks/useIsDark';

export function RiskChart() {
 const isDark = useIsDark();

 // Neutral chart infrastructure + semantic accents; no saturated rainbow palette.
 const t = isDark
 ? {
 tooltipBg: '#16171c',
 tooltipBorder: 'rgba(255,255,255,0.08)',
 tooltipText: '#f4f4f5',
 axisLine: 'rgba(255,255,255,0.08)',
 axisLabel: '#71717a',
 splitLine: 'rgba(255,255,255,0.05)',
 critical: '#f87171',
 criticalArea: ['rgba(248,113,113,0.16)', 'rgba(248,113,113,0)'],
 assessments: '#5e6ad2',
 }
 : {
 tooltipBg: '#ffffff',
 tooltipBorder: '#e0e5eb',
 tooltipText: '#101828',
 axisLine: '#e0e5eb',
 axisLabel: '#98a2b3',
 splitLine: '#eceff3',
 critical: '#d92d20',
 criticalArea: ['rgba(217,45,32,0.12)', 'rgba(217,45,32,0)'],
 assessments: '#4f58c4',
 };

 const options = {
 tooltip: {
 trigger: 'axis',
 backgroundColor: t.tooltipBg,
 borderColor: t.tooltipBorder,
 textStyle: { color: t.tooltipText, fontFamily: 'Inter' }
 },
 grid: { left: '2%', right: '4%', bottom: '0%', top: '10%', containLabel: true },
 xAxis: {
 type: 'category',
 boundaryGap: false,
 data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
 axisLine: { lineStyle: { color: t.axisLine } },
 axisTick: { show: false },
 axisLabel: { color: t.axisLabel, fontFamily: 'Inter' }
 },
 yAxis: {
 type: 'value',
 splitLine: { lineStyle: { color: t.splitLine, type: 'dashed' } },
 axisLabel: { color: t.axisLabel, fontFamily: 'Inter' }
 },
 series: [
 {
 name: 'Critical Issues',
 type: 'line',
 smooth: true,
 showSymbol: false,
 lineStyle: { width: 2, color: t.critical },
 areaStyle: {
 color: {
 type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
 colorStops: [
 { offset: 0, color: t.criticalArea[0] },
 { offset: 1, color: t.criticalArea[1] }
 ]
 }
 },
 data: [4, 7, 5, 4, 2, 3]
 },
 {
 name: 'Total Assessments',
 type: 'line',
 smooth: true,
 showSymbol: false,
 lineStyle: { width: 2, color: t.assessments },
 data: [12, 18, 24, 22, 28, 35]
 }
 ]
 };

 return (
 <div 
 role="figure" 
 aria-label="Line chart showing risk trends over 6 months: Critical issues fluctuating between 2 and 7, while total assessments steadily rise from 12 to 35."
 className="h-full w-full relative"
 >
 <div className="sr-only" aria-hidden="false">
 <table>
 <caption>Risk trend data from January to June</caption>
 <thead>
 <tr>
 <th scope="col">Month</th>
 <th scope="col">Critical Issues</th>
 <th scope="col">Total Assessments</th>
 </tr>
 </thead>
 <tbody>
 {options.xAxis.data.map((month, i) => (
 <tr key={month}>
 <td>{month}</td>
 <td>{options.series[0].data[i]}</td>
 <td>{options.series[1].data[i]}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <ReactECharts option={options} style={{ height: '100%', width: '100%' }} aria-hidden="true" />
 </div>
 );
}
