"use client";

import { notFound, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FormShell } from "../../../_components/FormShell";
import { StaffForm } from "../../_components/StaffForm";

const EditStaffPage = () => {
  const { id } = useParams<{ id: string }>();
  const staff = useQuery(api.staffs.get, { id: id as Id<"staffs"> });

  if (staff === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading staffs .....</div>;
  }
  if (staff === null) {
    notFound();
  }

  return (
    <FormShell
      eyebrow={`Staff · ${staff.name}`}
      title="Edit staff"
      description={staff.email}
      backHref="/staffs"
      backLabel="Back to staffs"
    >
      <StaffForm
        initial={staff}
        staffId={staff.id}
        submitLabel="Save changes"
        cancelHref="/staffs"
      />
    </FormShell>
  );
};

export default EditStaffPage;