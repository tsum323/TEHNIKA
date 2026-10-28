import { categories, equipment, getCategory, getEquipmentByCategory, getMinPrice } from "@/content/equipment";
import { formatPrice, plural } from "@/lib/format";
import { categoryHref, equipmentHref } from "@/lib/routes";

/** Одна строка в подсказках поиска: категория или конкретная машина. */
export interface SearchItem {
  kind: "category" | "equipment";
  title: string;
  /** Вторая строка: категория и цена или количество моделей. */
  subtitle: string;
  href: string;
  /** Подготовленный текст, по которому ищем (см. normalize). */
  haystack: string;
}

/** Приводит текст к виду для сравнения: регистр, ё → е, «×» → «x», запятая в числах → точка. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/×/g, "x")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/[«»"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Собирает список для поиска из публичных данных каталога.
 * Вызывается при сборке страницы — в браузер попадают только поля SearchItem.
 */
export function buildSearchIndex(): SearchItem[] {
  const categoryItems: SearchItem[] = categories.map((category) => {
    const count = getEquipmentByCategory(category.id).length;
    const minPrice = getMinPrice(category.id);
    return {
      kind: "category",
      title: category.name,
      subtitle: [
        `${count} ${plural(count, ["модель", "модели", "моделей"])}`,
        minPrice !== undefined ? `от ${formatPrice(minPrice)} за смену` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      href: categoryHref(category.id),
      haystack: normalize(
        [category.name, category.description, ...category.applications, ...(category.searchKeywords ?? [])].join(" "),
      ),
    };
  });

  const equipmentItems: SearchItem[] = equipment.map((item) => {
    const category = getCategory(item.categoryId);
    return {
      kind: "equipment",
      // «(демо)» в названии не помогает искать и только занимает место в подсказке
      title: item.name.replace(/\s*\(демо\)\s*$/i, ""),
      subtitle: [category?.name, `от ${formatPrice(item.pricePerShift)} за смену`].filter(Boolean).join(" · "),
      href: equipmentHref(item),
      haystack: normalize(
        [
          item.name,
          ...item.specs.map((spec) => `${spec.label} ${spec.value}`),
          category?.name,
          ...(category?.searchKeywords ?? []),
        ].join(" "),
      ),
    };
  });

  return [...categoryItems, ...equipmentItems];
}

/** Слово запроса найдено в тексте. Длинные слова пробуем и без окончания: «экскаваторов» → «экскаватор». */
function matchesWord(haystack: string, word: string): boolean {
  if (haystack.includes(word)) return true;
  for (const cut of [1, 2]) {
    const stem = word.slice(0, -cut);
    if (stem.length >= 4 && haystack.includes(stem)) return true;
  }
  return false;
}

/** Ищет подходящие строки: все слова запроса должны встретиться. Сначала то, что совпало с названием. */
export function searchCatalog(index: SearchItem[], query: string, limit = 8): SearchItem[] {
  const words = normalize(query)
    // «25т» → «25 т»: так совпадёт с характеристикой «25 т»
    .replace(/(\d)([a-zа-я])/g, "$1 $2")
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return [];

  return index
    .filter((item) => words.every((word) => matchesWord(item.haystack, word)))
    .map((item) => {
      const title = normalize(item.title);
      let score = 0;
      if (title.startsWith(words[0])) score += 4;
      score += words.filter((word) => title.includes(word)).length * 2;
      if (item.kind === "category") score += 1;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
