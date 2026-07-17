import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Task automation: once a day, roll up report activity into an in-app
// notification instead of requiring someone to check the Reports page.
crons.daily(
  "daily report summary",
  { hourUTC: 13, minuteUTC: 0 }, // adjust to whatever hour suits your team's timezone
  internal.notifications.generateDailySummary
);

export default crons;