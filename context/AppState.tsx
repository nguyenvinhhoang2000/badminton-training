"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { days, type Day, type Exercise } from "@/data/workouts";
import { useCloudSync } from "@/hooks/useCloudSync";
import {
  HISTORY_KEY,
  computeStreak,
  toISO,
  type HistoryEntry,
  type HistoryMap,
} from "@/data/history";
import {
  CUSTOM_KEY,
  cloneExercises,
  defaultExercises,
  type CustomMap,
} from "@/data/customize";

export const STORE_KEY = "cau-long-progress-v1";
export const DEFAULT_REST = 60;

const jsDayToKey: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export function setKey(dayKey: string, exId: string, i: number) {
  return `${dayKey}:${exId}:${i}`;
}

function playEndSignal() {
  try {
    const Ctx =
      window.AudioContext || (window as unknown as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    /* audio not available */
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([200, 90, 200]);
  }
}

interface AppStateValue {
  mounted: boolean;
  today: string | null;
  todayISO: string | null;
  selected: string;
  setSelected: (key: string) => void;
  history: HistoryMap;
  loaded: boolean;
  cloud: ReturnType<typeof useCloudSync>;
  streak: number;
  progressOf: (d: Day) => number;
  doneSetsFor: (dayKey: string, exId: string, sets: number) => boolean[];
  toggleSet: (dayKey: string, exId: string, i: number, next: boolean) => void;
  resetDay: () => void;
  logToday: (dayKey: string, type: Day["type"], done: boolean) => void;
  // custom exercises
  exercisesOf: (dayKey: string) => Exercise[];
  isCustomized: (dayKey: string) => boolean;
  saveExercises: (dayKey: string, list: Exercise[]) => void;
  resetExercises: (dayKey: string) => void;
  // rest timer
  duration: number;
  remaining: number;
  running: boolean;
  startRest: (sec: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const [selected, setSelected] = useState<string>("wed");
  const [today, setToday] = useState<string | null>(null);
  const [todayISO, setTodayISO] = useState<string | null>(null);

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<HistoryMap>({});
  const [custom, setCustom] = useState<CustomMap>({});
  const [loaded, setLoaded] = useState(false);

  const cloud = useCloudSync({
    completed,
    history,
    custom,
    loaded,
    setCompleted,
    setHistory,
    setCustom,
  });

  // rest timer state
  const [duration, setDuration] = useState(DEFAULT_REST);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const endRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setToday(jsDayToKey[now.getDay()]);
    setSelected(jsDayToKey[now.getDay()]);
    setTodayISO(toISO(now));
  }, []);

  // load / save progress + history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
      const rawHist = localStorage.getItem(HISTORY_KEY);
      if (rawHist) setHistory(JSON.parse(rawHist));
      const rawCustom = localStorage.getItem(CUSTOM_KEY);
      if (rawCustom) setCustom(JSON.parse(rawCustom));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(completed));
    } catch {
      /* ignore */
    }
  }, [completed, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
    } catch {
      /* ignore */
    }
  }, [custom, loaded]);

  // countdown loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(
        0,
        Math.round(((endRef.current ?? 0) - Date.now()) / 1000)
      );
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        clearInterval(id);
        playEndSignal();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const startRest = useCallback((sec: number) => {
    setDuration(sec);
    setRemaining(sec);
    endRef.current = Date.now() + sec * 1000;
    setRunning(true);
  }, []);

  const toggleTimer = useCallback(() => {
    setRunning((r) => {
      if (r) return false;
      if (remaining > 0) {
        endRef.current = Date.now() + remaining * 1000;
        return true;
      }
      return false;
    });
  }, [remaining]);

  const resetTimer = useCallback(() => {
    setRunning(false);
    setRemaining(0);
  }, []);

  const doneSetsFor = useCallback(
    (dayKey: string, exId: string, sets: number) =>
      Array.from(
        { length: sets },
        (_, i) => !!completed[setKey(dayKey, exId, i)]
      ),
    [completed]
  );

  // Exercises for a day: user's custom list if present, else the defaults.
  const exercisesOf = useCallback(
    (dayKey: string): Exercise[] => custom[dayKey] ?? defaultExercises(dayKey),
    [custom]
  );

  const isCustomized = useCallback(
    (dayKey: string) => !!custom[dayKey],
    [custom]
  );

  const saveExercises = useCallback((dayKey: string, list: Exercise[]) => {
    setCustom((prev) => ({ ...prev, [dayKey]: list }));
  }, []);

  const resetExercises = useCallback((dayKey: string) => {
    setCustom((prev) => {
      if (!prev[dayKey]) return prev;
      const copy = { ...prev };
      delete copy[dayKey];
      return copy;
    });
  }, []);

  const progressOf = useCallback(
    (d: Day) => {
      if (d.type !== "training") return 0;
      const list = exercisesOf(d.key);
      let total = 0;
      let done = 0;
      for (const ex of list) {
        total += ex.sets;
        for (let i = 0; i < ex.sets; i++) {
          if (completed[setKey(d.key, ex.id, i)]) done++;
        }
      }
      return total ? done / total : 0;
    },
    [completed, exercisesOf]
  );

  const toggleSet = useCallback(
    (dayKey: string, exId: string, i: number, next: boolean) => {
      setCompleted((prev) => ({ ...prev, [setKey(dayKey, exId, i)]: next }));
    },
    []
  );

  const logToday = useCallback(
    (dayKey: string, type: Day["type"], done: boolean) => {
      if (!todayISO) return;
      setHistory((prev) => {
        if (!done) {
          if (!prev[todayISO]) return prev;
          const copy = { ...prev };
          delete copy[todayISO];
          return copy;
        }
        const entry: HistoryEntry = { dayKey, type, done: true };
        return { ...prev, [todayISO]: entry };
      });
    },
    [todayISO]
  );

  // Auto-log when today's session (any day that has exercises) reaches 100%.
  useEffect(() => {
    if (!loaded || !today || !todayISO) return;
    const d = days.find((x) => x.key === today);
    if (!d) return;
    // only exercise-based days auto-log; days with no exercises use the
    // manual "attended" button instead.
    if (exercisesOf(today).length === 0) return;
    const complete = progressOf(d) >= 1;
    setHistory((prev) => {
      const has = !!prev[todayISO]?.done;
      if (complete && !has) {
        return {
          ...prev,
          [todayISO]: { dayKey: today, type: d.type, done: true },
        };
      }
      // roll back the auto-log if the day drops back below 100%
      if (!complete && has) {
        const copy = { ...prev };
        delete copy[todayISO];
        return copy;
      }
      return prev;
    });
  }, [completed, loaded, today, todayISO, progressOf, exercisesOf]);

  const resetDay = useCallback(() => {
    setCompleted((prev) => {
      const copy = { ...prev };
      for (const k of Object.keys(copy)) {
        if (k.startsWith(`${selected}:`)) delete copy[k];
      }
      return copy;
    });
    resetTimer();
  }, [selected, resetTimer]);

  const streak =
    mounted && todayISO ? computeStreak(history, todayISO) : 0;

  const value: AppStateValue = {
    mounted,
    today,
    todayISO,
    selected,
    setSelected,
    history,
    loaded,
    cloud,
    streak,
    progressOf,
    doneSetsFor,
    toggleSet,
    resetDay,
    logToday,
    exercisesOf,
    isCustomized,
    saveExercises,
    resetExercises,
    duration,
    remaining,
    running,
    startRest,
    toggleTimer,
    resetTimer,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const v = useContext(AppStateContext);
  if (!v) {
    throw new Error("useAppState must be used within <AppStateProvider>");
  }
  return v;
}
