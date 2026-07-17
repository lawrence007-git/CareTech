import { FormShell } from "../../_components/FormShell";
import { BillingForm } from "../_components/BillingForm";

const NewInvoicePage = () => (
  <FormShell
    title="Create invoice"
    description="Draft a new invoice for a customer."
    backHref="/billing"
    backLabel="Back to billing"
  >
    <BillingForm submitLabel="Create invoice" cancelHref="/billing" />
  </FormShell>
);

export default NewInvoicePage;