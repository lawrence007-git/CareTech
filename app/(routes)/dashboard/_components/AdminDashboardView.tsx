import { SearchProvider } from "./SearchContext";
import { CommandPalette } from "./CommandPalette";
import { DashboardHero } from "./DashboardHero";
import { KpiRow } from "./KpiRow";
import { RevenuePulse } from "./RevenuePulse";
import { ProjectSpotlight } from "./ProjectSpotlight";
import { TaskFlow } from "./TaskFlow";
import { AgendaTimeline } from "./AgendaTimeline";
import { TeamPulse } from "./TeamPulse";
import { ActivityFeed } from "./ActivityFeed";
import { FocusList } from "./FocusList";

// The original internal operations dashboard — unchanged, just relocated
// so DashboardGate can choose between this and CustomerDashboard by role.
export function AdminDashboardView() {
  return (
    <SearchProvider>
      <CommandPalette />
      <div className="space-y-6">
        <DashboardHero />
        <KpiRow />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RevenuePulse />
            <ProjectSpotlight />
            <TaskFlow />
          </div>
          <div className="space-y-6">
            <FocusList />
            <AgendaTimeline />
            <TeamPulse />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </SearchProvider>
  );
}