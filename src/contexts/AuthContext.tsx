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
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  status: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("user_profiles").select("status").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);
    setStatus((profileRes.data?.status as AccountStatus) ?? null);
    setRole((roleRes.data?.role as AppRole) ?? null);
  };

  useEffect(() => {
    // Set up listener BEFORE calling getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        await fetchUserData(sess.user.id);
      } else {
        setStatus(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchUserData(sess.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, status, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
