import type { Metadata } from "next";
import { catalog } from "@/content/catalog";
import { routes } from "@/lib/routes";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { ContactCta } from "@/components/sections/ContactCta";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: catalog.index.title,
  description: catalog.index.description,
};

/** Каталог: все категории техники. */
export default function CatalogPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Главная", href: routes.home }, { label: catalog.index.eyebrow }]}
        eyebrow={catalog.index.eyebrow}
        title={catalog.index.title}
        description={[catalog.index.description]}
      />
      <Section tone="light" aria-label="Категории техники">
        <CategoryGrid />
      </Section>
      <ContactCta />
    </>
  );
}
