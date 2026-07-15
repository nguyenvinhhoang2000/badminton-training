"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseEnabled, USER_STATE_TABLE } from "@/lib/supabase";
import type { HistoryMap } from "@/data/history";

type Completed = Record<string, boolean>;
export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface Args {
  completed: Completed;
  history: HistoryMap;
  loaded: boolean;
  setCompleted: (v: Completed) => void;
  setHistory: (v: HistoryMap) => void;
}

/**
 * Two-way sync of progress + history with Supabase.
 *
 * - On sign-in: pulls the remote row, merges it with whatever is in
 *   localStorage (local wins on key conflicts so fresh offline edits survive),
 *   writes the merged state back up, and hydrates local state.
 * - While signed in: debounced write-through on every local change.
 * - When Supabase isn't configured, everything is a no-op and the app keeps
 *   working from localStorage alone.
 */
export function useCloudSync({
  completed,
  history,
  loaded,
  setCompleted,
  setHistory,
}: Args) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>("idle");

  // latest local state, for the debounced pusher to read without re-subscribing
  const completedRef = useRef(completed);
  const historyRef = useRef(history);
  completedRef.current = completed;
  historyRef.current = history;

  // which user id we've already hydrated, to run the merge only once per login
  const hydratedFor = useRef<string | null>(null);

  // track auth session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // pull + merge on sign-in
  useEffect(() => {
    if (!supabase || !loaded) return;
    const uid = session?.user?.id ?? null;
    if (!uid) {
      hydratedFor.current = null;
      return;
    }
    if (hydratedFor.current === uid) return;
    hydratedFor.current = uid;

    (async () => {
      setStatus("syncing");
      const { data, error } = await supabase
        .from(USER_STATE_TABLE)
        .select("progress, history")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) {
        setStatus("error");
        return;
      }

      const mergedProgress: Completed = {
        ...(data?.progress ?? {}),
        ...completedRef.current,
      };
      const mergedHistory: HistoryMap = {
        ...(data?.history ?? {}),
        ...historyRef.current,
      };

      setCompleted(mergedProgress);
      setHistory(mergedHistory);

      const { error: upErr } = await supabase.from(USER_STATE_TABLE).upsert({
        user_id: uid,
        progress: mergedProgress,
        history: mergedHistory,
        updated_at: new Date().toISOString(),
      });
      setStatus(upErr ? "error" : "synced");
    })();
  }, [session, loaded, setCompleted, setHistory]);

  // debounced write-through on local changes
  useEffect(() => {
    if (!supabase || !loaded) return;
    const uid = session?.user?.id;
    if (!uid || hydratedFor.current !== uid) return;

    setStatus("syncing");
    const t = setTimeout(() => {
      supabase!
        .from(USER_STATE_TABLE)
        .upsert({
          user_id: uid,
          progress: completed,
          history,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => setStatus(error ? "error" : "synced"));
    }, 800);
    return () => clearTimeout(t);
  }, [completed, history, session, loaded]);

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: "Supabase chưa được cấu hình." };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    hydratedFor.current = null;
  }, []);

  return {
    enabled: isSupabaseEnabled,
    session,
    user: session?.user ?? null,
    status,
    signInWithEmail,
    signOut,
  };
}
