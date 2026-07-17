"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { ProjectStatsCard } from "./_components/ProjectStatsCard";
import { ProjectSearch } from "./_components/ProjectSearch";
import { ProjectFilter, type ProjectFilterValue } from "./_components/ProjectFilter";
import { ProjectGrid } from "./_components/ProjectGrid";
import { ProjectPagination } from "./_components/ProjectPagination";
import { ProjectDetailsSheet } from "./_components/ProjectDetailsSheet";
import type { Project } from "@/lib/types/projects";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 6;

const ProjectsPage = () => {
  const router = useRouter();
  const projectsQuery = useQuery(api.projects.list);
  const isLoading = projectsQuery === undefined;
  const projects = projectsQuery ?? [];
  const removeProject = useMutation(api.projects.remove);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilterValue>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "All" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paginated = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const activeCount = projects.filter((p) => p.status === "In Progress").length;
  const planningCount = projects.filter((p) => p.status === "Planning").length;
  const onHoldCount = projects.filter((p) => p.status === "On Hold").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;

  const handleEdit = (project: Project) => {
    router.push(`/projects/edit/${project.id}`);
  };

  const handleDelete = (project: Project) => {
    removeProject({ id: project.id as Id<"projects"> });
    setSelected((prev) => (prev?.id === project.id ? null : prev));
  };

  if (isLoading) {
    return (
      <section className="flex h-full w-full flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <div>
        <PageHeader
          title="Project Management"
          description={`${filtered.length} projects in the current view`}
          actions={
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Plus className="h-4 w-4" /> New project
            </Link>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProjectStatsCard label="Active" value={String(activeCount)} hint="in progress" status="In Progress" />
          <ProjectStatsCard label="Planning" value={String(planningCount)} hint="kicking off" status="Planning" />
          <ProjectStatsCard label="On hold" value={String(onHoldCount)} hint="paused" status="On Hold" />
          <ProjectStatsCard label="Completed" value={String(completedCount)} hint="delivered" status="Completed" />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ProjectFilter value={filter} onChange={setFilter} />
          <ProjectSearch value={search} onChange={setSearch} />
        </div>

        <ProjectGrid items={paginated} onSelect={setSelected} onEdit={handleEdit} onDelete={handleDelete} />

        <ProjectPagination page={current} pageCount={pageCount} onPageChange={setPage} />

        <ProjectDetailsSheet project={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default ProjectsPage;