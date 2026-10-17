import { requestForm } from "@/content/form";
import { isCompletePhone } from "@/lib/phone";
import type { RequestFormErrors, RequestFormValues } from "@/types/form";

export const COMMENT_MAX_LENGTH = 1000;

export const emptyRequestForm: RequestFormValues = {
  name: "",
  phone: "",
  category: "",
  equipment: "",
  address: "",
  startDate: "",
  shifts: "",
  comment: "",
};

/** Сегодняшняя дата в формате поля даты: "2026-10-17" (по местному времени). */
function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Проверяет форму и возвращает ошибки по полям. Пустой объект — ошибок нет. */
export function validateRequestForm(values: RequestFormValues): RequestFormErrors {
  const { errors: text } = requestForm;
  const errors: RequestFormErrors = {};

  if (values.name.trim().length < 2) errors.name = text.nameRequired;

  if (!values.phone.trim()) errors.phone = text.phoneRequired;
  else if (!isCompletePhone(values.phone)) errors.phone = text.phoneInvalid;

  if (!values.category) errors.category = text.categoryRequired;

  // Строки вида "2026-10-17" сравниваются как даты.
  if (values.startDate && values.startDate < today()) errors.startDate = text.startDatePast;

  if (values.shifts.trim()) {
    const shifts = Number(values.shifts);
    if (!Number.isInteger(shifts) || shifts < 1 || shifts > 365) errors.shifts = text.shiftsInvalid;
  }

  if (values.comment.length > COMMENT_MAX_LENGTH) errors.comment = text.commentTooLong;

  return errors;
}
