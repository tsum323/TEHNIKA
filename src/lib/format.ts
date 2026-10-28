/** Форматирует цену: 25000 → "25 000 ₽". Пробелы неразрывные — цена не переносится по частям. */
export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)}\u00A0₽`;
}

/** Склонение слова по числу: plural(2, ["час", "часа", "часов"]) → "часа". */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

/** Часы с правильным окончанием: 1 → "1 час", 4 → "4 часа", 8 → "8 часов". */
export function formatHours(n: number): string {
  return `${n} ${plural(n, ["час", "часа", "часов"])}`;
}
