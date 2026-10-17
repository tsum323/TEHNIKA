import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FieldWrapper, controlClasses, type FieldProps } from "./FormField";

type InputProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

/** Текстовое поле с подписью. Пока не подключено к отправке данных. */
export function Input({ label, hint, error, required, className, ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy }) => (
        <input
          {...rest}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses(Boolean(error)), "h-12")}
        />
      )}
    </FieldWrapper>
  );
}
