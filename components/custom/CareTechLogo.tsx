// components/custom/CareTechLogo.tsx
import { HeartPulse } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
        <HeartPulse className="h-5 w-5 text-black" strokeWidth={2.5} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <span className="block truncate text-xl font-extrabold tracking-tight">
            <span className="text-foreground">Care</span>
            <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              Tech
            </span>
          </span>
          <span className="block truncate text-xs font-medium text-muted-foreground">
            Trusted Operations Platform
          </span>
        </div>
      )}
    </div>
  );
}