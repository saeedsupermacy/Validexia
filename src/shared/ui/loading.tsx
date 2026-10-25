// src/shared/ui/loading.tsx

interface SkeletonProps {
 className?: string;
}

export function SkeletonBox({ className = 'h-4 w-full' }: SkeletonProps) {
 return (
 <div aria-hidden="true" className={`bg-surface-hover/80 dark:bg-surface-hover/40 animate-pulse rounded-md ${className}`} />
 );
}

export interface TableSkeletonProps {
 rows?: number;
 cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
 return (
 <div role="status" aria-label="Loading table data" className="w-full animate-in fade-in duration-200">
 <div className="bg-surface-hover border-b border-border px-5 py-3.5 flex gap-4">
 {Array.from({ length: cols }).map((_, i) => (
 <SkeletonBox key={i} className="h-3.5 flex-1" />
 ))}
 </div>
 <div className="divide-y divide-border-subtle bg-surface">
 {Array.from({ length: rows }).map((_, rIdx) => (
 <div key={rIdx} className="px-5 py-4 flex items-center gap-4">
 {Array.from({ length: cols }).map((_, cIdx) => (
 <SkeletonBox key={cIdx} className={`h-4 ${cIdx === 0 ? 'w-1/3' : 'flex-1'}`} />
 ))}
 </div>
 ))}
 </div>
 </div>
 );
}

export interface CardGridSkeletonProps {
 count?: number;
}

export function CardGridSkeleton({ count = 3 }: CardGridSkeletonProps) {
 return (
 <div role="status" aria-label="Loading cards" className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
 {Array.from({ length: count }).map((_, i) => (
 <div key={i} className="p-5 rounded-xl border border-border bg-surface space-y-3">
 <SkeletonBox className="h-5 w-1/2" />
 <SkeletonBox className="h-8 w-3/4" />
 <SkeletonBox className="h-3 w-1/4" />
 </div>
 ))}
 </div>
 );
}

export interface ChartSkeletonProps {
 height?: string;
}

export function ChartSkeleton({ height = 'h-72' }: ChartSkeletonProps) {
 return (
 <div role="status" aria-label="Loading chart data" className={`p-6 rounded-xl border border-border bg-surface space-y-4 animate-in fade-in duration-200 ${height} flex flex-col justify-between`}>
 <div className="flex items-center justify-between">
 <SkeletonBox className="h-5 w-48" />
 <SkeletonBox className="h-4 w-24" />
 </div>
 <SkeletonBox className="flex-1 w-full rounded-lg" />
 </div>
 );
}

export function ProgressBanner() {
 return (
 <div role="status" aria-label="Loading progress" className="w-full bg-info/10 border border-info/30 p-4 rounded-xl flex items-center gap-3 animate-pulse">
 <div aria-hidden="true" className="w-5 h-5 rounded-full bg-info/40 shrink-0" />
 <div className="space-y-1.5 flex-1">
 <SkeletonBox className="h-3.5 w-1/3" />
 <SkeletonBox className="h-3 w-2/3" />
 </div>
 </div>
 );
}