"use client";

import { notFound, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FormShell } from "../../../_components/FormShell";
import { ProjectForm } from "../../_components/ProjectForm";

const EditProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const project = useQuery(api.projects.get, { id: id as Id<"projects"> });

  if (project === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading project…</div>;
  }
  if (project === null) {
    notFound();
  }

  return (
    <FormShell
      eyebrow={`Projects · ${project.name}`}
      title="Edit project"
      description={project.client}
      backHref="/projects"
      backLabel="Back to projects"
    >
      <ProjectForm
        initial={project}
        projectId={project.id as Id<"projects">}
        submitLabel="Save changes"
        cancelHref="/projects"
      />
    </FormShell>
  );
};

export default EditProjectPage;