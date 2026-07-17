"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ListChecks } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { TaskStatsCard } from "./_components/TaskStatsCard";
import { TaskSearch } from "./_components/TaskSearch";
import { TaskFilter, type TaskFilterValue } from "./_components/TaskFilter";
import { TaskBoard } from "./_components/TaskBoard";
import { TaskDetailsSheet } from "./_components/TaskDetailsSheet";
import type { Task } from "@/lib/types/tasks";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const TasksPage = () => {
  const router = useRouter();
  const tasksQuery = useQuery(api.tasks.list);
  const isLoading = tasksQuery === undefined;
  const tasks = tasksQuery ?? [];
  const removeTask = useMutation(api.tasks.remove);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskFilterValue>("All");
  const [selected, setSelected] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter !== "All" && t.status !== filter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [tasks, search, filter]);

  const openCount = tasks.filter((t) => t.status !== "Done").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const blockedCount = tasks.filter((t) => t.status === "Blocked").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;

  const handleEdit = (task: Task) => router.push(`/tasks/edit/${task.id}`);
  const handleDelete = (task: Task) => {
    removeTask({ id: task.id as Id<"tasks"> });
    setSelected((prev) => (prev?.id === task.id ? null : prev));
  };

  if (isLoading) {
    return (
      <section className="flex h-full w-full flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">Loading tasks…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col gap-4 p-2">
      <div>
        <PageHeader
          title="Task Management"
          description={`${filtered.length} tasks in the current view`}
          actions={
            <Link
              href="/tasks/create"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Plus className="h-4 w-4" /> New task
            </Link>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TaskStatsCard label="Open" value={String(openCount)} icon={ListChecks} hint="across all projects" />
          <TaskStatsCard label="In progress" value={String(inProgressCount)} hint="active work" status="In Progress" />
          <TaskStatsCard label="Blocked" value={String(blockedCount)} hint="needs attention" status="Blocked" />
          <TaskStatsCard label="Completed" value={String(doneCount)} hint="delivered" status="Done" />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TaskFilter value={filter} onChange={setFilter} />
          <TaskSearch value={search} onChange={setSearch} />
        </div>

        <TaskBoard items={filtered} onSelect={setSelected} onEdit={handleEdit} onDelete={handleDelete} />

        <TaskDetailsSheet task={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default TasksPage;