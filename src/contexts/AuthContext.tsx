import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AccountStatus = "pending" | "active" | "suspended" | "rejected";
type AppRole = "super_admin" | "admin" | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  status: AccountStatus | null;
  role: AppRole;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  status: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("user_profiles").select("status").eq("id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);
      setStatus((profileRes.data?.status as AccountStatus) ?? null);
      setRole((roleRes.data?.role as AppRole) ?? null);
    } catch {
      setStatus(null);
      setRole(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // ── Ongoing auth state changes (does NOT control isLoading) ──────────
    // IMPORTANT: Never await Supabase calls directly inside onAuthStateChange
    // as it causes deadlocks during token refresh. Use setTimeout to defer.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        if (!isMounted) return;
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          // Defer to avoid deadlock inside Supabase's internal lock
          setTimeout(() => {
            if (isMounted) fetchUserData(sess.user.id);
          }, 0);
        } else {
          setStatus(null);
          setRole(null);
        }
      }
    );

    // ── Initial load (controls isLoading) ────────────────────────────────
    const initializeAuth = async () => {
      try {
        const { data: { session: sess } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          // Await role/status fetch BEFORE releasing loading state
          await fetchUserData(sess.user.id);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, status, role, isLoading, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
