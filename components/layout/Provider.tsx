"use client";

import { ThemeProvider } from "@/lib/theme";
import { ReactNode } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ConvexClientProvider>
  );
}