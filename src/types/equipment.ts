/**
 * Типы данных о технике.
 *
 * ВАЖНО: здесь описаны только ПУБЛИЧНЫЕ поля, которые можно показывать клиенту.
 * Закупочные цены, поставщики и внутренняя экономика сюда не добавляются никогда.
 */

/** Идентификаторы категорий. Используются в ссылках и связях техники с категорией. */
export type CategoryId =
  | "excavators"
  | "backhoe-loaders"
  | "truck-cranes"
  | "dump-trucks"
  | "rollers"
  | "wheel-loaders";

export interface EquipmentCategory {
  id: CategoryId;
  /** Название во множественном числе: «Экскаваторы». */
  name: string;
  /** Короткое описание для карточки категории. */
  description: string;
  /** Подробное описание для страницы категории (1–2 абзаца). */
  intro: string[];
  /** Для каких работ подходит техника. */
  applications: string[];
  /** Что уточнить при заявке — помогает быстрее подобрать машину. */
  requestChecklist: string[];
  /** Дополнительные слова для поиска: разговорные названия, марки, задачи. */
  searchKeywords?: string[];
  /** Минимальный заказ в часах для всей категории. Не указан — можно заказать от 1 часа. */
  minOrderHours?: number;
  /** Путь к изображению от папки public/, например "/placeholders/excavator.svg". */
  image: string;
  /** Текст для alt изображения. */
  imageAlt: string;
}

export interface EquipmentSpec {
  label: string;
  value: string;
}

export interface Equipment {
  /** Уникальный идентификатор — латиница, цифры и дефисы. */
  id: string;
  name: string;
  categoryId: CategoryId;
  /** Описание для страницы машины. Если не заполнено — берётся описание категории. */
  description?: string;
  /** 3–5 основных характеристик. */
  specs: EquipmentSpec[];
  /** Публичная цена за час работы в рублях (минимальная, «от»). */
  pricePerHour: number;
  /** Минимальный заказ в часах, если у этой машины он отличается от категории. */
  minOrderHours?: number;
  image: string;
  imageAlt: string;
  /** Показывать в блоке «Популярная техника» на главной. */
  featured?: boolean;
  /** true — данные демонстрационные и требуют замены. */
  isDemo: boolean;
}
