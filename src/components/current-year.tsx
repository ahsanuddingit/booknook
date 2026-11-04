"use client";

import { useSyncExternalStore } from "react";

const FALLBACK_YEAR = 2026;
const noopSubscribe = () => () => {};

/**
 * The year is read only on the client so prerendering never touches the clock.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => FALLBACK_YEAR
  );

  return <>{year}</>;
}
