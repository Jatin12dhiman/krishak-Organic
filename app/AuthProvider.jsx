"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as doLogin, logout as doLogout } from "@/lib/auth";
import { useToast } from "@/components/ui/ToastProvider.jsx";

const AuthContext = createContext({ user: null, loading: true, login: async () => {}, logout: async () => {}, refresh: async () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const { notify } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res?.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getMe();
        if (!active) return;
        setUser(res?.data || null);
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = useCallback(async ({params, email, password}) => {
    try {
      const res = await doLogin({ params, email, password });
      await refresh();
      notify({ variant: "success", message: res?.message || "Logged in" });
      console.log(res);
      return { success: true, ...res };
    } catch (e) {
      notify({ variant: "error", message: e?.message || "Login failed" });
      return { success: false, error: e?.message };
    }
  }, [notify, refresh]);

  const logout = useCallback(async () => {
    try {
      await doLogout();
      setUser(null);
      notify({ variant: "success", message: "Logged out" });
    } catch (e) {
      notify({ variant: "error", message: e?.message || "Logout failed" });
    }
  }, [notify]);

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading, login, logout, refresh]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


