import { home } from "@/content/home";
import { site } from "@/content/site";
import { RequestForm } from "@/components/forms/RequestForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

interface ContactCtaProps {
  /** Заранее выбранная категория в форме заявки. */
  defaultCategory?: string;
  /** Заранее выбранная модель в форме заявки. */
  defaultEquipment?: string;
}

/** Финальный блок: контакты и форма заявки (форма пока демонстрационная, без отправки). */
export function ContactCta({ defaultCategory, defaultEquipment }: ContactCtaProps) {
  const { contacts } = site;
  const items: { icon: IconName; label: string; value: string; href?: string }[] = [
    { icon: "phone", label: "Телефон", value: contacts.phone, href: `tel:${contacts.phoneHref}` },
    { icon: "mail", label: "Электронная почта", value: contacts.email, href: `mailto:${contacts.email}` },
    { icon: "pin", label: "Адрес", value: contacts.address },
    { icon: "clock", label: "График работы", value: contacts.workingHours },
  ];

  return (
    <Section id="contacts" tone="dark" aria-labelledby="contacts-title" className="relative overflow-hidden">
      <div className="relative grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div>
          <p className="mb-4 flex items-center gap-3 text-overline text-signal uppercase">
            <span aria-hidden="true" className="h-0.5 w-8 bg-signal" />
            {home.contacts.eyebrow}
          </p>
          <h2 id="contacts-title" className="text-h1 text-balance">
            {home.contacts.title}
          </h2>
          <p className="mt-5 max-w-xl text-lead text-muted-inverse">{home.contacts.description}</p>

          <ul className="mt-10 flex flex-col divide-y divide-white/10 border-y border-white/10">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-graphite-800 text-signal">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-muted-inverse">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-bold break-words hover:text-signal">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-bold">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-light rounded-card bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-8">
          <RequestForm defaultCategory={defaultCategory} defaultEquipment={defaultEquipment} />
        </div>
      </div>
    </Section>
  );
}
