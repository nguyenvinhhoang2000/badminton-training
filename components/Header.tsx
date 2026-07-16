"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Dumbbell, Flame, Home, Moon, Sun } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import { useAppState } from "@/context/AppState";

const NAV = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/training", label: "Tập luyện", icon: Dumbbell },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { mounted, streak, cloud } = useAppState();

  return (
    <header className="sticky top-0 z-50 border-b border-default-200 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2 px-4 py-2.5">
        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-default-500 hover:bg-default-100 hover:text-default-700",
                ].join(" ")}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        {mounted && (
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span
                className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-500"
                title="Chuỗi ngày tập liên tục"
              >
                <Flame size={14} />
                {streak}
              </span>
            )}
            <AuthButton
              enabled={cloud.enabled}
              session={cloud.session}
              status={cloud.status}
              onSignIn={cloud.signIn}
              onSignUp={cloud.signUp}
              onSignOut={cloud.signOut}
            />
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              aria-label="Đổi giao diện sáng/tối"
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
