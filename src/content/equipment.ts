// ВРЕМЕННЫЕ ДАННЫЕ — заменить на реальные
//
// Категории и единицы техники — ДЕМОНСТРАЦИОННЫЕ. Названия, характеристики и цены
// придуманы для примера и не являются предложением компании.
//
// В этом файле хранятся только публичные данные. Закупочные цены, поставщики
// и внутренняя экономика сюда НЕ добавляются: всё, что здесь лежит, попадает в браузер.
//
// Чтобы заменить заглушку на фотографию: положите файл в public/ (например,
// public/equipment/excavator-01.jpg) и укажите путь "/equipment/excavator-01.jpg" в поле image.

import type { CategoryId, Equipment, EquipmentCategory } from "@/types/equipment";

export const categories: EquipmentCategory[] = [
  {
    id: "excavators",
    name: "Экскаваторы",
    description: "Котлованы, траншеи, планировка и погрузка грунта.",
    image: "/placeholders/excavator.svg",
    imageAlt: "Схематичное изображение гусеничного экскаватора",
    intro: [
      "Экскаватор — основная машина для земляных работ. Гусеничные модели устойчивы на мягком и неровном грунте, колёсные быстрее перемещаются между участками и меньше повреждают покрытие.",
      "Масса машины, объём ковша и глубина копания подбираются под объём грунта, размеры котлована и условия на площадке.",
    ],
    applications: [
      "Рытьё котлованов под фундаменты",
      "Траншеи под коммуникации",
      "Планировка и выравнивание участка",
      "Погрузка грунта в самосвалы",
      "Демонтаж с навесным оборудованием",
    ],
    requestChecklist: [
      "Вид работ и примерный объём грунта",
      "Глубина и ширина котлована или траншеи",
      "Тип грунта и подъезд к площадке",
      "Нужно ли навесное оборудование",
    ],
  },
  {
    id: "backhoe-loaders",
    name: "Экскаваторы-погрузчики",
    description: "Универсальная техника для коммуникаций и благоустройства.",
    image: "/placeholders/backhoe-loader.svg",
    imageAlt: "Схематичное изображение экскаватора-погрузчика",
    intro: [
      "Экскаватор-погрузчик совмещает две машины: спереди — ковш погрузчика, сзади — экскаваторная стрела. Подходит для объектов, где нужно и копать, и перемещать материал.",
      "Компактные размеры позволяют работать во дворах, на узких улицах и небольших участках.",
    ],
    applications: [
      "Прокладка и ремонт коммуникаций",
      "Благоустройство и озеленение",
      "Небольшие котлованы и ямы",
      "Погрузка и перемещение сыпучих материалов",
      "Работы с гидромолотом",
    ],
    requestChecklist: [
      "Вид и объём работ",
      "Размеры площадки и проезда",
      "Нужен ли гидромолот или другое навесное",
      "Продолжительность работ",
    ],
  },
  {
    id: "truck-cranes",
    name: "Автокраны",
    description: "Подъём и монтаж конструкций, разгрузка материалов.",
    image: "/placeholders/truck-crane.svg",
    imageAlt: "Схематичное изображение автокрана",
    intro: [
      "Автокран — самоходный кран на шасси грузовика. Быстро приезжает на объект и разворачивается для подъёма и монтажа грузов.",
      "Модель выбирают по массе груза, вылету стрелы и высоте подъёма с учётом места установки крана.",
    ],
    applications: [
      "Монтаж металлоконструкций и ЖБИ",
      "Разгрузка и погрузка материалов",
      "Подъём оборудования на высоту",
      "Установка опор, блоков и контейнеров",
    ],
    requestChecklist: [
      "Масса и габариты самого тяжёлого груза",
      "Расстояние от места установки крана до груза",
      "Высота подъёма",
      "Наличие места для выносных опор",
    ],
  },
  {
    id: "dump-trucks",
    name: "Самосвалы",
    description: "Перевозка грунта, песка, щебня и строительного мусора.",
    image: "/placeholders/dump-truck.svg",
    imageAlt: "Схематичное изображение самосвала",
    intro: [
      "Самосвалы перевозят сыпучие материалы и сами разгружают кузов. Это основной транспорт для вывоза грунта и доставки нерудных материалов на объект.",
      "Объём кузова и колёсную формулу подбирают по количеству груза, расстоянию и состоянию дорог.",
    ],
    applications: [
      "Вывоз грунта с котлована",
      "Доставка песка, щебня, ПГС",
      "Вывоз строительного мусора",
      "Работа в паре с экскаватором или погрузчиком",
    ],
    requestChecklist: [
      "Вид груза и примерный объём",
      "Адреса погрузки и выгрузки",
      "Количество рейсов или машин",
      "Ограничения по проезду и тоннажу",
    ],
  },
  {
    id: "rollers",
    name: "Катки",
    description: "Уплотнение грунта, щебня и асфальта.",
    image: "/placeholders/roller.svg",
    imageAlt: "Схематичное изображение дорожного катка",
    intro: [
      "Катки уплотняют грунт, песок, щебень и асфальт. От качества уплотнения зависит прочность основания дороги, площадки или фундамента.",
      "Грунтовые катки тяжелее и работают с вибрацией, тандемные асфальтовые имеют два гладких вальца для ровного покрытия.",
    ],
    applications: [
      "Уплотнение основания под дороги и площадки",
      "Укатка щебня и песка",
      "Укладка асфальта",
      "Подготовка основания под фундамент",
    ],
    requestChecklist: [
      "Материал для уплотнения",
      "Площадь участка",
      "Толщина слоёв",
      "Сроки и время работы",
    ],
  },
  {
    id: "wheel-loaders",
    name: "Фронтальные погрузчики",
    description: "Погрузка сыпучих материалов, расчистка площадок.",
    image: "/placeholders/wheel-loader.svg",
    imageAlt: "Схематичное изображение фронтального погрузчика",
    intro: [
      "Фронтальный погрузчик загружает, перемещает и разгружает сыпучие материалы. Отличается высокой производительностью на открытых площадках.",
      "Мини-погрузчики подходят для тесных пространств, большие модели — для работы с крупными объёмами.",
    ],
    applications: [
      "Погрузка сыпучих материалов в самосвалы",
      "Расчистка и планировка площадок",
      "Перемещение материалов по объекту",
      "Уборка снега и мусора",
    ],
    requestChecklist: [
      "Вид материала и объём",
      "Размеры площадки и проездов",
      "Высота борта, на который нужна погрузка",
      "Продолжительность работ",
    ],
  },
];

export const equipment: Equipment[] = [
  // Экскаваторы
  {
    id: "excavator-crawler-22t",
    name: "Гусеничный экскаватор 22 т (демо)",
    categoryId: "excavators",
    specs: [
      { label: "Масса", value: "22 т" },
      { label: "Объём ковша", value: "1,0 м³" },
      { label: "Глубина копания", value: "6,5 м" },
      { label: "Ход", value: "Гусеничный" },
    ],
    pricePerShift: 25000,
    minOrderShifts: 1,
    image: "/placeholders/excavator.svg",
    imageAlt: "Заглушка: гусеничный экскаватор",
    featured: true,
    isDemo: true,
  },
  {
    id: "excavator-wheeled-16t",
    name: "Колёсный экскаватор 16 т (демо)",
    categoryId: "excavators",
    specs: [
      { label: "Масса", value: "16 т" },
      { label: "Объём ковша", value: "0,7 м³" },
      { label: "Глубина копания", value: "5,5 м" },
      { label: "Ход", value: "Колёсный" },
    ],
    pricePerShift: 22000,
    minOrderShifts: 1,
    image: "/placeholders/excavator.svg",
    imageAlt: "Заглушка: колёсный экскаватор",
    isDemo: true,
  },

  // Экскаваторы-погрузчики
  {
    id: "backhoe-loader-8t",
    name: "Экскаватор-погрузчик 8 т (демо)",
    categoryId: "backhoe-loaders",
    specs: [
      { label: "Масса", value: "8 т" },
      { label: "Ковш погрузчика", value: "1,0 м³" },
      { label: "Ковш экскаватора", value: "0,2 м³" },
      { label: "Глубина копания", value: "4,2 м" },
    ],
    pricePerShift: 16000,
    minOrderShifts: 1,
    image: "/placeholders/backhoe-loader.svg",
    imageAlt: "Заглушка: экскаватор-погрузчик",
    featured: true,
    isDemo: true,
  },
  {
    id: "backhoe-loader-hammer",
    name: "Экскаватор-погрузчик с гидромолотом (демо)",
    categoryId: "backhoe-loaders",
    specs: [
      { label: "Масса", value: "8,5 т" },
      { label: "Навесное", value: "Гидромолот" },
      { label: "Ковш погрузчика", value: "1,1 м³" },
    ],
    pricePerShift: 19000,
    minOrderShifts: 1,
    image: "/placeholders/backhoe-loader.svg",
    imageAlt: "Заглушка: экскаватор-погрузчик с гидромолотом",
    isDemo: true,
  },

  // Автокраны
  {
    id: "truck-crane-25t",
    name: "Автокран 25 т (демо)",
    categoryId: "truck-cranes",
    specs: [
      { label: "Грузоподъёмность", value: "25 т" },
      { label: "Длина стрелы", value: "28 м" },
      { label: "Колёсная формула", value: "6×4" },
    ],
    pricePerShift: 28000,
    minOrderShifts: 1,
    image: "/placeholders/truck-crane.svg",
    imageAlt: "Заглушка: автокран 25 тонн",
    featured: true,
    isDemo: true,
  },
  {
    id: "truck-crane-50t",
    name: "Автокран 50 т (демо)",
    categoryId: "truck-cranes",
    specs: [
      { label: "Грузоподъёмность", value: "50 т" },
      { label: "Длина стрелы", value: "40 м" },
      { label: "Колёсная формула", value: "8×4" },
      { label: "Гусёк", value: "Есть" },
    ],
    pricePerShift: 45000,
    minOrderShifts: 1,
    image: "/placeholders/truck-crane.svg",
    imageAlt: "Заглушка: автокран 50 тонн",
    isDemo: true,
  },

  // Самосвалы
  {
    id: "dump-truck-20m3",
    name: "Самосвал 20 м³ (демо)",
    categoryId: "dump-trucks",
    specs: [
      { label: "Объём кузова", value: "20 м³" },
      { label: "Грузоподъёмность", value: "25 т" },
      { label: "Колёсная формула", value: "6×4" },
    ],
    pricePerShift: 18000,
    minOrderShifts: 1,
    image: "/placeholders/dump-truck.svg",
    imageAlt: "Заглушка: самосвал 20 кубометров",
    featured: true,
    isDemo: true,
  },
  {
    id: "dump-truck-10m3",
    name: "Самосвал 10 м³ (демо)",
    categoryId: "dump-trucks",
    specs: [
      { label: "Объём кузова", value: "10 м³" },
      { label: "Грузоподъёмность", value: "15 т" },
      { label: "Колёсная формула", value: "6×6" },
    ],
    pricePerShift: 15000,
    minOrderShifts: 1,
    image: "/placeholders/dump-truck.svg",
    imageAlt: "Заглушка: самосвал 10 кубометров",
    isDemo: true,
  },

  // Катки
  {
    id: "roller-soil-12t",
    name: "Грунтовый каток 12 т (демо)",
    categoryId: "rollers",
    specs: [
      { label: "Масса", value: "12 т" },
      { label: "Ширина вальца", value: "2,1 м" },
      { label: "Тип вальца", value: "Гладкий" },
      { label: "Вибрация", value: "Есть" },
    ],
    pricePerShift: 17000,
    minOrderShifts: 1,
    image: "/placeholders/roller.svg",
    imageAlt: "Заглушка: грунтовый каток",
    featured: true,
    isDemo: true,
  },
  {
    id: "roller-asphalt-tandem",
    name: "Асфальтовый тандемный каток (демо)",
    categoryId: "rollers",
    specs: [
      { label: "Масса", value: "4 т" },
      { label: "Ширина вальца", value: "1,3 м" },
      { label: "Вальцы", value: "Два" },
    ],
    pricePerShift: 14000,
    minOrderShifts: 1,
    image: "/placeholders/roller.svg",
    imageAlt: "Заглушка: тандемный асфальтовый каток",
    isDemo: true,
  },

  // Фронтальные погрузчики
  {
    id: "wheel-loader-3m3",
    name: "Фронтальный погрузчик 3 м³ (демо)",
    categoryId: "wheel-loaders",
    specs: [
      { label: "Объём ковша", value: "3 м³" },
      { label: "Грузоподъёмность", value: "5 т" },
      { label: "Высота выгрузки", value: "3,1 м" },
    ],
    pricePerShift: 20000,
    minOrderShifts: 1,
    image: "/placeholders/wheel-loader.svg",
    imageAlt: "Заглушка: фронтальный погрузчик",
    featured: true,
    isDemo: true,
  },
  {
    id: "wheel-loader-mini",
    name: "Мини-погрузчик (демо)",
    categoryId: "wheel-loaders",
    specs: [
      { label: "Объём ковша", value: "0,5 м³" },
      { label: "Грузоподъёмность", value: "1 т" },
      { label: "Ширина", value: "1,7 м" },
    ],
    pricePerShift: 12000,
    minOrderShifts: 2,
    image: "/placeholders/wheel-loader.svg",
    imageAlt: "Заглушка: мини-погрузчик",
    isDemo: true,
  },
];

/** Найти категорию по идентификатору. */
export function getCategory(id: string): EquipmentCategory | undefined {
  return categories.find((category) => category.id === id);
}

/** Вся техника одной категории. */
export function getEquipmentByCategory(id: CategoryId): Equipment[] {
  return equipment.filter((item) => item.categoryId === id);
}

/** Минимальная цена за смену в категории (для подписи «от N ₽»). */
export function getMinPrice(id: CategoryId): number | undefined {
  const prices = getEquipmentByCategory(id).map((item) => item.pricePerShift);
  return prices.length > 0 ? Math.min(...prices) : undefined;
}

/** Техника для блока «Популярная техника» на главной. */
export function getFeaturedEquipment(): Equipment[] {
  return equipment.filter((item) => item.featured);
}
