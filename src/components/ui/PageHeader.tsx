import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { Container } from "./Container";

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  /** Абзацы описания под заголовком. */
  description?: string[];
  /** Дополнительный блок справа (на широких экранах) или снизу. */
  aside?: ReactNode;
}

/** Тёмная шапка внутренней страницы: хлебные крошки, заголовок, описание. */
export function PageHeader({ breadcrumbs, eyebrow, title, description, aside }: PageHeaderProps) {
  return (
    <div className="surface-dark blueprint-grid bg-graphite-900 text-white">
      <Container className="py-12 md:py-16 lg:py-20">
        <Breadcrumbs items={breadcrumbs} inverse />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <div>
            {eyebrow && (
              <p className="mb-4 flex items-center gap-3 text-overline text-signal uppercase">
                <span aria-hidden="true" className="h-0.5 w-8 bg-signal" />
                {eyebrow}
              </p>
            )}
            <h1 className="text-h1 text-balance">{title}</h1>
            {description?.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-2xl text-lead text-steel-300">
                {paragraph}
              </p>
            ))}
          </div>
          {aside}
        </div>
      </Container>
    </div>
  );
}
