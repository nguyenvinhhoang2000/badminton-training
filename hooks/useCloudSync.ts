"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseEnabled, USER_STATE_TABLE } from "@/lib/supabase";
import type { HistoryMap } from "@/data/history";
import type { Exercise } from "@/data/workouts";

type Completed = Record<string, boolean>;
type CustomMap = Record<string, Exercise[]>;
export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface Args {
  completed: Completed;
  history: HistoryMap;
  custom: CustomMap;
  loaded: boolean;
  setCompleted: (v: Completed) => void;
  setHistory: (v: HistoryMap) => void;
  setCustom: (v: CustomMap) => void;
}

/**
 * Two-way sync of progress + history + custom exercises with Supabase.
 *
 * - On sign-in: pulls the remote row, merges it with whatever is in
 *   localStorage (local wins on key conflicts so fresh offline edits survive),
 *   writes the merged state back up, and hydrates local state.
 * - While signed in: debounced write-through on every local change.
 * - When Supabase isn't configured, everything is a no-op and the app keeps
 *   working from localStorage alone.
 * - If the `custom` column is missing (DB not migrated), it degrades gracefully:
 *   progress + history still sync, custom stays local-only.
 */
export function useCloudSync({
  completed,
  history,
  custom,
  loaded,
  setCompleted,
  setHistory,
  setCustom,
}: Args) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>("idle");

  // latest local state, for the debounced pusher to read without re-subscribing
  const completedRef = useRef(completed);
  const historyRef = useRef(history);
  const customRef = useRef(custom);
  completedRef.current = completed;
  historyRef.current = history;
  customRef.current = custom;

  // which user id we've already hydrated, to run the merge only once per login
  const hydratedFor = useRef<string | null>(null);
  // set once we detect the DB lacks the `custom` column, to stop retrying it
  const customUnsupported = useRef(false);

  // build the row to upsert, omitting `custom` when the column isn't available
  const buildRow = useCallback(
    (uid: string, p: Completed, h: HistoryMap, c: CustomMap) => {
      const row: Record<string, unknown> = {
        user_id: uid,
        progress: p,
        history: h,
        updated_at: new Date().toISOString(),
      };
      if (!customUnsupported.current) row.custom = c;
      return row;
    },
    []
  );

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

      // try selecting custom too; fall back if the column doesn't exist
      let res = await supabase
        .from(USER_STATE_TABLE)
        .select("progress, history, custom")
        .eq("user_id", uid)
        .maybeSingle();
      if (res.error && /custom/i.test(res.error.message)) {
        customUnsupported.current = true;
        res = await supabase
          .from(USER_STATE_TABLE)
          .select("progress, history")
          .eq("user_id", uid)
          .maybeSingle();
      }
      if (res.error) {
        setStatus("error");
        return;
      }

      const data = res.data as
        | { progress?: Completed; history?: HistoryMap; custom?: CustomMap }
        | null;

      const mergedProgress: Completed = {
        ...(data?.progress ?? {}),
        ...completedRef.current,
      };
      const mergedHistory: HistoryMap = {
        ...(data?.history ?? {}),
        ...historyRef.current,
      };
      const mergedCustom: CustomMap = {
        ...(data?.custom ?? {}),
        ...customRef.current,
      };

      setCompleted(mergedProgress);
      setHistory(mergedHistory);
      setCustom(mergedCustom);

      const { error: upErr } = await supabase
        .from(USER_STATE_TABLE)
        .upsert(buildRow(uid, mergedProgress, mergedHistory, mergedCustom));
      setStatus(upErr ? "error" : "synced");
    })();
  }, [session, loaded, setCompleted, setHistory, setCustom, buildRow]);

  // debounced write-through on local changes
  useEffect(() => {
    if (!supabase || !loaded) return;
    const uid = session?.user?.id;
    if (!uid || hydratedFor.current !== uid) return;

    setStatus("syncing");
    const t = setTimeout(() => {
      supabase!
        .from(USER_STATE_TABLE)
        .upsert(buildRow(uid, completed, history, custom))
        .then(({ error }) => setStatus(error ? "error" : "synced"));
    }, 800);
    return () => clearTimeout(t);
  }, [completed, history, custom, session, loaded, buildRow]);

  // Map common Supabase auth errors to Vietnamese.
  function viError(msg?: string | null): string | null {
    if (!msg) return null;
    if (/invalid login credentials/i.test(msg))
      return "Email hoặc mật khẩu không đúng.";
    if (/user already registered/i.test(msg))
      return "Email này đã có tài khoản — hãy đăng nhập.";
    if (/password should be at least/i.test(msg))
      return "Mật khẩu tối thiểu 6 ký tự.";
    return msg;
  }

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase chưa được cấu hình." };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: viError(error?.message) };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase)
      return { error: "Supabase chưa được cấu hình.", needsConfirm: false };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: viError(error.message), needsConfirm: false };
    // If "Confirm email" is on in Supabase, no session is returned yet.
    return { error: null, needsConfirm: !data.session };
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
    signIn,
    signUp,
    signOut,
  };
}
