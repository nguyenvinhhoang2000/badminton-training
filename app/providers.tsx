"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AppStateProvider } from "@/context/AppState";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
        <AppStateProvider>{children}</AppStateProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
