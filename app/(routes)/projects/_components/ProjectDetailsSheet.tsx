"use client";
import { X } from "lucide-react";
import { PROJECT_STATUS_CLASS, type Project } from "@/lib/types/projects";

export function ProjectDetailsSheet({
  project,
  open,
  onClose,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !project) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Project</p>
            <h2 className="text-lg font-semibold">{project.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm">
          <Row label="Client" value={project.client} />
          <Row label="Owner" value={project.owner} />
          <Row label="Due" value={project.due} />
          <Row
            label="Status"
            value={
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${PROJECT_STATUS_CLASS[project.status]}`}>
                {project.status}
              </span>
            }
          />
          <Row label="Progress" value={`${project.progress}%`} />
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}