"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full min-w-0 rounded-control border border-border-strong bg-white px-3 text-base text-ink placeholder:text-steel-500 " +
  "focus:border-graphite-900 focus:outline-none focus:ring-4 focus:ring-signal/50 disabled:bg-surface disabled:text-steel-500 " +
  "aria-[invalid=true]:border-error";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function Wrapper({ label, hint, error, required, className, children }: FieldProps & { children: (id: string, describedBy?: string) => ReactNode }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-error" aria-hidden="true"> *</span>}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function TextField({ label, hint, error, required, className, ...rest }: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className}>
      {(id, describedBy) => (
        <input {...rest} id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "h-11")} />
      )}
    </Wrapper>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  placeholder,
  ...rest
}: FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className}>
      {(id, describedBy) => (
        <select {...rest} id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "h-11 cursor-pointer")}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Wrapper>
  );
}

export function TextAreaField({ label, hint, error, required, className, rows = 3, ...rest }: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className}>
      {(id, describedBy) => (
        <textarea {...rest} id={id} rows={rows} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "resize-y py-2.5")} />
      )}
    </Wrapper>
  );
}

export function CheckboxField({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange(value: boolean): void; disabled?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-graphite-900"
      />
      {label}
    </label>
  );
}
