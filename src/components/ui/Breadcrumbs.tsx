import Link from "next/link";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  /** Без href — текущая страница. */
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Светлый текст для тёмного фона. */
  inverse?: boolean;
  className?: string;
}

/** Хлебные крошки: Главная / Каталог / Экскаваторы. */
export function Breadcrumbs({ items, inverse, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Хлебные крошки" className={className}>
      <ol className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", inverse ? "text-muted-inverse" : "text-muted")}>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-steel-500">
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className={cn("transition-colors", inverse ? "hover:text-white" : "hover:text-ink")}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn("font-semibold", inverse ? "text-white" : "text-ink")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
