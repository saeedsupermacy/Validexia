// src/shared/ui/Toaster.tsx
// Renders toast notifications queued via showToast(). Mount once in App.
import { useEffect, useState } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { subscribeToasts, dismissToast, type Toast } from './toast';

const KIND_STYLES: Record<Toast['kind'], { icon: React.ReactNode; bar: string }> = {
  success: {
    icon: <CheckCircle2 size={17} className="text-status-success shrink-0" aria-hidden="true" />,
    bar: 'bg-status-success',
  },
  info: {
    icon: <Info size={17} className="text-info shrink-0" aria-hidden="true" />,
    bar: 'bg-info',
  },
  error: {
    icon: <AlertCircle size={17} className="text-risk-critical shrink-0" aria-hidden="true" />,
    bar: 'bg-risk-critical',
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center gap-2.5 pl-1 pr-2 py-1 bg-surface border border-border-strong rounded-xl shadow-xl max-w-sm animate-in slide-in-from-bottom-2 fade-in duration-200 overflow-hidden"
        >
          <span aria-hidden="true" className={`self-stretch w-1 rounded-full ${KIND_STYLES[t.kind].bar}`} />
          {KIND_STYLES[t.kind].icon}
          <p className="text-sm font-medium text-text-primary m-0 py-1.5">{t.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-info"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
