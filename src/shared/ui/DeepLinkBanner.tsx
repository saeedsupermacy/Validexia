// src/shared/ui/DeepLinkBanner.tsx
import { Crosshair, X, ArrowLeft } from 'lucide-react';

interface DeepLinkBannerProps {
  /** Human-readable description of the applied filter, e.g. "Evidence status = Stale" */
  label: string;
  /** Where the user came from, e.g. "Command Center" */
  source?: string;
  /** Result count, e.g. 3 */
  count?: number;
  /** Optional contextual back action, e.g. backLabel="Back to CloudScale". Shown before Clear. */
  backLabel?: string;
  onBack?: () => void;
  onClear: () => void;
}

/**
 * Consistent blue banner shown when a tab was opened via deep-link with a
 * filter/search pre-applied. Makes it obvious WHY the list looks filtered
 * and offers a one-click reset. Optionally offers a contextual "back"
 * action (e.g. return to the vendor you came from).
 */
export function DeepLinkBanner({ label, source = 'another tab', count, backLabel, onBack, onClear }: DeepLinkBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 mb-4 rounded-lg bg-info/10 border border-info/30"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Crosshair aria-hidden="true" size={15} strokeWidth={2} className="text-info shrink-0" />
        <p className="text-sm text-text-primary m-0 truncate">
          <strong className="font-semibold">Deep link:</strong> {label}
          {typeof count === 'number' && <span className="text-text-secondary"> · {count} result{count === 1 ? '' : 's'}</span>}
          <span className="text-text-tertiary"> · from {source}</span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {backLabel && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-info hover:text-info/80 hover:underline focus:outline-none focus:ring-2 focus:ring-info rounded px-1.5 py-0.5"
          >
            <ArrowLeft aria-hidden="true" size={13} strokeWidth={2.5} />
            {backLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-info hover:text-info/80 hover:underline focus:outline-none focus:ring-2 focus:ring-info rounded px-1.5 py-0.5"
        >
          <X aria-hidden="true" size={13} strokeWidth={2.5} />
          Clear
        </button>
      </div>
    </div>
  );
}
