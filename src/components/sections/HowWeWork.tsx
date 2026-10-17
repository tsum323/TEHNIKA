import { home } from "@/content/home";
import { site } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";

/** Четыре шага работы с клиентом. */
export function HowWeWork() {
  return (
    <Section id="how-we-work" tone="dark" aria-labelledby="how-title" className="blueprint-grid">
      <SectionHeading
        id="how-title"
        eyebrow={home.howWeWork.eyebrow}
        title={home.howWeWork.title}
        description={home.howWeWork.description}
        inverse
      />
      <ol className="grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {site.workSteps.map((step, index) => (
          <li key={step.title} className="flex flex-col bg-graphite-900 p-6 md:p-8">
            <span aria-hidden="true" className="text-5xl font-extrabold tracking-tight text-signal tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 text-h3">
              <span className="sr-only">Шаг {index + 1}. </span>
              {step.title}
            </h3>
            <p className="mt-3 text-muted-inverse">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
