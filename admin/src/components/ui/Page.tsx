import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Заголовок страницы с действиями справа. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/** Белая карточка-блок. */
export function Card({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-card border border-border bg-white p-5 shadow-card sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Плитка с одним числом. */
export function Stat({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "default" | "positive" | "negative" }) {
  return (
    <div className="min-w-0 rounded-card border border-border bg-white p-4 shadow-card sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-extrabold tracking-tight tabular-nums",
          tone === "positive" && "text-success",
          tone === "negative" && "text-error",
        )}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-card border border-dashed border-border-strong bg-white p-8 text-center text-muted">{children}</p>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-control bg-error-bg px-4 py-3 text-sm font-semibold text-error">
      {children}
    </p>
  );
}

/** Строка таблицы, по которой можно нажать (открывает карточку). */
export const rowButtonClass = "cursor-pointer transition-colors hover:bg-surface focus-visible:bg-surface";
