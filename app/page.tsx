"use client";

import Link from "next/link";
import { Button, Card, CardBody } from "@heroui/react";
import { ArrowRight, Dumbbell, Moon, Sparkles } from "lucide-react";
import { days, type Day } from "@/data/workouts";
import StreakPanel from "@/components/StreakPanel";
import { useAppState } from "@/context/AppState";

const typeMeta: Record<
  Day["type"],
  { icon: React.ReactNode; wrap: string; cta: string }
> = {
  training: {
    icon: <Dumbbell size={22} />,
    wrap: "bg-blue-500/10 text-blue-500",
    cta: "Xem buổi tập",
  },
  badminton: {
    icon: <Sparkles size={22} />,
    wrap: "bg-primary/10 text-primary",
    cta: "Xem buổi hôm nay",
  },
  "rest-active": {
    icon: <Moon size={22} />,
    wrap: "bg-default-100 text-default-500",
    cta: "Xem gợi ý hôm nay",
  },
  rest: {
    icon: <Moon size={22} />,
    wrap: "bg-default-100 text-default-500",
    cta: "Xem gợi ý hôm nay",
  },
};

export default function Home() {
  const { mounted, today, progressOf } = useAppState();
  const todayDay = days.find((d) => d.key === today);

  console.log(mounted, todayDay);
  

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-xl px-4 pb-10 pt-5">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Badminton Training
        </p>
        <h1 className="font-display text-2xl font-bold leading-tight">
          Tổng quan
        </h1>
        <p className="mt-0.5 text-xs text-default-500">
          Streak, lịch sử và buổi tập hôm nay
        </p>

        {/* Today card */}
        {mounted && todayDay && (
          <Card
            shadow="sm"
            className="mt-5 border border-default-200 bg-content1"
          >
            <CardBody className="gap-4 p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${typeMeta[todayDay.type].wrap}`}
                >
                  {typeMeta[todayDay.type].icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-default-400">
                    Hôm nay · {todayDay.label}
                  </p>
                  <h2 className="font-display text-lg font-bold leading-tight">
                    {todayDay.title}
                  </h2>
                  {todayDay.type === "training" && (
                    <p className="text-xs text-default-500">
                      Tiến độ {Math.round(progressOf(todayDay) * 100)}%
                    </p>
                  )}
                </div>
              </div>
              <Button
                as={Link}
                href="/training"
                color="primary"
                endContent={<ArrowRight size={16} />}
                className="w-full font-semibold"
              >
                {typeMeta[todayDay.type].cta}
              </Button>
            </CardBody>
          </Card>
        )}

        <StreakPanelSlot />
      </div>
    </main>
  );
}

// Streak panel only makes sense once we know today's date (client-side).
function StreakPanelSlot() {
  const { mounted, todayISO, history } = useAppState();
  if (!mounted || !todayISO) return null;
  return <StreakPanel history={history} todayISO={todayISO} />;
}
