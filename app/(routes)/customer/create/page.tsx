import { FormShell } from "../../_components/FormShell";
import { CustomerForm } from "../_components/CustomerForm";

const NewCustomerPage = () => (
  <FormShell
    title="Create customer"
    description="Add a new customer record."
    backHref="/customers"
    backLabel="Back to customers"
  >
    <CustomerForm submitLabel="Create customer" cancelHref="/customer" />
  </FormShell>
);

export default NewCustomerPage;