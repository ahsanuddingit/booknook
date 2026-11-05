"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon, InfoIcon, XIcon } from "lucide-react";
import { cn } from "cn";

import {
  dismissToast,
  subscribeToToasts,
  type ToastItem,
} from "@/lib/toast";

/**
 * App-wide toaster. Any client code can call `showToast.success(...)` /
 * `showToast.error(...)` and it renders here. Mounted once in the root layout.
 */
export function AppToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_-18px_rgba(47,44,61,0.55)]",
            toast.variant === "success" ? "bg-emerald-600" : "bg-rose-600"
          )}
        >
          {toast.variant === "success" ? (
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
          )}
          <p className="flex-1 leading-5">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="rounded-full p-1 opacity-70 transition hover:opacity-100"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
