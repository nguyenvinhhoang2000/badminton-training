"use client";

import { useState } from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { Check, ChevronDown, Film, Star } from "lucide-react";
import type { Exercise } from "@/data/workouts";

interface Props {
  exercise: Exercise;
  index: number;
  doneSets: boolean[]; // length === exercise.sets
  defaultRest: number;
  onToggleSet: (setIndex: number, next: boolean) => void;
  onStartRest: (sec: number) => void;
}

export default function ExerciseCard({
  exercise,
  index,
  doneSets,
  defaultRest,
  onToggleSet,
  onStartRest,
}: Props) {
  const completed = doneSets.filter(Boolean).length;
  const allDone = completed === exercise.sets;

  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleSet(i: number) {
    const next = !doneSets[i];
    onToggleSet(i, next);
    // starting a rest after finishing a set (but not the very last one)
    if (next && i < exercise.sets - 1) {
      onStartRest(defaultRest);
    }
  }

  const hasGif = !!exercise.gif && !imgError;

  return (
    <Card
      shadow="sm"
      className={[
        "border transition-colors",
        allDone
          ? "border-primary/40 bg-primary/5"
          : "border-default-200 bg-content1",
      ].join(" ")}
    >
      <CardBody className="gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            className={[
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold",
              allDone
                ? "bg-primary text-primary-foreground"
                : "bg-default-100 text-default-500",
            ].join(" ")}
          >
            {allDone ? <Check size={16} /> : index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {exercise.star && (
                <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />
              )}
              <h3 className="font-display text-[15px] font-semibold leading-tight">
                {exercise.name}
              </h3>
            </div>
            <p className="mt-1 text-xs leading-snug text-default-500">
              {exercise.cue}
            </p>
          </div>
          <Chip size="sm" variant="flat" color="primary" className="shrink-0">
            {exercise.volume}
          </Chip>
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-10">
          {Array.from({ length: exercise.sets }).map((_, i) => {
            const on = doneSets[i];
            return (
              <button
                key={i}
                onClick={() => handleSet(i)}
                aria-pressed={on}
                className={[
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-default-200 bg-default-50 text-default-600 hover:border-primary/50",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-4 w-4 items-center justify-center rounded border",
                    on ? "border-primary-foreground/60" : "border-default-300",
                  ].join(" ")}
                >
                  {on && <Check size={11} />}
                </span>
                Hiệp {i + 1}
              </button>
            );
          })}
        </div>

        {/* GIF minh hoạ */}
        <div className="pl-10">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Film size={14} />
            Xem cách tập
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              open ? "grid-rows-[1fr] pt-3 opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              {hasGif ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exercise.gif}
                  alt={`Cách thực hiện: ${exercise.name}`}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  className="w-full rounded-xl border border-default-200 bg-default-50 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-default-300 bg-default-50 px-4 py-6 text-center">
                  <Film size={22} className="text-default-400" />
                  <p className="text-xs text-default-500">
                    Chưa có ảnh minh hoạ cho bài này.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
