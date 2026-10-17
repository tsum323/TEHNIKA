import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/paths";
import type { EquipmentCategory } from "@/types/equipment";
import { Icon } from "./Icon";

interface CategoryCardProps {
  category: EquipmentCategory;
  /** Адрес страницы категории. */
  href: string;
  /** Дополнительная строка, например количество моделей. */
  meta?: string;
}

/** Карточка категории техники. Вся карточка — одна ссылка. */
export function CategoryCard({ category, href, meta }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card transition-[box-shadow,border-color] duration-200 hover:border-graphite-900 hover:shadow-card-hover"
    >
      <div className="aspect-[4/3] overflow-hidden bg-graphite-900">
        <Image
          src={asset(category.image)}
          alt={category.imageAlt}
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <h3 className="text-h3">{category.name}</h3>
          <p className="mt-2 text-sm text-muted">{category.description}</p>
          {meta && <p className="mt-3 text-overline text-graphite-700 uppercase">{meta}</p>}
        </div>
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-control bg-signal text-graphite-950 transition-transform duration-200 group-hover:translate-x-1"
        >
          <Icon name="arrowRight" />
        </span>
      </div>
    </Link>
  );
}
