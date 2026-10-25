// src/shared/ui/toast.ts
// Tiny app-wide toast notifications. No context/provider needed:
// any code can call showToast(), and the <Toaster/> mounted in App renders them.

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners = new Set<Listener>();
let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach(fn => fn([...toasts]));
}

export function subscribeToasts(fn: Listener): () => void {
  listeners.add(fn);
  fn([...toasts]);
  return () => { listeners.delete(fn); };
}

/** Show a toast. Auto-dismisses after `ms` (default 4.5s). */
export function showToast(message: string, kind: ToastKind = 'success', ms = 4500): number {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { id, message, kind }];
  emit();
  const t = setTimeout(() => dismissToast(id), ms);
  timers.set(id, t);
  return id;
}

export function dismissToast(id: number) {
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
  if (toasts.some(x => x.id === id)) {
    toasts = toasts.filter(x => x.id !== id);
    emit();
  }
}
