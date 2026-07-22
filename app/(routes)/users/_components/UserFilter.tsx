"use client";
import { USER_ROLES, ROLE_LABEL, type UserRole } from "@/lib/types/users";

export type UserFilterValue = "All" | UserRole;
const OPTIONS: UserFilterValue[] = ["All", ...USER_ROLES];

export function UserFilter({ value, onChange }: { value: UserFilterValue; onChange: (v: UserFilterValue) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt;
        const label = opt === "All" ? "All" : ROLE_LABEL[opt];
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}