import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalog } from "@/content/catalog";
import { categories, getCategory, getEquipmentByCategory, getMinPrice } from "@/content/equipment";
import { formatHours, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { SpecsTable } from "@/components/catalog/SpecsTable";
import { ContactCta } from "@/components/sections/ContactCta";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EquipmentCard } from "@/components/ui/EquipmentCard";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section, SectionHeading } from "@/components/ui/Section";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Сайт статический: страницы создаются при сборке только для категорий из src/content/equipment.ts.
// Любой другой адрес в /catalog/... покажет страницу 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return {};
  return {
    title: `${category.name} в аренду`,
    description: `${category.name} в аренду в Краснодарском крае. ${category.description}`,
  };
}

/** Страница категории: описание, модели, сравнение характеристик и подсказки для заявки. */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategory((await params).category);
  if (!category) notFound();

  const items = getEquipmentByCategory(category.id);
  const minPrice = getMinPrice(category.id);
  const texts = catalog.category;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Главная", href: routes.home },
          { label: "Каталог", href: routes.catalog },
          { label: category.name },
        ]}
        eyebrow="Аренда техники"
        title={category.name}
        description={category.intro}
        aside={
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10">
            <div className="bg-graphite-800 p-5">
              <dt className="text-sm text-muted-inverse">Моделей</dt>
              <dd className="mt-1 text-2xl font-extrabold">{items.length}</dd>
            </div>
            <div className="bg-graphite-800 p-5">
              <dt className="text-sm text-muted-inverse">Цена за час</dt>
              <dd className="mt-1 text-2xl font-extrabold">{minPrice !== undefined ? `от ${formatPrice(minPrice)}` : "—"}</dd>
            </div>
            <div className="col-span-2 bg-graphite-800 p-5">
              <dt className="text-sm text-muted-inverse">Минимальный заказ</dt>
              <dd className="mt-1 text-2xl font-extrabold">{formatHours(category.minOrderHours ?? 1)}</dd>
            </div>
            <div className="col-span-2 bg-graphite-800 p-5">
              <ButtonLink href="#contacts" fullWidth>
                Запросить аренду
              </ButtonLink>
            </div>
          </dl>
        }
      />

      <Section aria-labelledby="models-title">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="models-title" title={texts.modelsTitle} description={texts.modelsNote} className="md:mb-14" />
          <div className="mb-10 md:mb-14">
            <Badge variant="outline">Демонстрационные данные</Badge>
          </div>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item) => (
            <li key={item.id}>
              <EquipmentCard item={item} maxSpecs={item.specs.length} />
            </li>
          ))}
        </ul>

        {items.length > 1 && (
          <div className="mt-16">
            <h2 className="mb-6 text-h3">{texts.compareTitle}</h2>
            <SpecsTable items={items} caption={`${texts.compareTitle}: ${category.name.toLowerCase()}`} />
          </div>
        )}
      </Section>

      <Section tone="light" aria-label={`${texts.applicationsTitle} и ${texts.checklistTitle.toLowerCase()}`}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-white p-6 shadow-card md:p-8">
            <h2 className="text-h3">{texts.applicationsTitle}</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {category.applications.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Icon name="check" className="mt-0.5 size-5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-dark rounded-card bg-graphite-900 p-6 text-white md:p-8">
            <h2 className="text-h3">{texts.checklistTitle}</h2>
            <p className="mt-2 text-sm text-muted-inverse">{texts.checklistNote}</p>
            <ol className="mt-6 flex flex-col gap-3">
              {category.requestChecklist.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-signal text-xs font-bold text-graphite-950">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section aria-labelledby="other-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading id="other-title" title={texts.otherTitle} className="sm:mb-10 md:mb-10" />
          <ButtonLink href={routes.catalog} variant="ghost" className="mb-10 self-start sm:self-auto">
            {catalog.allCatalogButton}
          </ButtonLink>
        </div>
        <CategoryGrid exclude={category.id} />
      </Section>

      <ContactCta defaultCategory={category.id} />
    </>
  );
}
