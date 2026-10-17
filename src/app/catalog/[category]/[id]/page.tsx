import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { catalog } from "@/content/catalog";
import { equipment, getCategory, getEquipment, getEquipmentByCategory } from "@/content/equipment";
import { site } from "@/content/site";
import { formatPrice, plural } from "@/lib/format";
import { asset } from "@/lib/paths";
import { categoryHref, routes } from "@/lib/routes";
import { ContactCta } from "@/components/sections/ContactCta";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EquipmentCard } from "@/components/ui/EquipmentCard";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

interface EquipmentPageProps {
  params: Promise<{ category: string; id: string }>;
}

// Страницы создаются при сборке только для техники из src/content/equipment.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return equipment.map((item) => ({ category: item.categoryId, id: item.id }));
}

export async function generateMetadata({ params }: EquipmentPageProps): Promise<Metadata> {
  const { category, id } = await params;
  const item = getEquipment(category, id);
  if (!item) return {};
  const specs = item.specs.map((spec) => `${spec.label.toLowerCase()} ${spec.value}`).join(", ");
  return {
    title: `${item.name} — аренда`,
    description: `Аренда: ${item.name}. ${specs}. Цена от ${formatPrice(item.pricePerShift)} за смену.`,
  };
}

/** Страница одной машины: фото, цена, все характеристики, условия и похожие модели. */
export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const { category: categoryId, id } = await params;
  const item = getEquipment(categoryId, id);
  const category = getCategory(categoryId);
  if (!item || !category) notFound();

  const texts = catalog.equipment;
  const others = getEquipmentByCategory(category.id).filter((other) => other.id !== item.id);
  const shifts = `${item.minOrderShifts} ${plural(item.minOrderShifts, ["смена", "смены", "смен"])}`;
  const description = item.description ?? category.intro[0];

  return (
    <>
      <div className="surface-dark blueprint-grid bg-graphite-900 text-white">
        <Container className="py-10 md:py-14 lg:py-16">
          <Breadcrumbs
            inverse
            items={[
              { label: "Главная", href: routes.home },
              { label: "Каталог", href: routes.catalog },
              { label: category.name, href: categoryHref(category.id) },
              { label: item.name },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div className="overflow-hidden rounded-card border border-white/10 shadow-2xl shadow-black/40">
              <Image
                src={asset(item.image)}
                alt={item.imageAlt}
                width={800}
                height={600}
                priority
                className="aspect-[4/3] h-auto w-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2">
                <Badge variant="signal">{category.name}</Badge>
                {item.isDemo && <Badge variant="outline" className="border-white/30 text-steel-300">Демонстрационные данные</Badge>}
              </div>
              <h1 className="mt-5 text-h1 text-balance">{item.name}</h1>
              <p className="mt-4 text-lead text-steel-300">{description}</p>

              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10">
                <div className="bg-graphite-800 p-5">
                  <dt className="text-sm text-muted-inverse">Цена за смену</dt>
                  <dd className="mt-1 text-xl font-extrabold whitespace-nowrap sm:text-2xl">от {formatPrice(item.pricePerShift)}</dd>
                </div>
                <div className="bg-graphite-800 p-5">
                  <dt className="text-sm text-muted-inverse">Минимальный заказ</dt>
                  <dd className="mt-1 text-xl font-extrabold sm:text-2xl">{shifts}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-muted-inverse">{texts.priceNote}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto lg:pt-8">
                <ButtonLink href="#contacts" size="lg">
                  {texts.requestButton}
                </ButtonLink>
                <ButtonLink href={`tel:${site.contacts.phoneHref}`} variant="ghost" size="lg">
                  <Icon name="phone" />
                  {texts.callButton}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Section aria-label={`${texts.specsTitle} и ${texts.termsTitle.toLowerCase()}`}>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="rounded-card border border-border bg-white p-6 shadow-card md:p-8">
            <h2 className="text-h3">{texts.specsTitle}</h2>
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {item.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-right font-semibold">{spec.value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-muted">Категория</dt>
                <dd className="text-right font-semibold">{category.name}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-card border border-border bg-surface p-6 md:p-8">
              <h2 className="text-h3">{texts.termsTitle}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {texts.terms.map((term) => (
                  <li key={term} className="flex items-start gap-3 text-sm">
                    <Icon name="document" className="mt-0.5 size-4 shrink-0 text-graphite-700" />
                    {term}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-dark rounded-card bg-graphite-900 p-6 text-white md:p-8">
              <h2 className="text-h3">{catalog.category.checklistTitle}</h2>
              <ol className="mt-5 flex flex-col gap-3">
                {category.requestChecklist.map((point, index) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-signal text-xs font-bold text-graphite-950">
                      {index + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="light" aria-labelledby="other-models-title">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="other-models-title" className="text-h2">
              {texts.otherModelsTitle}
            </h2>
            <ButtonLink href={categoryHref(category.id)} variant="ghost" className="self-start sm:self-auto">
              {texts.backToCategory}
            </ButtonLink>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {others.map((other) => (
              <li key={other.id}>
                <EquipmentCard item={other} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ContactCta defaultCategory={category.id} defaultEquipment={item.id} />
    </>
  );
}
