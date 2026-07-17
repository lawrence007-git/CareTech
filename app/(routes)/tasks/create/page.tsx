import { FormShell } from "../../_components/FormShell";
import { TaskForm } from "../_components/TaskForm";

const NewTaskPage = () => (
  <FormShell
    title="Create task"
    description="Draft a new task for a staff member."
    backHref="/tasks"
    backLabel="Back to tasks"
  >
    <TaskForm submitLabel="Create task" cancelHref="/tasks" />
  </FormShell>
);

export default NewTaskPage;