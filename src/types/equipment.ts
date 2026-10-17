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
  /** 3–5 основных характеристик. */
  specs: EquipmentSpec[];
  /** Публичная цена за смену в рублях (минимальная, «от»). */
  pricePerShift: number;
  /** Минимальный срок заказа в сменах. */
  minOrderShifts: number;
  image: string;
  imageAlt: string;
  /** Показывать в блоке «Популярная техника» на главной. */
  featured?: boolean;
  /** true — данные демонстрационные и требуют замены. */
  isDemo: boolean;
}
