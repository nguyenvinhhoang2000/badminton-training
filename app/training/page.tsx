"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody, Progress } from "@heroui/react";
import {
  RotateCcw,
  Waves,
  Sparkles,
  Info,
  Moon,
  CalendarCheck,
  CalendarX,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Star,
} from "lucide-react";
import { days, reminders, type Day, type Exercise } from "@/data/workouts";
import { blankExercise, cloneExercises } from "@/data/customize";
import WeekStrip from "@/components/WeekStrip";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseEditor from "@/components/ExerciseEditor";
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
    exercisesOf,
    isCustomized,
    saveExercises,
    resetExercises,
    startRest,
    duration,
    remaining,
    running,
    toggleTimer,
    resetTimer,
  } = useAppState();

  const day = useMemo(() => days.find((d) => d.key === selected)!, [selected]);
  const exercises = exercisesOf(day.key);
  const hasExercises = exercises.length > 0;

  const [editing, setEditing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);

  const dayProgress = hasExercises ? progressOf(day) : 0;
  const isToday = selected === today;
  const todayDone = !!(todayISO && history[todayISO]?.done);
  const canLogManually =
    isToday && (day.type === "badminton" || day.type === "rest-active");
  const showTimer = hasExercises && !editing;

  function openAdd() {
    setEditTarget(blankExercise(day.key));
    setEditorMode("add");
    setEditorOpen(true);
  }

  function openEdit(ex: Exercise) {
    setEditTarget(ex);
    setEditorMode("edit");
    setEditorOpen(true);
  }

  function handleSave(ex: Exercise) {
    const list = cloneExercises(exercises);
    if (editorMode === "add") {
      saveExercises(day.key, [...list, ex]);
    } else {
      saveExercises(
        day.key,
        list.map((e) => (e.id === ex.id ? ex : e))
      );
    }
    setEditorOpen(false);
  }

  function del(id: string) {
    saveExercises(
      day.key,
      cloneExercises(exercises).filter((e) => e.id !== id)
    );
  }

  function move(idx: number, dir: -1 | 1) {
    const list = cloneExercises(exercises);
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    [list[idx], list[j]] = [list[j], list[idx]];
    saveExercises(day.key, list);
  }

  return (
    <main className={hasExercises ? "court-grid min-h-screen" : "min-h-screen"}>
      <div
        className="mx-auto max-w-xl px-4 pt-5"
        style={{ paddingBottom: showTimer ? 120 : 32 }}
      >
        {/* Week selector */}
        <WeekStrip
          selected={selected}
          today={today}
          onSelect={setSelected}
          progressOf={progressOf}
          hasExercises={(k) => exercisesOf(k).length > 0}
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
          {editing ? (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Check size={14} />}
              onPress={() => setEditing(false)}
            >
              Xong
            </Button>
          ) : (
            hasExercises && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="light"
                  startContent={<Pencil size={14} />}
                  onPress={() => setEditing(true)}
                >
                  Sửa bài
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  aria-label="Đặt lại tiến độ ngày"
                  onPress={resetDay}
                >
                  <RotateCcw size={14} />
                </Button>
              </div>
            )
          )}
        </div>

        {/* Body */}
        {editing ? (
          <div className="flex flex-col gap-3">
            {exercises.map((ex, idx) => (
              <Card
                key={ex.id}
                shadow="sm"
                className="border border-default-200 bg-content1"
              >
                <CardBody className="flex-row items-center gap-2 p-3">
                  <div className="flex flex-col">
                    <button
                      aria-label="Lên"
                      disabled={idx === 0}
                      onClick={() => move(idx, -1)}
                      className="text-default-400 hover:text-default-600 disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      aria-label="Xuống"
                      disabled={idx === exercises.length - 1}
                      onClick={() => move(idx, 1)}
                      className="text-default-400 hover:text-default-600 disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      {ex.star && (
                        <Star
                          size={12}
                          className="shrink-0 fill-amber-400 text-amber-400"
                        />
                      )}
                      <span className="truncate text-sm font-semibold">
                        {ex.name}
                      </span>
                    </div>
                    <span className="text-xs text-default-500">
                      {ex.volume} · {ex.sets} hiệp
                    </span>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    aria-label="Sửa"
                    onPress={() => openEdit(ex)}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="danger"
                    aria-label="Xoá"
                    onPress={() => del(ex.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </CardBody>
              </Card>
            ))}

            {exercises.length === 0 && (
              <p className="px-1 text-xs text-default-500">
                Chưa có bài tập nào. Bấm “Thêm bài tập” để tạo buổi tập cho ngày
                này.
              </p>
            )}

            <Button
              variant="flat"
              color="primary"
              startContent={<Plus size={16} />}
              onPress={openAdd}
              className="w-full font-medium"
            >
              Thêm bài tập
            </Button>

            {isCustomized(day.key) && (
              <Button
                variant="light"
                color="warning"
                size="sm"
                startContent={<RotateCcw size={14} />}
                onPress={() => resetExercises(day.key)}
              >
                Khôi phục bài mặc định
              </Button>
            )}
          </div>
        ) : hasExercises ? (
          <div className="flex flex-col gap-3">
            <Progress
              aria-label="Tiến độ buổi tập"
              value={Math.round(dayProgress * 100)}
              color="primary"
              size="sm"
              className="mb-1"
            />

            {day.type === "training" && day.warmup && (
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

            {day.type === "training" && day.note && (
              <p className="px-1 text-xs text-default-500">{day.note}</p>
            )}

            {exercises.map((ex, idx) => (
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
              <Button
                size="sm"
                variant="light"
                startContent={<Plus size={15} />}
                onPress={() => {
                  setEditing(true);
                  openAdd();
                }}
              >
                Thêm bài tập cho ngày này
              </Button>
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

      {showTimer && (
        <RestTimer
          remaining={remaining}
          duration={duration}
          running={running}
          onStart={startRest}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />
      )}

      <ExerciseEditor
        open={editorOpen}
        initial={editTarget}
        mode={editorMode}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </main>
  );
}
