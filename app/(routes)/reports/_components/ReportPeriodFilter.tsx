export type ReportRangeValue = "7d" | "30d" | "month" | "year" | "all";
export type ReportGranularity = "day" | "month" | "year";

export function getRangeCutoff(range: ReportRangeValue): Date | null {
  const now = new Date();
  switch (range) {
    case "7d": return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case "30d": return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    case "month": return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year": return new Date(now.getFullYear(), 0, 1);
    case "all": return null;
  }
}

/** No manual "group by" control anymore — pick a sensible bucket size from the range instead. */
export function getDefaultGranularity(range: ReportRangeValue): ReportGranularity {
  switch (range) {
    case "7d":
    case "30d":
    case "month":
      return "day";
    case "year":
      return "month";
    case "all":
      return "year";
  }
}