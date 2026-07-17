"use client";

import { notFound, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FormShell } from "../../../_components/FormShell";
import { CustomerForm } from "../../_components/CustomerForm";

const EditCustomerPage = () => {
  const { id } = useParams<{ id: string }>();
  const customer = useQuery(api.customers.get, { id: id as Id<"customers"> });

  if (customer === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading customer…</div>;
  }
  if (customer === null) {
    notFound();
  }

  return (
    <FormShell
      eyebrow={`Customers · ${customer.name}`}
      title="Edit customer"
      description={customer.company}
      backHref="/customer"
      backLabel="Back to customers"
    >
      <CustomerForm
        initial={customer}
        customerId={customer.id}
        submitLabel="Save changes"
        cancelHref="/customer"
      />
    </FormShell>
  );
};

export default EditCustomerPage;