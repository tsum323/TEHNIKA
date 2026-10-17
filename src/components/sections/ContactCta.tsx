import { home } from "@/content/home";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

/**
 * Финальный блок с контактами.
 * Форма заявки с отправкой данных появится в отдельном задании,
 * поэтому сейчас клиент связывается по телефону или почте.
 */
export function ContactCta() {
  const { contacts } = site;
  const items: { icon: IconName; label: string; value: string; href?: string }[] = [
    { icon: "phone", label: "Телефон", value: contacts.phone, href: `tel:${contacts.phoneHref}` },
    { icon: "mail", label: "Электронная почта", value: contacts.email, href: `mailto:${contacts.email}` },
    { icon: "pin", label: "Адрес", value: contacts.address },
    { icon: "clock", label: "График работы", value: contacts.workingHours },
  ];

  return (
    <Section id="contacts" tone="dark" aria-labelledby="contacts-title" className="relative overflow-hidden">
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
        <div>
          <p className="mb-4 flex items-center gap-3 text-overline text-signal uppercase">
            <span aria-hidden="true" className="h-0.5 w-8 bg-signal" />
            {home.contacts.eyebrow}
          </p>
          <h2 id="contacts-title" className="text-h1 text-balance">
            {home.contacts.title}
          </h2>
          <p className="mt-5 max-w-xl text-lead text-muted-inverse">{home.contacts.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`tel:${contacts.phoneHref}`} size="lg">
              <Icon name="phone" />
              Позвонить
            </ButtonLink>
            <ButtonLink href={`mailto:${contacts.email}`} variant="ghost" size="lg">
              <Icon name="mail" />
              Написать на почту
            </ButtonLink>
          </div>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.label} className="bg-graphite-800 p-6">
              <Icon name={item.icon} className="size-5 text-signal" />
              <p className="mt-4 text-sm text-muted-inverse">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="mt-1 block font-bold break-words hover:text-signal">
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 font-bold">{item.value}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
