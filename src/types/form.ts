/** Поля формы заявки. Все значения — строки, как их возвращают поля ввода. */
export interface RequestFormValues {
  name: string;
  phone: string;
  category: string;
  equipment: string;
  address: string;
  startDate: string;
  shifts: string;
  comment: string;
}

export type RequestFormField = keyof RequestFormValues;

/** Ошибки по полям: текст ошибки или отсутствие ключа, если поле заполнено верно. */
export type RequestFormErrors = Partial<Record<RequestFormField, string>>;

/** Тексты формы заявки. */
export interface RequestFormContent {
  title: string;
  description: string;
  labels: Record<RequestFormField, string>;
  placeholders: Partial<Record<RequestFormField, string>>;
  hints: Partial<Record<RequestFormField, string>>;
  anyEquipment: string;
  categoryPlaceholder: string;
  submitButton: string;
  errorsSummary: string;
  errors: {
    nameRequired: string;
    phoneRequired: string;
    phoneInvalid: string;
    categoryRequired: string;
    startDatePast: string;
    shiftsInvalid: string;
    commentTooLong: string;
  };
  success: {
    title: string;
    text: string;
    resetButton: string;
  };
  /** Пояснение, что форма пока демонстрационная. */
  demoNote: string;
}
