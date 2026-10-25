// src/shared/ui/Dialog.tsx
// Shared accessible dialog: focus trap, Escape to close, focus return, backdrop click.
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Max width class. Defaults to max-w-lg. */
  maxWidth?: string;
  /** If true, backdrop click does NOT close (for critical flows). Defaults to false. */
  disableBackdropClose?: boolean;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, maxWidth = 'max-w-lg', disableBackdropClose = false }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  // onClose identity changes on every parent render (inline arrow props) — keep it
  // in a ref so the focus effect below only runs when `open` actually changes.
  // Without this, typing in any input re-ran the effect and yanked focus back
  // to the first element after every keystroke.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    // Save the element that had focus so we can return to it
    previousFocus.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (!panel) return;

    // Focus the first focusable element, or the panel itself (once per open)
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusables[0];
    if (first) {
      first.focus();
    } else {
      panel.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap: keep Tab cycling within the dialog
      const elements = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        el => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
      if (elements.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    // Prevent background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = originalOverflow;
      // Return focus to the element that opened the dialog
      previousFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={disableBackdropClose ? undefined : onClose}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} rounded-xl border border-border bg-surface shadow-xl outline-none`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
