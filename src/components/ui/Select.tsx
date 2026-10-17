import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FieldWrapper, controlClasses, type FieldProps } from "./FormField";

export interface SelectOption {
  value: string;
  label: string;
}

type SelectProps = FieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> & {
    options: SelectOption[];
    /** Текст пустого варианта, например «Выберите категорию». */
    placeholder?: string;
  };

/** Выпадающий список на основе нативного <select> — удобен на iPad и телефоне. */
export function Select({ label, hint, error, required, className, options, placeholder, ...rest }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy }) => (
        <div className="relative">
          <select
            {...rest}
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(controlClasses(Boolean(error)), "h-12 cursor-pointer appearance-none pr-11")}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-graphite-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      )}
    </FieldWrapper>
  );
}
