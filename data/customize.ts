import { days, type Exercise } from "@/data/workouts";

export const CUSTOM_KEY = "cau-long-custom-v1";

// Map of dayKey -> full exercise list overriding the defaults for that day.
export type CustomMap = Record<string, Exercise[]>;

/** Default (built-in) exercises for a training day. */
export function defaultExercises(dayKey: string): Exercise[] {
  return days.find((d) => d.key === dayKey)?.exercises ?? [];
}

/** Deep copy so edits never mutate the shared default objects. */
export function cloneExercises(list: Exercise[]): Exercise[] {
  return list.map((e) => ({ ...e }));
}

/** A stable-ish unique id for a newly added exercise. */
export function newExerciseId(dayKey: string): string {
  return `${dayKey}-c${Date.now().toString(36)}`;
}

/** A blank exercise to seed the "add" form. */
export function blankExercise(dayKey: string): Exercise {
  return {
    id: newExerciseId(dayKey),
    name: "",
    volume: "",
    sets: 3,
    cue: "",
  };
}
