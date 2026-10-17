import Image from "next/image";
import { categories } from "@/content/equipment";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { asset } from "@/lib/paths";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

/** Первый экран главной страницы. */
export function Hero() {
  const { contacts } = site;
  const facts = [
    `${categories.length} категорий техники`,
    "Для компаний и частных заказчиков",
    `Работаем по региону: ${site.region}`,
  ];

  return (
    <section aria-labelledby="hero-title" className="surface-dark relative overflow-hidden bg-graphite-900 text-white">
      <div aria-hidden="true" className="blueprint-grid absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-signal/10 blur-3xl"
      />

      <Container className="relative grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
        <div>
          <p className="mb-6 flex items-center gap-3 text-overline text-signal uppercase">
            <span aria-hidden="true" className="h-0.5 w-8 bg-signal" />
            {site.region}
          </p>
          <h1 id="hero-title" className="text-display text-balance">
            {home.hero.title} <span className="text-signal">{home.hero.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lead text-steel-300">{home.hero.subtitle}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.catalog} size="lg">
              {home.hero.primaryButton}
              <Icon name="arrowRight" />
            </ButtonLink>
            <ButtonLink href={`tel:${contacts.phoneHref}`} variant="ghost" size="lg">
              <Icon name="phone" />
              {home.hero.secondaryButton}
            </ButtonLink>
          </div>

          <ul className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            {facts.map((fact) => (
              <li key={fact} className="flex items-start gap-2.5 text-sm text-steel-300">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-signal" />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div aria-hidden="true" className="absolute -inset-3 -z-0 rounded-card border border-white/10" />
          <div className="relative overflow-hidden rounded-card border border-white/10 shadow-2xl shadow-black/40">
            <Image
              src={asset("/placeholders/hero.svg")}
              alt={home.hero.imageAlt}
              width={800}
              height={600}
              priority
              className="h-auto w-full"
            />
          </div>
          <div aria-hidden="true" className="absolute -bottom-3 -left-3 h-16 w-1.5 bg-signal" />
          <div aria-hidden="true" className="absolute -top-3 -right-3 h-1.5 w-16 bg-signal" />
        </div>
      </Container>
    </section>
  );
}
