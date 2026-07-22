import type { LucideIcon } from "lucide-react";
import { USER_ROLE_CLASS, type UserRole } from "@/lib/types/users";
import { StatsCard } from "../../_components/StatsCard";

interface UserStatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /** Pass the actual UserRole when this card represents a role count — colors then come from USER_ROLE_CLASS, same as UserList/UserDetailsSheet. */
  role?: UserRole;
}

const ROLE_VALUE_TONE: Record<UserRole, string> = {
  admin: "text-primary",
  manager: "text-status-onhold",
  staff: "text-status-progress",
  customer: "text-foreground",
};

export function UserStatsCard({ label, value, icon, hint, role }: UserStatsCardProps) {
  return (
    <StatsCard
      label={label}
      value={value}
      hint={hint}
      icon={icon}
      iconClassName={role ? USER_ROLE_CLASS[role] : "bg-muted text-muted-foreground"}
      valueClassName={role ? ROLE_VALUE_TONE[role] : "text-foreground"}
    />
  );
}