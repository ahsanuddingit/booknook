/**
 * Small client for the BookNook Express API.
 * The server defaults to port 8000; override it with NEXT_PUBLIC_API_URL.
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
  ownerEmail?: string;
  ownerName?: string;
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
  const token = getAuthToken();

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
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
