"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type AuthResponse } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  acceptAuth: (response: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("blogapp_token")) {
      api<User>("/auth/me").then(setUser).catch(() => {
        localStorage.removeItem("blogapp_token");
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    acceptAuth: (response) => {
      localStorage.setItem("blogapp_token", response.token);
      setUser(response.user);
    },
    setUser,
    logout: () => {
      localStorage.removeItem("blogapp_token");
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside Providers");
  return context;
}
