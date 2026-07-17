"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export function AuthField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  value,
  onChange,
  onBlur,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Destructive-styled message shown under the field; also marks the input aria-invalid. */
  error?: string;
}) {
  const errorId = error ? `${name}-error` : undefined;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className={`text-sm font-medium ${error ? "text-destructive" : ""}`}>{label}</span>
      <div className="relative mt-1.5">
        <input
          name={name}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`block w-full rounded-md border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 ${
            isPassword ? "pr-10" : ""
          } ${
            error
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
              : "border-border focus-visible:border-ring focus-visible:ring-ring/40"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </label>
  );
}