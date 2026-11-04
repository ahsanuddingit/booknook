"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type SessionUser = {
  name: string;
  email: string;
  avatar?: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  /** False until the stored session has been read on the client. */
  hydrated: boolean;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
};

const SESSION_KEY = "booknook:session";
const ACCOUNT_KEY = "booknook:account";

const AuthContext = createContext<AuthContextValue | null>(null);

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

function readRaw() {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** localStorage is the external store, so the session survives reloads. */
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

function getServerSnapshot() {
  return null;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function displayNameFromEmail(email: string) {
  const [handle] = email.split("@");
  return handle
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const noopSubscribe = () => () => {};

/**
 * Client-side session store used by the navbar.
 * It is intentionally dependency-free demo auth: swap the bodies of
 * `login` / `register` / `logout` for real API calls when a backend exists.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const persist = useCallback((next: SessionUser | null) => {
    try {
      if (next) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Storage can be unavailable in private mode; the session still works.
    }
    notify();
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      void password; // Demo auth: no password verification yet.
      let name = displayNameFromEmail(email);
      try {
        const raw = window.localStorage.getItem(ACCOUNT_KEY);
        const account = raw ? (JSON.parse(raw) as SessionUser) : null;
        if (account?.email === email) name = account.name;
      } catch {
        // Fall back to the generated name.
      }
      persist({ name, email, avatar: "/avatar-demo.svg" });
    },
    [persist]
  );

  const register = useCallback(
    (name: string, email: string, password: string) => {
      void password; // Demo auth: no password verification yet.
      const next = { name, email, avatar: "/avatar-demo.svg" };
      try {
        window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      } catch {
        // Storage can be unavailable in private mode; the session still works.
      }
      persist(next);
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({ user, hydrated, login, register, logout }),
    [user, hydrated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
