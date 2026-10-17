import Image from "next/image";
import { getCategory } from "@/content/equipment";
import { formatPrice, plural } from "@/lib/format";
import { asset } from "@/lib/paths";
import type { Equipment } from "@/types/equipment";
import { Badge } from "./Badge";
import { ButtonLink } from "./Button";

interface EquipmentCardProps {
  item: Equipment;
  /** Куда ведёт кнопка. Пока страниц техники нет — к блоку контактов. */
  href?: string;
  /** Сколько характеристик показать (по умолчанию 3). */
  maxSpecs?: number;
}

/** Карточка единицы техники: изображение, характеристики, цена и кнопка. */
export function EquipmentCard({ item, href = "/#contacts", maxSpecs = 3 }: EquipmentCardProps) {
  const category = getCategory(item.categoryId);
  const shifts = `${item.minOrderShifts} ${plural(item.minOrderShifts, ["смена", "смены", "смен"])}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite-900">
        <Image
          src={asset(item.image)}
          alt={item.imageAlt}
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {category && <Badge variant="signal">{category.name}</Badge>}
          {item.isDemo && <Badge variant="dark">Демо</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-h3">{item.name}</h3>

        <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
          {item.specs.slice(0, maxSpecs).map((spec) => (
            <div key={spec.label} className="flex justify-between gap-4 py-2">
              <dt className="text-muted">{spec.label}</dt>
              <dd className="text-right font-semibold">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-5">
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-sm text-muted">от</span>
            <span className="text-2xl font-extrabold tracking-tight">{formatPrice(item.pricePerShift)}</span>
            <span className="text-sm text-muted">/ смена</span>
          </p>
          <p className="mt-1 text-sm text-muted">Минимальный заказ: {shifts}</p>
          <ButtonLink href={href} variant="secondary" fullWidth className="mt-5">
            Запросить аренду
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
