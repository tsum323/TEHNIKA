import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
};

/**
 * Страница 404. При статической сборке Next.js сохраняет её как out/404.html —
 * GitHub Pages показывает этот файл для любого несуществующего адреса.
 */
export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="surface-dark blueprint-grid relative flex min-h-[70vh] items-center overflow-hidden bg-graphite-900 py-20 text-white"
    >
      <Container>
        <div aria-hidden="true" className="hazard-stripes mb-10 h-2 w-32" />
        <p className="text-[clamp(5rem,3rem+10vw,10rem)] leading-none font-extrabold tracking-tighter text-signal tabular-nums">
          404
        </p>
        <h1 id="not-found-title" className="mt-6 text-h1 text-balance">
          Страница не найдена
        </h1>
        <p className="mt-4 max-w-xl text-lead text-muted-inverse">
          Возможно, адрес набран с ошибкой или страница была перемещена. Вернитесь на главную —
          там есть вся информация о технике и контакты.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            На главную
            <Icon name="arrowRight" />
          </ButtonLink>
          <ButtonLink href={`tel:${site.contacts.phoneHref}`} variant="ghost" size="lg">
            <Icon name="phone" />
            {site.contacts.phone}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
