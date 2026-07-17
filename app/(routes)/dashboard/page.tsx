import { SearchProvider } from "./_components/SearchContext";
import { CommandPalette } from "./_components/CommandPalette";
import { DashboardHero } from "./_components/DashboardHero";
import { KpiRow } from "./_components/KpiRow";
import { RevenuePulse } from "./_components/RevenuePulse";
import { ProjectSpotlight } from "./_components/ProjectSpotlight";
import { TaskFlow } from "./_components/TaskFlow";
import { AgendaTimeline } from "./_components/AgendaTimeline";
import { TeamPulse } from "./_components/TeamPulse";
import { ActivityFeed } from "./_components/ActivityFeed";
import { FocusList } from "./_components/FocusList";

export const metadata = {
  title: "Dashboard — Mesa Systems",
  description: "Live operations overview for Mesa Systems",
};

export default function DashboardPage() {
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
