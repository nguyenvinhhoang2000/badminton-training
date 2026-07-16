"use client";

import { days, type Day } from "@/data/workouts";
import { Check, Dumbbell, Moon, Sparkles } from "lucide-react";

interface Props {
  selected: string;
  today: string | null;
  onSelect: (key: string) => void;
  progressOf: (day: Day) => number; // 0..1 for days with exercises
  hasExercises: (dayKey: string) => boolean;
}

const accentBar: Record<Day["accent"], string> = {
  teal: "bg-primary",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  slate: "bg-default-300",
};

function DayIcon({ day, workout }: { day: Day; workout: boolean }) {
  if (workout) return <Dumbbell size={13} />;
  if (day.type === "badminton") return <Sparkles size={13} />;
  return <Moon size={13} />;
}

export default function WeekStrip({
  selected,
  today,
  onSelect,
  progressOf,
  hasExercises,
}: Props) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const isSel = day.key === selected;
        const isToday = day.key === today;
        const workout = hasExercises(day.key);
        const prog = workout ? progressOf(day) : 0;
        const done = workout && prog >= 1;
        return (
          <button
            key={day.key}
            onClick={() => onSelect(day.key)}
            className={[
              "relative flex min-w-[62px] flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition-all",
              isSel
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-default-200 bg-content1 hover:border-default-300",
            ].join(" ")}
          >
            <span
              className={[
                "text-[11px] font-bold",
                isSel ? "text-primary" : "text-default-600",
              ].join(" ")}
            >
              {day.short}
            </span>
            <span
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full text-white",
                accentBar[day.accent],
              ].join(" ")}
            >
              {done ? <Check size={14} /> : <DayIcon day={day} workout={workout} />}
            </span>
            {workout ? (
              <span className="text-[9px] tabular-nums text-default-400">
                {Math.round(prog * 100)}%
              </span>
            ) : (
              <span className="text-[9px] text-default-400">
                {day.type === "badminton" ? "cầu" : "nghỉ"}
              </span>
            )}
            {isToday && (
              <span className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-danger" />
            )}
          </button>
        );
      })}
    </div>
  );
}
