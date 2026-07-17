import { FormShell } from "../../_components/FormShell";
import { ProjectForm } from "../_components/ProjectForm";

const NewProjectPage = () => (
  <FormShell
    title="Create project"
    description="Draft a new project for a client."
    backHref="/projects"
    backLabel="Back to projects"
  >
    <ProjectForm submitLabel="Create project" cancelHref="/projects" />
  </FormShell>
);

export default NewProjectPage;