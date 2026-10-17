import { home } from "@/content/home";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";

/** География работы: регион и список городов из src/content/site.ts. */
export function Geography() {
  return (
    <Section id="geography" tone="light" aria-labelledby="geography-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <SectionHeading
            id="geography-title"
            eyebrow={home.geography.eyebrow}
            title={site.region}
            description={home.geography.description}
            className="mb-8 md:mb-8"
          />
          <ButtonLink href="/#contacts" variant="secondary">
            {home.geography.button}
          </ButtonLink>
        </div>

        <div className="rounded-card border border-border bg-white p-6 shadow-card md:p-8">
          <h3 className="flex items-center gap-2 text-overline text-graphite-700 uppercase">
            <Icon name="pin" className="size-4" />
            {home.geography.listTitle}
          </h3>
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-1 min-[420px]:grid-cols-2 md:grid-cols-3">
            {site.cities.map((city) => (
              <li key={city} className="flex items-center gap-3 border-b border-border py-3 font-medium">
                <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-signal" />
                {city}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
