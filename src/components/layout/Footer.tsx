import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";

/**
 * Подвал сайта.
 * Ссылки на юридические документы (политика конфиденциальности, оферта) добавим,
 * когда будут готовы реальные документы — фиктивные страницы не создаём.
 */
export function Footer() {
  const { contacts, navigation } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark bg-graphite-950 text-white">
      <div aria-hidden="true" className="hazard-stripes h-1.5" />
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-16">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-muted-inverse">{site.description}</p>
        </div>

        <nav aria-label="Навигация в подвале">
          <h2 className="text-overline text-steel-400 uppercase">Разделы</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {navigation.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-steel-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-overline text-steel-400 uppercase">Контакты</h2>
          <ul className="mt-4 flex flex-col gap-3 text-steel-300">
            <li>
              <a href={`tel:${contacts.phoneHref}`} className="inline-flex items-center gap-3 font-semibold text-white hover:text-signal">
                <Icon name="phone" className="size-4 text-signal" />
                {contacts.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contacts.email}`} className="inline-flex items-center gap-3 hover:text-white">
                <Icon name="mail" className="size-4 text-signal" />
                {contacts.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="pin" className="mt-1 size-4 shrink-0 text-signal" />
              {contacts.address}
            </li>
            <li className="flex items-start gap-3">
              <Icon name="clock" className="mt-1 size-4 shrink-0 text-signal" />
              {contacts.workingHours}
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-sm text-muted-inverse md:flex-row md:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>Цены на сайте указаны для ознакомления и не являются публичной офертой.</p>
        </Container>
      </div>
    </footer>
  );
}
