import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";

export function FormField({
  label,
  hint,
  error,
  htmlFor,
  icon: Icon,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  /** When present, replaces `hint` with a destructive-styled message and marks the label as invalid. */
  error?: string;
  htmlFor?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor && hint && !error ? `${htmlFor}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${
          error ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-[11px] font-medium text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Pass to an input's `aria-describedby` alongside any other ids, e.g. `describedBy(id, error, hint)`. */
export function describedBy(htmlFor: string | undefined, error?: string, hint?: string) {
  if (!htmlFor) return undefined;
  if (error) return `${htmlFor}-error`;
  if (hint) return `${htmlFor}-hint`;
  return undefined;
}

const baseControl =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-all duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/40 focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive aria-invalid:focus:ring-destructive/30";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${baseControl} ${className}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${baseControl} min-h-[96px] resize-y ${className}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${baseControl} cursor-pointer pr-8 ${className}`}>
      {children}
    </select>
  );
}