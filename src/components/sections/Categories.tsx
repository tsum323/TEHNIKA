import { categories, equipment } from "@/content/equipment";
import { home } from "@/content/home";
import { plural } from "@/lib/format";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { Section, SectionHeading } from "@/components/ui/Section";

/** Шесть категорий техники. Пока каталога нет, карточки ведут к популярной технике. */
export function Categories() {
  return (
    <Section id="categories" tone="light" aria-labelledby="categories-title">
      <SectionHeading
        id="categories-title"
        eyebrow={home.categories.eyebrow}
        title={home.categories.title}
        description={home.categories.description}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {categories.map((category) => {
          const count = equipment.filter((item) => item.categoryId === category.id).length;
          return (
            <li key={category.id}>
              <CategoryCard
                category={category}
                href="/#popular"
                meta={`${count} ${plural(count, ["модель", "модели", "моделей"])} в примерах`}
              />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
