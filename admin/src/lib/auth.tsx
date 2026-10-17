"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "@/types/db";
import { demoProfile, demoSession } from "./demo";
import { isSupabaseConfigured, supabase } from "./supabase";

type AuthStatus = "loading" | "signedOut" | "inactive" | "ready";

interface AuthContextValue {
  status: AuthStatus;
  profile: Profile | null;
  /** Демо-режим: база не подключена. */
  isDemo: boolean;
  isOwner: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDemo = !isSupabaseConfigured;
  const [status, setStatus] = useState<AuthStatus>(isDemo ? "ready" : "loading");
  const [profile, setProfile] = useState<Profile | null>(isDemo ? demoProfile() : null);

  // Демо: при переключении роли обновляем профиль.
  useEffect(() => {
    if (!isDemo) return;
    const unsubscribe = demoSession.subscribe(() => setProfile(demoProfile()));
    return () => {
      unsubscribe();
    };
  }, [isDemo]);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!supabase || !userId) {
      setProfile(null);
      setStatus("signedOut");
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle<Profile>();
    setProfile(data ?? null);
    setStatus(data?.is_active ? "ready" : "inactive");
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session?.user.id));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Обновление токена не меняет пользователя — профиль перечитывать не нужно.
      if (event === "TOKEN_REFRESHED") return;
      // Supabase не рекомендует ждать запросов внутри обработчика — выполняем после него.
      setTimeout(() => loadProfile(session?.user.id), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (/invalid login credentials/i.test(error.message)) throw new Error("Неверная почта или пароль.");
      if (/fetch|network/i.test(error.message)) throw new Error("Нет связи с базой. Проверьте интернет и попробуйте ещё раз.");
      throw new Error(error.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    status,
    profile,
    isDemo,
    isOwner: status === "ready" && profile?.role === "owner",
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return value;
}
