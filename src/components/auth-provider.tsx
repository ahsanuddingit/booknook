"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import { authClient } from "@/lib/auth-client";

export type SessionUser = {
  name: string;
  email: string;
  avatar?: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  /** False until the server has told us whether a session cookie exists. */
  hydrated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Client-side session store backed by real Better Auth endpoints
 * (`/api/auth/*`), which persist users and sessions in MongoDB.
 * `login`, `register`, and `logout` return a human-readable error
 * message on failure so pages can render it inline.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const user = useMemo<SessionUser | null>(() => {
    const authUser = session?.user;
    if (!authUser) return null;
    return {
      name: authUser.name,
      email: authUser.email,
      avatar: authUser.image ?? undefined,
    };
  }, [session]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        return error.message || "Invalid email or password.";
      }
      return null;
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) {
        return error.message || "Unable to create an account. Please try again.";
      }
      return null;
    },
    []
  );

  const logout = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, hydrated: !isPending, login, register, logout }),
    [user, isPending, login, register, logout]
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
