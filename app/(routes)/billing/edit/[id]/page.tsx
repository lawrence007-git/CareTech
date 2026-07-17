"use client";

import { notFound, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FormShell } from "../../../_components/FormShell";
import { BillingForm } from "../../_components/BillingForm";

const EditInvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const invoice = useQuery(api.billing.get, { id: id as Id<"billing"> });

  if (invoice === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading invoice…</div>;
  }
  if (invoice === null) {
    notFound();
  }

  return (
    <FormShell
      eyebrow={`Billing · ${invoice.id}`}
      title="Edit invoice"
      description={invoice.customer}
      backHref="/billing"
      backLabel="Back to billing"
    >
      <BillingForm
        initial={invoice}
        invoiceId={invoice.id as Id<"billing">}
        submitLabel="Save changes"
        cancelHref="/billing"
      />
    </FormShell>
  );
};

export default EditInvoicePage;