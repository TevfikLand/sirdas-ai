import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { UserSession } from "../types";

type AuthValue = { session: UserSession | null; loading: boolean; login(identifier: string, password: string): Promise<UserSession>; register(email: string, password: string): Promise<void>; logout(): Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<UserSession>("/auth/session").then(setSession).catch(() => setSession(null)).finally(() => setLoading(false));
  }, []);
  const login = useCallback(async (identifier: string, password: string) => { const value = await api<UserSession>("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }); setSession(value); return value; }, []);
  const register = useCallback(async (email: string, password: string) => { const value = await api<UserSession>("/auth/register", { method: "POST", body: JSON.stringify({ email, password, kvkkAccepted: true, kvkkVersion: "2026-01" }) }); setSession(value); }, []);
  const logout = useCallback(async () => { await api("/auth/logout", { method: "POST" }); setSession(null); }, []);
  const value = useMemo(() => ({ session, loading, login, register, logout }), [session, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("AuthProvider missing"); return value; }
