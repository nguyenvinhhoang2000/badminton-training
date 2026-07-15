"use client";

import { useMemo } from "react";
import { Button, Card, CardBody, Progress } from "@heroui/react";
import {
  RotateCcw,
  Waves,
  Sparkles,
  Info,
  Moon,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import { days, reminders, type Day } from "@/data/workouts";
import WeekStrip from "@/components/WeekStrip";
import ExerciseCard from "@/components/ExerciseCard";
import RestTimer from "@/components/RestTimer";
import { useAppState, DEFAULT_REST } from "@/context/AppState";

const accentText: Record<Day["accent"], string> = {
  teal: "text-primary",
  blue: "text-blue-500",
  violet: "text-violet-500",
  slate: "text-default-500",
};

export default function TrainingPage() {
  const {
    selected,
    setSelected,
    today,
    todayISO,
    history,
    progressOf,
    doneSetsFor,
    toggleSet,
    resetDay,
    logToday,
    startRest,
    duration,
    remaining,
    running,
    toggleTimer,
    resetTimer,
  } = useAppState();

  const day = useMemo(() => days.find((d) => d.key === selected)!, [selected]);

  const isTraining = day.type === "training";
  const dayProgress = isTraining ? progressOf(day) : 0;
  const isToday = selected === today;
  const todayDone = !!(todayISO && history[todayISO]?.done);
  const canLogManually =
    isToday && (day.type === "badminton" || day.type === "rest-active");

  return (
    <main className={isTraining ? "court-grid min-h-screen" : "min-h-screen"}>
      <div
        className="mx-auto max-w-xl px-4 pt-5"
        style={{ paddingBottom: isTraining ? 120 : 32 }}
      >
        {/* Week selector */}
        <WeekStrip
          selected={selected}
          today={today}
          onSelect={setSelected}
          progressOf={progressOf}
        />

        {/* Day heading */}
        <div className="mb-4 mt-6 flex items-end justify-between gap-3">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${accentText[day.accent]}`}
            >
              {day.label} · {day.subtitle}
            </p>
            <h2 className="font-display text-xl font-bold">{day.title}</h2>
          </div>
          {isTraining && (
            <Button
              size="sm"
              variant="light"
              startContent={<RotateCcw size={14} />}
              onPress={resetDay}
            >
              Đặt lại ngày
            </Button>
          )}
        </div>

        {/* Content by day type */}
        {isTraining ? (
          <div className="flex flex-col gap-3">
            <Progress
              aria-label="Tiến độ buổi tập"
              value={Math.round(dayProgress * 100)}
              color="primary"
              size="sm"
              className="mb-1"
            />

            {day.warmup && (
              <Card
                shadow="none"
                className="border border-dashed border-default-300 bg-default-50"
              >
                <CardBody className="flex-row items-start gap-2 p-3">
                  <Waves size={16} className="mt-0.5 shrink-0 text-primary" />
                  <p className="text-xs leading-snug text-default-600">
                    {day.warmup}
                  </p>
                </CardBody>
              </Card>
            )}

            {day.note && (
              <p className="px-1 text-xs text-default-500">{day.note}</p>
            )}

            {day.exercises!.map((ex, idx) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                index={idx}
                doneSets={doneSetsFor(day.key, ex.id, ex.sets)}
                defaultRest={DEFAULT_REST}
                onToggleSet={(i, next) => toggleSet(day.key, ex.id, i, next)}
                onStartRest={startRest}
              />
            ))}
          </div>
        ) : (
          <Card shadow="sm" className="border border-default-200 bg-content1">
            <CardBody className="items-center gap-3 p-8 text-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  day.type === "badminton"
                    ? "bg-primary/10 text-primary"
                    : "bg-default-100 text-default-500"
                }`}
              >
                {day.type === "badminton" ? (
                  <Sparkles size={26} />
                ) : (
                  <Moon size={26} />
                )}
              </span>
              <p className="max-w-sm text-sm leading-relaxed text-default-600">
                {day.note}
              </p>
              {canLogManually && (
                <Button
                  size="sm"
                  variant={todayDone ? "flat" : "solid"}
                  color={todayDone ? "default" : "primary"}
                  startContent={
                    todayDone ? (
                      <CalendarX size={15} />
                    ) : (
                      <CalendarCheck size={15} />
                    )
                  }
                  onPress={() => logToday(day.key, day.type, !todayDone)}
                >
                  {todayDone
                    ? "Bỏ ghi nhận hôm nay"
                    : day.type === "badminton"
                      ? "Đã đi đánh cầu hôm nay"
                      : "Đã tập nhẹ hôm nay"}
                </Button>
              )}
              {!isToday && day.type !== "rest" && (
                <p className="text-[11px] text-default-400">
                  Chỉ ghi nhận được cho ngày hôm nay.
                </p>
              )}
            </CardBody>
          </Card>
        )}

        {/* Reminders */}
        <Card
          shadow="none"
          className="mt-6 border border-amber-300/60 bg-amber-50 dark:bg-amber-950/20"
        >
          <CardBody className="gap-2 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Info size={14} /> Ghi nhớ
            </div>
            <ul className="flex flex-col gap-1.5">
              {reminders.map((r, i) => (
                <li
                  key={i}
                  className="pl-4 text-xs leading-snug text-default-600 before:relative before:-ml-4 before:mr-2 before:text-amber-500 before:content-['•']"
                >
                  {r}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Sticky rest timer — only on training days */}
      {isTraining && (
        <RestTimer
          remaining={remaining}
          duration={duration}
          running={running}
          onStart={startRest}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />
      )}
    </main>
  );
}
