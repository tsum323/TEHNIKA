/** Деньги: 25000 → "25 000 ₽". Пробел перед ₽ неразрывный. */
export function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value))} ₽`;
}

/** Процент: 0.284 → "28 %". */
export function formatPercent(ratio: number): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(ratio * 100)} %`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

/** Дата "2026-10-17" или ISO-время → "17.10.2026". */
export function formatDate(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

/** Короткая подпись месяца для графика: "окт", а у января и первого месяца — с годом ("янв\n2026"). */
export function formatMonthShort(key: string, withYear: boolean): string {
  const [y, m] = key.split("-").map(Number);
  const name = new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(new Date(y, m - 1, 1)).replace(".", "");
  return withYear || m === 1 ? `${name}\n${y}` : name;
}

/** "2026-10" → "окт 2026". */
export function formatMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const name = new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(new Date(y, m - 1, 1)).replace(".", "");
  return `${name} ${y}`;
}

export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

/** Число из поля ввода: "" → null, "12 500" → 12500. */
export function parseNumber(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
