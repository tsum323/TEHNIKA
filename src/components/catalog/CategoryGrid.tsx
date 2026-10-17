import { categories, getEquipmentByCategory, getMinPrice } from "@/content/equipment";
import { categoryHref } from "@/lib/routes";
import { formatPrice, plural } from "@/lib/format";
import { CategoryCard } from "@/components/ui/CategoryCard";
import type { CategoryId } from "@/types/equipment";

interface CategoryGridProps {
  /** Не показывать эту категорию (например, текущую). */
  exclude?: CategoryId;
}

/** Сетка карточек категорий со ссылками на страницы категорий. */
export function CategoryGrid({ exclude }: CategoryGridProps) {
  const items = categories.filter((category) => category.id !== exclude);

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {items.map((category) => {
        const count = getEquipmentByCategory(category.id).length;
        const minPrice = getMinPrice(category.id);
        const meta = [
          `${count} ${plural(count, ["модель", "модели", "моделей"])}`,
          minPrice !== undefined ? `от ${formatPrice(minPrice)}` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={category.id}>
            <CategoryCard category={category} href={categoryHref(category.id)} meta={meta} />
          </li>
        );
      })}
    </ul>
  );
}
