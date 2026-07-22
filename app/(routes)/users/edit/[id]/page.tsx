"use client";

import { notFound, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FormShell } from "../../../_components/FormShell";
import { UserRoleForm } from "../../_components/UserForm";

const EditUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const user = useQuery(api.users.get, { id: id as Id<"users"> });
  const me = useQuery(api.users.current);

  if (user === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading user…</div>;
  }
  if (user === null) {
    notFound();
  }

  return (
    <FormShell
      eyebrow={`Users · ${user.name}`}
      title="Edit user role"
      description={user.email || undefined}
      backHref="/users"
      backLabel="Back to users"
    >
      <UserRoleForm user={user} currentUserId={me?._id} cancelHref="/users" />
    </FormShell>
  );
};

export default EditUserPage;