import { days, type DayType, type Day } from "@/data/workouts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HistoryEntry {
  dayKey: string; // which weekday template (mon/tue/...)
  type: DayType; // snapshot of the day type when logged
  done: boolean; // session completed / attended
}

// map ISO date "YYYY-MM-DD" -> entry
export type HistoryMap = Record<string, HistoryEntry>;

export const HISTORY_KEY = "cau-long-history-v1";

// JS Date.getDay() (0=Sun) -> weekday template key
export const jsDayToKey: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

// ---------------------------------------------------------------------------
// Date helpers (all local time, no timezone drift)
// ---------------------------------------------------------------------------

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Monday-first week start for a given ISO date.
export function startOfWeekMonISO(iso: string): string {
  const d = fromISO(iso);
  const dow = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

export function dayForISO(iso: string): Day | undefined {
  return days.find((d) => d.key === jsDayToKey[fromISO(iso).getDay()]);
}

// Scheduled rest / active-recovery days are "free": they never break a streak
// and never need to be logged to keep one alive.
export function isFreeDay(iso: string): boolean {
  const t = dayForISO(iso)?.type;
  return t === "rest" || t === "rest-active";
}

// ---------------------------------------------------------------------------
// Streak & stats
// ---------------------------------------------------------------------------

/**
 * Current streak: consecutive *activity* days (training / badminton that were
 * marked done), counting backward from today. Free days (T2, T6) are
 * transparent — they neither add to nor break the streak. Today not being
 * done yet does not break the streak.
 *
 * Args:
 *   history: the logged sessions keyed by ISO date.
 *   todayISO: today's date as "YYYY-MM-DD".
 * Returns:
 *   Number of consecutive activity days.
 */
export function computeStreak(history: HistoryMap, todayISO: string): number {
  let cursor = todayISO;
  let count = 0;
  let first = true;
  for (let guard = 0; guard < 3650; guard++) {
    if (isFreeDay(cursor)) {
      cursor = addDays(cursor, -1);
      first = false;
      continue;
    }
    if (history[cursor]?.done) {
      count++;
      cursor = addDays(cursor, -1);
      first = false;
      continue;
    }
    // required day, not done
    if (first) {
      // today isn't finished yet — allow, keep walking back
      cursor = addDays(cursor, -1);
      first = false;
      continue;
    }
    break;
  }
  return count;
}

/**
 * Longest activity streak ever recorded, scanning from the earliest logged
 * date to today with the same free-day-transparent rule.
 */
export function computeLongestStreak(
  history: HistoryMap,
  todayISO: string
): number {
  const keys = Object.keys(history);
  if (keys.length === 0) return 0;
  let start = todayISO;
  for (const k of keys) if (k < start) start = k;

  let max = 0;
  let cur = 0;
  let cursor = start;
  for (let guard = 0; guard < 3650 && cursor <= todayISO; guard++) {
    if (!isFreeDay(cursor)) {
      if (history[cursor]?.done) {
        cur++;
        if (cur > max) max = cur;
      } else {
        cur = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return max;
}

// Count done sessions within [startISO, endISO] inclusive.
export function countDone(
  history: HistoryMap,
  startISO: string,
  endISO: string
): number {
  let n = 0;
  for (const [iso, entry] of Object.entries(history)) {
    if (entry.done && iso >= startISO && iso <= endISO) n++;
  }
  return n;
}

export function countThisWeek(history: HistoryMap, todayISO: string): number {
  const start = startOfWeekMonISO(todayISO);
  const end = addDays(start, 6);
  return countDone(history, start, end);
}

export function countThisMonth(history: HistoryMap, todayISO: string): number {
  const d = fromISO(todayISO);
  const start = toISO(new Date(d.getFullYear(), d.getMonth(), 1));
  const end = toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  return countDone(history, start, end);
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export interface MonthCell {
  iso: string;
  dayNum: number;
}

/**
 * Build a Monday-first month grid. Leading/trailing padding are represented
 * as null cells so the calendar aligns to weekday columns.
 */
export function monthCells(year: number, month: number): (MonthCell | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // blanks before day 1 (Mon-first)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (MonthCell | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toISO(new Date(year, month, d)), dayNum: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
