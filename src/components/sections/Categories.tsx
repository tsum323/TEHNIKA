import { catalog } from "@/content/catalog";
import { home } from "@/content/home";
import { routes } from "@/lib/routes";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";

/** Шесть категорий техники — каждая ведёт на свою страницу в каталоге. */
export function Categories() {
  return (
    <Section id="categories" tone="light" aria-labelledby="categories-title">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="categories-title"
          eyebrow={home.categories.eyebrow}
          title={home.categories.title}
          description={home.categories.description}
          className="md:mb-14"
        />
        <ButtonLink href={routes.catalog} variant="secondary" className="mb-10 self-start md:mb-14 md:self-auto">
          {catalog.allCatalogButton}
          <Icon name="arrowRight" />
        </ButtonLink>
      </div>
      <CategoryGrid />
    </Section>
  );
}
