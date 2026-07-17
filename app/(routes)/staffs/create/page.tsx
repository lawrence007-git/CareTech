import { FormShell } from "../../_components/FormShell";
import { StaffForm } from "../_components/StaffForm";

const NewStaffPage = () => (
  <FormShell
    title="Create Staff Member"
    description="Add a new staff member to the organization."
    backHref="/staffs"
    backLabel="Back to staff"
  >
    <StaffForm submitLabel="Create staff member" cancelHref="/staffs" />
  </FormShell>
);

export default NewStaffPage;
