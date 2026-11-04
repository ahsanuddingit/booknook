"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

/**
 * Client-side gate for the private routes. The navbar hides private links,
 * and this keeps someone from opening the URLs directly while logged out.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="h-72 w-full animate-pulse rounded-3xl bg-muted"
        />
      </div>
    );
  }

  return children;
}
