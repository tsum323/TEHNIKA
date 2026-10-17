import type { CategoryId, ClientKind, PaymentDirection, PaymentMethod, RequestSource, RequestStatus, StaffRole } from "@/types/db";

/** Русские названия для значений из базы. */

export const categoryLabels: Record<CategoryId, string> = {
  excavators: "Экскаваторы",
  "backhoe-loaders": "Экскаваторы-погрузчики",
  "truck-cranes": "Автокраны",
  "dump-trucks": "Самосвалы",
  rollers: "Катки",
  "wheel-loaders": "Фронтальные погрузчики",
};

export const statusLabels: Record<RequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  confirmed: "Подтверждена",
  completed: "Выполнена",
  cancelled: "Отменена",
};

/** Порядок статусов в фильтрах и списках. */
export const statusOrder: RequestStatus[] = ["new", "in_progress", "confirmed", "completed", "cancelled"];

export const sourceLabels: Record<RequestSource, string> = {
  site: "Сайт",
  phone: "Звонок",
  messenger: "Мессенджер",
  repeat: "Повторный клиент",
  other: "Другое",
};

export const clientKindLabels: Record<ClientKind, string> = {
  company: "Организация",
  person: "Частное лицо",
};

export const paymentDirectionLabels: Record<PaymentDirection, string> = {
  incoming: "От клиента",
  outgoing: "Поставщику / расходы",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank: "Безнал",
  cash: "Наличные",
  card: "Карта",
  other: "Другое",
};

export const roleLabels: Record<StaffRole, string> = {
  owner: "Владелец",
  manager: "Менеджер",
};

/** Превращает словарь подписей в варианты для выпадающего списка. */
export function toOptions<T extends string>(labels: Record<T, string>, order?: T[]) {
  const keys = order ?? (Object.keys(labels) as T[]);
  return keys.map((value) => ({ value, label: labels[value] }));
}
