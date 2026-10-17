"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { db } from "@/lib/db";
import { requestMoney } from "@/lib/finance";
import { formatMoney, formatPercent, parseNumber } from "@/lib/format";
import { categoryLabels, sourceLabels, statusLabels, statusOrder, toOptions } from "@/lib/labels";
import { nextPhoneValue } from "@/lib/phone";
import type { CategoryId, RentalRequest, RequestCost, RequestSource, RequestStatus } from "@/types/db";
import { Button } from "./ui/Button";
import { Dialog } from "./ui/Dialog";
import { SelectField, TextAreaField, TextField } from "./ui/Field";
import { ErrorNote } from "./ui/Page";

interface RequestDialogProps {
  /** Заявка для редактирования; null — новая заявка. */
  request: RentalRequest | null;
  open: boolean;
  onClose(): void;
}

interface FormState {
  contact_name: string;
  contact_phone: string;
  client_id: string;
  source: RequestSource;
  status: RequestStatus;
  category: string;
  equipment_id: string;
  start_date: string;
  shifts: string;
  client_price_per_shift: string;
  address: string;
  comment: string;
  // Финансы — только владелец
  supplier_id: string;
  cost_per_shift: string;
  extra_costs: string;
  cost_notes: string;
}

const str = (value: number | null | undefined) => (value == null ? "" : String(value));

function initialState(request: RentalRequest | null, cost: RequestCost | undefined): FormState {
  return {
    contact_name: request?.contact_name ?? "",
    contact_phone: request?.contact_phone ?? "",
    client_id: request?.client_id ?? "",
    source: request?.source ?? "phone",
    status: request?.status ?? "new",
    category: request?.category ?? "",
    equipment_id: request?.equipment_id ?? "",
    start_date: request?.start_date ?? "",
    shifts: str(request?.shifts),
    client_price_per_shift: str(request?.client_price_per_shift),
    address: request?.address ?? "",
    comment: request?.comment ?? "",
    supplier_id: cost?.supplier_id ?? "",
    cost_per_shift: str(cost?.cost_per_shift),
    extra_costs: cost?.extra_costs ? String(cost.extra_costs) : "",
    cost_notes: cost?.notes ?? "",
  };
}

/** Окно создания и редактирования заявки. Ключ (key) у родителя сбрасывает форму при открытии другой заявки. */
export function RequestDialog({ request, open, onClose }: RequestDialogProps) {
  const { isOwner } = useAuth();
  const { data, refresh } = useData();
  const existingCost = request ? data.request_costs.find((c) => c.request_id === request.id) : undefined;
  const [form, setForm] = useState<FormState>(() => initialState(request, existingCost));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }));

  const equipmentOptions = data.equipment
    .filter((item) => !form.category || item.category === form.category)
    .map((item) => ({ value: item.id, label: item.name }));

  // Поставщики, у которых есть эта техника, — первыми и с ценой.
  const supplierOptions = useMemo(() => {
    const offers = data.supplier_offers.filter((o) => o.equipment_id === form.equipment_id);
    const withOffer = offers
      .sort((a, b) => a.cost_per_shift - b.cost_per_shift)
      .map((o) => {
        const supplier = data.suppliers.find((s) => s.id === o.supplier_id);
        return { value: o.supplier_id, label: `${supplier?.name ?? "?"} — ${formatMoney(o.cost_per_shift)}/смена` };
      });
    const others = data.suppliers.filter((s) => !offers.some((o) => o.supplier_id === s.id)).map((s) => ({ value: s.id, label: s.name }));
    return [...withOffer, ...others];
  }, [data.supplier_offers, data.suppliers, form.equipment_id]);

  function chooseClient(clientId: string) {
    const client = data.clients.find((c) => c.id === clientId);
    setForm((prev) => ({
      ...prev,
      client_id: clientId,
      contact_name: prev.contact_name || client?.name || "",
      contact_phone: prev.contact_phone || client?.phone || "",
    }));
  }

  function chooseEquipment(equipmentId: string) {
    const item = data.equipment.find((e) => e.id === equipmentId);
    const best = data.supplier_offers.filter((o) => o.equipment_id === equipmentId).sort((a, b) => a.cost_per_shift - b.cost_per_shift)[0];
    setForm((prev) => ({
      ...prev,
      equipment_id: equipmentId,
      category: item?.category ?? prev.category,
      client_price_per_shift: prev.client_price_per_shift || str(item?.client_price_per_shift),
      supplier_id: prev.supplier_id || best?.supplier_id || "",
      cost_per_shift: prev.cost_per_shift || str(best?.cost_per_shift),
    }));
  }

  function chooseSupplier(supplierId: string) {
    const offer = data.supplier_offers.find((o) => o.supplier_id === supplierId && o.equipment_id === form.equipment_id);
    setForm((prev) => ({ ...prev, supplier_id: supplierId, cost_per_shift: offer ? String(offer.cost_per_shift) : prev.cost_per_shift }));
  }

  // Предварительный расчёт денег по текущим значениям формы.
  const shifts = parseNumber(form.shifts);
  const preview = requestMoney(
    { shifts, client_price_per_shift: parseNumber(form.client_price_per_shift) } as RentalRequest,
    form.cost_per_shift ? ({ cost_per_shift: parseNumber(form.cost_per_shift) ?? 0, extra_costs: parseNumber(form.extra_costs) ?? 0 } as RequestCost) : undefined,
  );

  function validate() {
    const next: typeof errors = {};
    if (!form.contact_name.trim()) next.contact_name = "Укажите имя или название клиента";
    if (form.shifts && (!Number.isInteger(shifts) || (shifts ?? 0) < 1)) next.shifts = "Целое число от 1";
    for (const field of ["client_price_per_shift", "cost_per_shift", "extra_costs"] as const) {
      const value = parseNumber(form[field]);
      if (form[field] && (value == null || value < 0)) next[field] = "Введите сумму числом";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    const row: Partial<RentalRequest> = {
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone,
      client_id: form.client_id || null,
      source: form.source,
      status: form.status,
      category: (form.category || null) as CategoryId | null,
      equipment_id: form.equipment_id || null,
      start_date: form.start_date || null,
      shifts,
      client_price_per_shift: parseNumber(form.client_price_per_shift),
      address: form.address,
      comment: form.comment,
    };
    try {
      let id = request?.id;
      if (id) await db.update("requests", { id }, row);
      else id = (await db.insert("requests", row)).id;

      if (isOwner) {
        const hasCost = form.supplier_id || form.cost_per_shift || form.extra_costs || form.cost_notes;
        if (hasCost) {
          await db.upsert("request_costs", {
            request_id: id,
            supplier_id: form.supplier_id || null,
            cost_per_shift: parseNumber(form.cost_per_shift) ?? 0,
            extra_costs: parseNumber(form.extra_costs) ?? 0,
            notes: form.cost_notes,
          });
        } else if (existingCost) {
          await db.remove("request_costs", { request_id: id });
        }
      }
      await refresh(["requests", "request_costs"]);
      onClose();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Не удалось сохранить.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!request || !window.confirm(`Удалить заявку №${request.number}? Это действие нельзя отменить.`)) return;
    setSaving(true);
    try {
      await db.remove("requests", { id: request.id });
      await refresh(["requests", "request_costs"]);
      onClose();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Не удалось удалить.");
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={request ? `Заявка №${request.number}` : "Новая заявка"}
      footer={
        <>
          {request && isOwner && (
            <Button variant="danger" onClick={() => void remove()} disabled={saving} className="mr-auto">
              Удалить
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={() => void save()} loading={saving}>
            Сохранить
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {saveError && <ErrorNote>{saveError}</ErrorNote>}

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-bold tracking-wide text-muted uppercase">Клиент</legend>
          <SelectField
            label="Клиент из базы"
            placeholder="— не выбран —"
            options={data.clients.map((c) => ({ value: c.id, label: c.name }))}
            value={form.client_id}
            onChange={(e) => chooseClient(e.target.value)}
            className="sm:col-span-2"
          />
          <TextField label="Имя или организация" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} error={errors.contact_name} required />
          <TextField
            label="Телефон"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={form.contact_phone}
            onChange={(e) => {
              const isDeletion = (e.nativeEvent as InputEvent).inputType?.startsWith("delete") ?? false;
              set("contact_phone", nextPhoneValue(form.contact_phone, e.target.value, isDeletion));
            }}
          />
          <SelectField label="Откуда заявка" options={toOptions(sourceLabels)} value={form.source} onChange={(e) => set("source", e.target.value as RequestSource)} />
          <SelectField label="Статус" options={toOptions(statusLabels, statusOrder)} value={form.status} onChange={(e) => set("status", e.target.value as RequestStatus)} />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-bold tracking-wide text-muted uppercase">Аренда</legend>
          <SelectField
            label="Категория"
            placeholder="— любая —"
            options={toOptions(categoryLabels)}
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, equipment_id: "" }))}
          />
          <SelectField label="Техника" placeholder="— не выбрана —" options={equipmentOptions} value={form.equipment_id} onChange={(e) => chooseEquipment(e.target.value)} />
          <TextField label="Дата начала" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          <TextField label="Смен" type="number" inputMode="numeric" min={1} value={form.shifts} onChange={(e) => set("shifts", e.target.value)} error={errors.shifts} />
          <TextField
            label="Цена для клиента за смену, ₽"
            type="number"
            inputMode="decimal"
            min={0}
            value={form.client_price_per_shift}
            onChange={(e) => set("client_price_per_shift", e.target.value)}
            error={errors.client_price_per_shift}
          />
          <TextField label="Адрес объекта" value={form.address} onChange={(e) => set("address", e.target.value)} />
          <TextAreaField label="Комментарий" value={form.comment} onChange={(e) => set("comment", e.target.value)} className="sm:col-span-2" />
        </fieldset>

        {isOwner && (
          <fieldset className="grid gap-4 rounded-card border border-signal/60 bg-signal/5 p-4 sm:grid-cols-2">
            <legend className="px-1 text-sm font-bold tracking-wide text-muted uppercase">Финансы — видит только владелец</legend>
            <SelectField label="Поставщик" placeholder="— не выбран —" options={supplierOptions} value={form.supplier_id} onChange={(e) => chooseSupplier(e.target.value)} className="sm:col-span-2" />
            <TextField
              label="Закупочная цена за смену, ₽"
              type="number"
              inputMode="decimal"
              min={0}
              value={form.cost_per_shift}
              onChange={(e) => set("cost_per_shift", e.target.value)}
              error={errors.cost_per_shift}
            />
            <TextField
              label="Доп. расходы, ₽"
              hint="Доставка, топливо и т. п."
              type="number"
              inputMode="decimal"
              min={0}
              value={form.extra_costs}
              onChange={(e) => set("extra_costs", e.target.value)}
              error={errors.extra_costs}
            />
            <TextField label="Заметка по расходам" value={form.cost_notes} onChange={(e) => set("cost_notes", e.target.value)} className="sm:col-span-2" />
            <dl className="grid grid-cols-2 gap-3 rounded-control bg-white p-4 text-sm sm:col-span-2 sm:grid-cols-4">
              <MoneyCell label="Выручка" value={preview.revenue != null ? formatMoney(preview.revenue) : "—"} />
              <MoneyCell label="Расходы" value={preview.cost != null ? formatMoney(preview.cost) : "—"} />
              <MoneyCell
                label="Прибыль"
                value={preview.profit != null ? formatMoney(preview.profit) : "—"}
                tone={preview.profit == null ? undefined : preview.profit >= 0 ? "positive" : "negative"}
              />
              <MoneyCell label="Наценка" value={preview.markup != null ? formatPercent(preview.markup) : "—"} />
            </dl>
          </fieldset>
        )}
      </div>
    </Dialog>
  );
}

function MoneyCell({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className={`mt-0.5 font-bold tabular-nums ${tone === "positive" ? "text-success" : tone === "negative" ? "text-error" : ""}`}>{value}</dd>
    </div>
  );
}
