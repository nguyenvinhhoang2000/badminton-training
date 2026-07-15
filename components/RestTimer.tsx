"use client";

import { Button, Chip } from "@heroui/react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { REST_PRESETS } from "@/data/workouts";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  remaining: number;
  duration: number;
  running: boolean;
  onStart: (sec: number) => void;
  onToggle: () => void;
  onReset: () => void;
}

export default function RestTimer({
  remaining,
  duration,
  running,
  onStart,
  onToggle,
  onReset,
}: Props) {
  const size = 72;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = duration > 0 ? remaining / duration : 0;
  const active = remaining > 0 || running;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3">
      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-4 rounded-2xl border border-default-200 bg-content1/95 p-3 shadow-xl backdrop-blur">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-default-200"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - progress)}
              className={
                remaining <= 5 && active
                  ? "text-danger transition-all duration-500"
                  : "text-primary transition-all duration-500"
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-lg font-bold leading-none tabular-nums">
              {fmt(remaining)}
            </span>
            <span className="text-[9px] uppercase tracking-wide text-default-400">
              nghỉ
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-default-500">
            <Timer size={14} /> Bộ đếm nghỉ giữa các set
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {REST_PRESETS.map((p) => (
              <Chip
                key={p}
                as="button"
                onClick={() => onStart(p)}
                size="sm"
                variant={duration === p && active ? "solid" : "flat"}
                color={duration === p && active ? "primary" : "default"}
                className="cursor-pointer"
              >
                {p}s
              </Chip>
            ))}
            <Button
              size="sm"
              isIconOnly
              variant="flat"
              color="primary"
              aria-label={running ? "Tạm dừng" : "Tiếp tục"}
              onPress={onToggle}
              isDisabled={remaining === 0}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button
              size="sm"
              isIconOnly
              variant="light"
              aria-label="Đặt lại"
              onPress={onReset}
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
