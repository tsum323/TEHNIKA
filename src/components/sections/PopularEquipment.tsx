import { getFeaturedEquipment } from "@/content/equipment";
import { home } from "@/content/home";
import { Badge } from "@/components/ui/Badge";
import { EquipmentCard } from "@/components/ui/EquipmentCard";
import { Section, SectionHeading } from "@/components/ui/Section";

/** Популярная техника — карточки из демонстрационных данных. */
export function PopularEquipment() {
  const items = getFeaturedEquipment();

  return (
    <Section id="popular" aria-labelledby="popular-title">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="popular-title"
          eyebrow={home.popular.eyebrow}
          title={home.popular.title}
          description={home.popular.description}
          className="md:mb-14"
        />
        <div className="mb-10 md:mb-14">
          <Badge variant="outline">{home.popular.demoNote}</Badge>
        </div>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {items.map((item) => (
          <li key={item.id}>
            <EquipmentCard item={item} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
