export type ToastVariant = "success" | "error";

export type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: Set<Listener> = new Set();
let nextId = 1;
const TOAST_DURATION = 4000;

function emit() {
  for (const listener of listeners) listener(toasts);
}

function push(message: string, variant: ToastVariant) {
  const toast: ToastItem = { id: nextId++, message, variant };
  toasts = [...toasts, toast];
  emit();
  setTimeout(() => dismissToast(toast.id), TOAST_DURATION);
}

export function dismissToast(id: number) {
  if (!toasts.some((toast) => toast.id === id)) return;
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export const showToast = {
  success: (message: string) => push(message, "success"),
  error: (message: string) => push(message, "error"),
};

export function subscribeToToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): ToastItem[] {
  return toasts;
}
