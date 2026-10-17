import { home } from "@/content/home";
import { site } from "@/content/site";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";

// Иконки по порядку преимуществ из src/content/site.ts. Если преимуществ больше — иконки повторяются.
const icons: IconName[] = ["user", "target", "document", "building"];

/** Преимущества сервиса — нейтральные формулировки без неподтверждённых цифр. */
export function Advantages() {
  return (
    <Section id="advantages" aria-labelledby="advantages-title">
      <SectionHeading
        id="advantages-title"
        eyebrow={home.advantages.eyebrow}
        title={home.advantages.title}
        description={site.description}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:gap-6">
        {site.advantages.map((advantage, index) => (
          <li
            key={advantage.title}
            className="flex gap-5 rounded-card border border-border bg-white p-6 shadow-card md:p-8"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-graphite-900 text-signal">
              <Icon name={icons[index % icons.length]} className="size-6" />
            </span>
            <div>
              <h3 className="text-h3">{advantage.title}</h3>
              <p className="mt-2 text-muted">{advantage.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
