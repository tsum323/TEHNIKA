/**
 * Маска российского номера телефона.
 *
 * Клиент вводит только цифры, а скобки, пробелы и дефисы подставляются сами:
 *   «8» в начале  → 8 (988) 620-12-69
 *   «7» или «+7»  → +7 (988) 620-12-69
 *   любая другая цифра (например, сразу «9») → считаем, что это номер без кода страны, и дописываем +7
 */

/** Длина номера без кода страны: 988 620 12 69. */
const LOCAL_LENGTH = 10;

/** Разбирает ввод на код страны («+7» или «8») и цифры номера (не больше 10). */
function splitPhone(input: string): { prefix: "+7" | "8"; local: string } | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  const first = digits[0];
  if (first === "8") return { prefix: "8", local: digits.slice(1, 1 + LOCAL_LENGTH) };
  if (first === "7") return { prefix: "+7", local: digits.slice(1, 1 + LOCAL_LENGTH) };
  return { prefix: "+7", local: digits.slice(0, LOCAL_LENGTH) };
}

/** Форматирует ввод по шаблону. Неполный номер форматируется частично: "+7 (988) 62". */
export function formatPhone(input: string): string {
  // Пользователь начал вводить с «+» — оставляем его, пока нет цифр.
  if (input.trim() === "+") return "+";
  const parts = splitPhone(input);
  if (!parts) return "";

  const { prefix, local } = parts;
  let result = prefix;
  if (local.length > 0) result += ` (${local.slice(0, 3)}`;
  if (local.length >= 3) result += ")";
  if (local.length > 3) result += ` ${local.slice(3, 6)}`;
  if (local.length > 6) result += `-${local.slice(6, 8)}`;
  if (local.length > 8) result += `-${local.slice(8, 10)}`;
  return result;
}

/**
 * Обработка ввода в поле телефона с учётом удаления.
 * Если пользователь стёр скобку, пробел или дефис, цифры не изменились бы и маска
 * вернула бы символ обратно — поэтому в этом случае стираем последнюю цифру.
 */
export function nextPhoneValue(previous: string, raw: string, isDeletion: boolean): string {
  const formatted = formatPhone(raw);
  if (isDeletion && formatted === previous && raw.length < previous.length) {
    const digits = previous.replace(/\D/g, "").slice(0, -1);
    if (!digits) return "";
    // Сохраняем выбранный код страны, даже если осталась только его цифра.
    return previous.startsWith("8") ? formatPhone(digits) : formatPhone(`+${digits}`);
  }
  return formatted;
}

/** Номер введён полностью: код страны и 10 цифр. */
export function isCompletePhone(input: string): boolean {
  const parts = splitPhone(input);
  return parts !== null && parts.local.length === LOCAL_LENGTH;
}
