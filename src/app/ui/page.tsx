import type { Metadata } from "next";
import type { ReactNode } from "react";
import { categories, equipment } from "@/content/equipment";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { Container } from "@/components/ui/Container";
import { EquipmentCard } from "@/components/ui/EquipmentCard";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

/**
 * Служебная страница дизайн-системы: /ui
 * Не индексируется поисковиками и не связана с публичной навигацией.
 */
export const metadata: Metadata = {
  title: "Дизайн-система",
  robots: { index: false, follow: false },
};

const colors = [
  { group: "Графитовый", tokens: ["graphite-950", "graphite-900", "graphite-800", "graphite-700", "graphite-600"] },
  { group: "Стальной", tokens: ["steel-500", "steel-400", "steel-300", "steel-200"] },
  { group: "Фон", tokens: ["surface", "white"] },
  { group: "Акцент", tokens: ["signal", "signal-hover", "signal-pressed"] },
  { group: "Текст и границы", tokens: ["ink", "muted", "muted-inverse", "border", "border-strong"] },
  { group: "Состояния", tokens: ["error", "error-bg", "success", "success-bg"] },
];

const typeScale = [
  { name: "text-display", sample: "Аренда техники", className: "text-display" },
  { name: "text-h1", sample: "Заголовок первого уровня", className: "text-h1" },
  { name: "text-h2", sample: "Заголовок секции", className: "text-h2" },
  { name: "text-h3", sample: "Заголовок карточки", className: "text-h3" },
  { name: "text-lead", sample: "Вводный текст для подзаголовков и описаний секций.", className: "text-lead" },
  { name: "text-body", sample: "Основной текст. Съешь же ещё этих мягких французских булок, да выпей чаю.", className: "text-body" },
  { name: "text-caption", sample: "Подпись, пояснение или примечание к цене.", className: "text-caption text-muted" },
  { name: "text-overline", sample: "Надпись над заголовком", className: "text-overline uppercase" },
];

const spacing = [
  { name: "Отступы секции", value: "py-16 / md:py-24 (64 / 96 px)", width: "w-24" },
  { name: "Внутренний отступ карточки", value: "p-5 / sm:p-6 (20 / 24 px)", width: "w-6" },
  { name: "Промежуток в сетке карточек", value: "gap-5 / lg:gap-6 (20 / 24 px)", width: "w-5" },
  { name: "Боковые отступы контейнера", value: "px-4 / sm:px-6 / lg:px-8 (16 / 24 / 32 px)", width: "w-8" },
];

const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }));

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-border py-12 first:border-t-0 md:py-16">
      <h2 id={id} className="mb-8 text-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function UiPage() {
  return (
    <>
      <div className="surface-dark bg-graphite-900 py-14 text-white md:py-20">
        <Container>
          <Badge variant="signal">Служебная страница</Badge>
          <h1 className="mt-5 text-h1">Дизайн-система</h1>
          <p className="mt-4 max-w-2xl text-lead text-muted-inverse">
            Цвета, типографика и компоненты сайта. Страница не индексируется поисковиками и не
            показывается в навигации.
          </p>
        </Container>
      </div>

      <Container>
        <Block id="ui-colors" title="Цвета">
          <div className="grid gap-8">
            {colors.map((group) => (
              <div key={group.group}>
                <h3 className="mb-3 text-overline text-graphite-700 uppercase">{group.group}</h3>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {group.tokens.map((token) => (
                    <li key={token} className="overflow-hidden rounded-card border border-border">
                      <div className="h-16" style={{ backgroundColor: `var(--color-${token})` }} />
                      <p className="px-3 py-2 font-mono text-xs">{token}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>

        <Block id="ui-type" title="Типографика">
          <p className="mb-6 text-muted">Шрифт Manrope (кириллица и латиница). Размеры адаптивные.</p>
          <ul className="divide-y divide-border">
            {typeScale.map((item) => (
              <li key={item.name} className="grid gap-2 py-5 md:grid-cols-[12rem_1fr] md:items-baseline">
                <code className="font-mono text-xs text-muted">{item.name}</code>
                <p className={item.className}>{item.sample}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="ui-buttons" title="Кнопки">
          <div className="grid gap-8">
            <div>
              <h3 className="mb-4 text-h3">Варианты и размеры</h3>
              <div className="grid gap-4">
                {(["primary", "secondary", "ghost"] as const).map((variant) => (
                  <div key={variant} className="flex flex-wrap items-center gap-3">
                    <code className="w-24 font-mono text-xs text-muted">{variant}</code>
                    <Button variant={variant} size="sm">Маленькая</Button>
                    <Button variant={variant} size="md">Средняя</Button>
                    <Button variant={variant} size="lg">Большая</Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-h3">Состояния</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Недоступна</Button>
                <Button variant="secondary" disabled>Недоступна</Button>
                <Button loading>Отправка</Button>
                <Button variant="secondary" loading>Загрузка</Button>
                <Button variant="ghost" loading>Загрузка</Button>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-h3">С иконкой и ссылкой</h3>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/">
                  На главную
                  <Icon name="arrowRight" />
                </ButtonLink>
                <ButtonLink href="tel:+70000000000" variant="secondary">
                  <Icon name="phone" />
                  Позвонить
                </ButtonLink>
              </div>
            </div>
            <div className="surface-dark rounded-card bg-graphite-900 p-6 text-white">
              <h3 className="mb-4 text-h3">На тёмном фоне</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Основная</Button>
                <Button variant="ghost">Прозрачная</Button>
                <Button variant="ghost" disabled>Недоступна</Button>
              </div>
            </div>
          </div>
        </Block>

        <Block id="ui-badges" title="Метки">
          <div className="flex flex-wrap gap-3">
            <Badge>Нейтральная</Badge>
            <Badge variant="signal">Экскаваторы</Badge>
            <Badge variant="dark">Демо</Badge>
            <Badge variant="outline">Контурная</Badge>
            <Badge variant="success">
              <Icon name="check" className="size-3" />
              Доступно
            </Badge>
            <Badge variant="error">
              <Icon name="alert" className="size-3" />
              Ошибка
            </Badge>
          </div>
        </Block>

        <Block id="ui-cards" title="Карточки">
          <h3 className="mb-4 text-h3">Карточка техники</h3>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {equipment.slice(0, 3).map((item) => (
              <li key={item.id}>
                <EquipmentCard item={item} />
              </li>
            ))}
          </ul>
          <h3 className="mt-12 mb-4 text-h3">Карточка категории</h3>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {categories.slice(0, 3).map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} href="/ui" meta="Пример подписи" />
              </li>
            ))}
          </ul>
        </Block>

        <Block id="ui-forms" title="Поля формы">
          <p className="mb-8 text-muted">
            Поля не отправляют данные — это только внешний вид. Отправка заявок появится в отдельном задании.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="Имя" placeholder="Как к вам обращаться" autoComplete="off" />
            <Input label="Телефон" type="tel" placeholder="+7 (___) ___-__-__" hint="Только для примера" required autoComplete="off" />
            <Input label="Электронная почта" type="email" defaultValue="неверный адрес" error="Введите адрес в формате name@example.com" autoComplete="off" />
            <Input label="Недоступное поле" placeholder="Нельзя изменить" disabled />
            <Select label="Категория техники" placeholder="Выберите категорию" options={categoryOptions} defaultValue="" />
            <Select label="Категория с ошибкой" placeholder="Выберите категорию" options={categoryOptions} defaultValue="" error="Выберите категорию техники" required />
            <Textarea label="Описание задачи" placeholder="Вид работ, адрес объекта, даты" hint="Чем подробнее, тем точнее расчёт" />
            <Textarea label="Комментарий с ошибкой" error="Поле не может быть пустым" required />
          </div>
        </Block>

        <Block id="ui-spacing" title="Отступы и контейнеры">
          <ul className="grid gap-4">
            {spacing.map((item) => (
              <li key={item.name} className="flex flex-wrap items-center gap-4 rounded-card border border-border p-4">
                <span aria-hidden="true" className={`h-6 ${item.width} hazard-stripes`} />
                <span className="font-semibold">{item.name}</span>
                <code className="font-mono text-xs text-muted">{item.value}</code>
              </li>
            ))}
          </ul>
          <h3 className="mt-10 mb-4 text-h3">Контейнер</h3>
          <p className="mb-4 text-muted">Максимальная ширина контента — 1216 px. Жёлтая рамка показывает границы контейнера.</p>
        </Block>
      </Container>

      <div className="bg-surface py-8">
        <Container className="outline-2 outline-signal outline-dashed">
          <div className="rounded-card bg-white p-6 text-center text-sm text-muted">Container</div>
        </Container>
      </div>

      <Section tone="light" className="border-t border-border">
        <SectionHeading
          eyebrow="Компонент Section"
          title="Пример секции со светлым фоном"
          description="Секции бывают белыми, светлыми и графитовыми. Отступы сверху и снизу одинаковые на всём сайте."
          className="mb-0 md:mb-0"
        />
      </Section>
      <Section tone="dark">
        <SectionHeading
          eyebrow="Компонент Section"
          title="Пример тёмной секции"
          description="На тёмном фоне фокус клавиатуры подсвечивается жёлтым."
          inverse
          className="mb-0 md:mb-0"
        />
      </Section>
    </>
  );
}
