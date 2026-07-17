"use client";

import { notFound, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FormShell } from "../../../_components/FormShell";
import { TaskForm } from "../../_components/TaskForm";

const EditTaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const task = useQuery(api.tasks.get, { id: id as Id<"tasks"> });

  if (task === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading task…</div>;
  }
  if (task === null) {
    notFound();
  }

  return (
    <FormShell
      eyebrow={`Tasks · ${task.title}`}
      title="Edit task"
      description={task.title}
      backHref="/tasks"
      backLabel="Back to tasks"
    >
      <TaskForm
        initial={task}
        taskId={task.id as Id<"tasks">}
        submitLabel="Save changes"
        cancelHref="/tasks"
      />
    </FormShell>
  );
};

export default EditTaskPage;