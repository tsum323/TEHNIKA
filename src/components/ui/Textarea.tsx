import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FieldWrapper, controlClasses, type FieldProps } from "./FormField";

type TextareaProps = FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

/** Многострочное поле с подписью. Пока не подключено к отправке данных. */
export function Textarea({ label, hint, error, required, className, rows = 4, ...rest }: TextareaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy }) => (
        <textarea
          {...rest}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses(Boolean(error)), "min-h-28 resize-y py-3")}
        />
      )}
    </FieldWrapper>
  );
}
