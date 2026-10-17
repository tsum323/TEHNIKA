"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { categories, equipment } from "@/content/equipment";
import { requestForm as text } from "@/content/form";
import { site } from "@/content/site";
import { nextPhoneValue } from "@/lib/phone";
import { COMMENT_MAX_LENGTH, emptyRequestForm, validateRequestForm } from "@/lib/requestForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { RequestFormErrors, RequestFormField, RequestFormValues } from "@/types/form";

interface RequestFormProps {
  /** Заранее выбранная категория (на странице категории или машины). */
  defaultCategory?: string;
  /** Заранее выбранная модель (на странице машины). */
  defaultEquipment?: string;
}

// Порядок полей — для перехода к первому полю с ошибкой.
const fieldOrder: RequestFormField[] = ["name", "phone", "category", "equipment", "address", "startDate", "shifts", "comment"];

/**
 * Форма заявки на аренду.
 *
 * ДЕМОНСТРАЦИОННЫЙ РЕЖИМ: форма проверяет заполнение прямо в браузере,
 * но никуда не отправляет и не сохраняет данные (нет запросов к серверу, нет localStorage).
 */
export function RequestForm({ defaultCategory = "", defaultEquipment = "" }: RequestFormProps) {
  const initial: RequestFormValues = { ...emptyRequestForm, category: defaultCategory, equipment: defaultEquipment };
  const [values, setValues] = useState<RequestFormValues>(initial);
  const [errors, setErrors] = useState<RequestFormErrors>({});
  // После первой попытки отправки ошибки пересчитываются при каждом изменении.
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }));
  const equipmentOptions = [
    { value: "", label: text.anyEquipment },
    ...equipment
      .filter((item) => item.categoryId === values.category)
      .map((item) => ({ value: item.id, label: item.name })),
  ];

  function update(field: RequestFormField, value: string) {
    const next = { ...values, [field]: value };
    // При смене категории сбрасываем модель — она могла относиться к другой категории.
    if (field === "category") next.equipment = "";
    setValues(next);
    if (submitted) setErrors(validateRequestForm(next));
  }

  const bind = (field: RequestFormField) => ({
    name: field,
    value: values[field],
    error: errors[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(field, event.target.value),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validateRequestForm(values);
    setErrors(nextErrors);

    const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      const element = formRef.current?.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
      return;
    }

    // Здесь в будущем будет отправка заявки. Сейчас данные не покидают браузер.
    setDone(true);
    requestAnimationFrame(() => successRef.current?.focus());
  }

  function reset() {
    setValues(initial);
    setErrors({});
    setSubmitted(false);
    setDone(false);
  }

  const errorCount = Object.keys(errors).length;

  if (done) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="flex flex-col items-start outline-none">
        <span className="flex size-12 items-center justify-center rounded-control bg-success-bg text-success">
          <Icon name="check" className="size-6" />
        </span>
        <h3 className="mt-5 text-h3">{text.success.title}</h3>
        <p className="mt-3 text-muted">{text.success.text}</p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <ButtonLink href={`tel:${site.contacts.phoneHref}`} size="lg">
            <Icon name="phone" />
            {site.contacts.phone}
          </ButtonLink>
          <Button variant="ghost" size="lg" onClick={reset}>
            {text.success.resetButton}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} aria-labelledby="request-form-title">
      <h3 id="request-form-title" className="text-h3">
        {text.title}
      </h3>
      <p className="mt-2 text-sm text-muted">{text.description}</p>

      {submitted && errorCount > 0 && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-control bg-error-bg px-4 py-3 text-sm font-semibold text-error">
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          {text.errorsSummary}
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input {...bind("name")} label={text.labels.name} placeholder={text.placeholders.name} autoComplete="name" required />
        <Input
          {...bind("phone")}
          onChange={(event) => {
            const isDeletion = (event.nativeEvent as InputEvent).inputType?.startsWith("delete") ?? false;
            update("phone", nextPhoneValue(values.phone, event.target.value, isDeletion));
          }}
          label={text.labels.phone}
          placeholder={text.placeholders.phone}
          hint={text.hints.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
        />
        <Select
          {...bind("category")}
          label={text.labels.category}
          placeholder={text.categoryPlaceholder}
          options={categoryOptions}
          required
        />
        <Select
          {...bind("equipment")}
          label={text.labels.equipment}
          hint={text.hints.equipment}
          options={equipmentOptions}
          disabled={!values.category}
        />
        <Input
          {...bind("address")}
          label={text.labels.address}
          placeholder={text.placeholders.address}
          autoComplete="street-address"
          className="sm:col-span-2"
        />
        <Input {...bind("startDate")} label={text.labels.startDate} hint={text.hints.startDate} type="date" />
        <Input
          {...bind("shifts")}
          label={text.labels.shifts}
          placeholder={text.placeholders.shifts}
          hint={text.hints.shifts}
          type="number"
          inputMode="numeric"
          min={1}
          max={365}
        />
        <Textarea
          {...bind("comment")}
          label={text.labels.comment}
          placeholder={text.placeholders.comment}
          hint={`${values.comment.length} / ${COMMENT_MAX_LENGTH}`}
          className="sm:col-span-2"
        />
      </div>

      <Button type="submit" size="lg" fullWidth className="mt-6">
        {text.submitButton}
      </Button>
      <p className="mt-3 flex items-start gap-2 text-xs text-muted">
        <Icon name="alert" className="mt-0.5 size-3.5 shrink-0" />
        {text.demoNote}
      </p>
    </form>
  );
}
