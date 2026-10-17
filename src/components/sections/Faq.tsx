import { home } from "@/content/home";
import { site } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";

/** Частые вопросы на нативных <details>/<summary> — работают без JavaScript и с клавиатуры. */
export function Faq() {
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <SectionHeading
          id="faq-title"
          eyebrow={home.faq.eyebrow}
          title={home.faq.title}
          description={home.faq.description}
          className="lg:mb-0"
        />
        <div className="border-t border-border">
          {site.faq.map((item) => (
            <details key={item.question} className="group border-b border-border">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-lg font-bold transition-colors hover:text-graphite-700 md:py-6">
                {item.question}
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-control border border-border-strong transition-[transform,background-color] duration-200 group-open:rotate-45 group-open:border-signal group-open:bg-signal"
                >
                  <Icon name="plus" className="size-4" />
                </span>
              </summary>
              <p className="max-w-3xl pb-6 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
