import type { ReactNode } from "react";

import { AdminShell } from "./_components/AdminShell";
import { ThemeProvider } from "@/lib/theme";

export const metadata = {
  title: "Mesa Systems — Admin",
  description: "Operations console for Mesa Systems",
};

export default function RoutesLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AdminShell>{children}</AdminShell>
    </ThemeProvider>
  );
}
