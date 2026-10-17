import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Общие свойства полей формы. */
export interface FieldProps {
  label: string;
  /** Подсказка под полем. */
  hint?: string;
  /** Текст ошибки. Если указан, поле подсвечивается и ошибка озвучивается скринридером. */
  error?: string;
  required?: boolean;
  className?: string;
}

/** Классы самого поля ввода — одинаковые для Input, Select и Textarea. */
export function controlClasses(hasError: boolean) {
  return cn(
    "w-full rounded-control border bg-white px-4 text-base text-ink placeholder:text-steel-500",
    "transition-[border-color,box-shadow] duration-150",
    "focus:outline-none focus-visible:outline-none focus:ring-4",
    "disabled:cursor-not-allowed disabled:bg-surface disabled:text-steel-500",
    hasError
      ? "border-error focus:border-error focus:ring-error/20"
      : "border-border-strong hover:border-steel-400 focus:border-graphite-900 focus:ring-signal/50",
  );
}

interface FieldWrapperProps extends FieldProps {
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}

/** Обёртка поля: подпись, само поле, подсказка и сообщение об ошибке. */
export function FieldWrapper({ label, hint, error, required, className, children }: FieldWrapperProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-error">
              *
            </span>
            <span className="sr-only"> (обязательное поле)</span>
          </>
        )}
      </label>
      {children({ id, describedBy })}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-error">
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
