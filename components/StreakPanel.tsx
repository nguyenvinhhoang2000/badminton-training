"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { ChevronLeft, ChevronRight, Flame, Trophy } from "lucide-react";
import {
  computeLongestStreak,
  computeStreak,
  countThisMonth,
  countThisWeek,
  dayForISO,
  fromISO,
  monthCells,
  type HistoryMap,
} from "@/data/history";
import type { DayType } from "@/data/workouts";

interface Props {
  history: HistoryMap;
  todayISO: string;
}

const WEEK_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABEL = (d: Date) => `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;

// dot color for a completed session, by the day type that was done
const doneDot: Record<DayType, string> = {
  training: "bg-primary",
  badminton: "bg-blue-500",
  "rest-active": "bg-default-400",
  rest: "bg-default-400",
};

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-default-50 px-2 py-3 text-center">
      <span className={`flex items-center gap-1 ${tone}`}>{icon}</span>
      <span className="font-display text-xl font-bold leading-none tabular-nums">
        {value}
      </span>
      <span className="text-[10px] leading-tight text-default-500">{label}</span>
    </div>
  );
}

export default function StreakPanel({ history, todayISO }: Props) {
  const today = fromISO(todayISO);
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const streak = useMemo(
    () => computeStreak(history, todayISO),
    [history, todayISO]
  );
  const longest = useMemo(
    () => computeLongestStreak(history, todayISO),
    [history, todayISO]
  );
  const week = useMemo(
    () => countThisWeek(history, todayISO),
    [history, todayISO]
  );
  const month = useMemo(
    () => countThisMonth(history, todayISO),
    [history, todayISO]
  );

  const cells = useMemo(
    () => monthCells(view.year, view.month),
    [view.year, view.month]
  );

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const viewingCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();

  return (
    <Card shadow="none" className="mt-6 border border-default-200 bg-content1">
      <CardBody className="gap-4 p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-default-600">
          <Flame size={14} className="text-orange-500" /> Streak & lịch sử
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <Stat
            icon={<Flame size={15} />}
            value={streak}
            label="ngày streak"
            tone="text-orange-500"
          />
          <Stat
            icon={<Trophy size={15} />}
            value={longest}
            label="dài nhất"
            tone="text-amber-500"
          />
          <Stat
            icon={<span className="text-[11px] font-bold">7d</span>}
            value={week}
            label="buổi tuần này"
            tone="text-primary"
          />
          <Stat
            icon={<span className="text-[11px] font-bold">30d</span>}
            value={month}
            label="buổi tháng này"
            tone="text-blue-500"
          />
        </div>

        {/* Month calendar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Tháng trước"
              onPress={() => shift(-1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="font-display text-sm font-semibold">
              {MONTH_LABEL(new Date(view.year, view.month, 1))}
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Tháng sau"
              onPress={() => shift(1)}
              isDisabled={viewingCurrentMonth}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEK_LABELS.map((w) => (
              <span
                key={w}
                className="text-[10px] font-semibold text-default-400"
              >
                {w}
              </span>
            ))}
            {cells.map((cell, i) => {
              if (!cell) return <span key={`b${i}`} />;
              const entry = history[cell.iso];
              const isToday = cell.iso === todayISO;
              const future = cell.iso > todayISO;
              const type = entry?.type ?? dayForISO(cell.iso)?.type;
              return (
                <div
                  key={cell.iso}
                  className={[
                    "relative flex aspect-square items-center justify-center rounded-lg text-[11px] tabular-nums",
                    isToday
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-content1"
                      : "",
                    entry?.done
                      ? "font-semibold text-foreground"
                      : future
                        ? "text-default-300"
                        : "text-default-500",
                  ].join(" ")}
                >
                  {cell.dayNum}
                  {entry?.done && type && (
                    <span
                      className={`absolute bottom-0.5 h-1 w-1 rounded-full ${doneDot[type]}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-default-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Bổ trợ
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Đánh cầu
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-default-400" /> Nghỉ
              chủ động
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
