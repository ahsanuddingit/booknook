/**
 * The BookNook Express API origin. Requests go through this app's same-origin
 * proxy (`/api/proxy/[...path]`), which attaches the BetterAuth JWT server-side;
 * this value remains only as the public API address shown in error messages.
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  image?: string;
  totalCopies?: number;
  availableCopies?: number;
  createdAt?: string;
  userEmail?: string;
  userName?: string;
};

const TOKEN_KEYS = [
  "booknook:token",
  "booknook:jwt",
  "better-auth-token",
  "auth_token",
] as const;

/**
 * The Express server expects a BetterAuth JWT as a Bearer token.
 * Store one under `booknook:token` (or another supported key) after login.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_KEYS) {
    try {
      const token =
        window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
      if (token) return token;
    } catch {
      // Storage can be unavailable in private mode.
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* JWT access token for the Express API. The BetterAuth session cookie */
/* is same-origin, so we can silently read a short-lived JWT from      */
/* /api/auth/token and cache it until just before it expires.          */
/* ------------------------------------------------------------------ */

type CacheEntry = { token: string; expiresAt: number };

let cachedJwt: CacheEntry | null = null;
let inflightJwt: Promise<string | null> | null = null;

function decodeJwtExpiry(token: string): number | null {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(base64)) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function requestJwt(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch("/api/auth/token", { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { token?: string };
    const token = payload.token;
    if (!token) return null;

    const expMs = decodeJwtExpiry(token);
    const expiresAt = expMs ?? Date.now() + 10 * 60 * 1000;
    // Keep the token until shortly before it expires.
    if (expiresAt > Date.now() + 30_000) {
      cachedJwt = { token, expiresAt: expiresAt - 30_000 };
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Best-effort Bearer token for the Express API. Returns the cached JWT while
 * it is fresh, otherwise fetches a new one from the same-origin BetterAuth
 * `/api/auth/token` endpoint (requires a logged-in session cookie).
 */
export async function getJwtToken(): Promise<string | null> {
  if (cachedJwt && Date.now() < cachedJwt.expiresAt) return cachedJwt.token;
  if (!inflightJwt) {
    inflightJwt = requestJwt().finally(() => {
      inflightJwt = null;
    });
  }
  return inflightJwt;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ErrorPayload = { message?: string };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Same-origin proxy: the JWT for the Express `verifyToken` middleware is
  // attached server-side (see src/lib/api-server.ts), so no Bearer header
  // and no credentials handling are needed in the browser.
  const response = await fetch(`/api/proxy${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as
    | T
    | ErrorPayload
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : undefined;
    throw new ApiError(
      message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return payload as T;
}
