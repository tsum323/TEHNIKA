"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { db } from "@/lib/db";
import { hourMarkup } from "@/lib/finance";
import { formatMoney, formatPercent, parseNumber } from "@/lib/format";
import { categoryLabels, toOptions } from "@/lib/labels";
import type { CategoryId, Equipment } from "@/types/db";
import { Button } from "./ui/Button";
import { Dialog } from "./ui/Dialog";
import { CheckboxField, SelectField, TextAreaField, TextField } from "./ui/Field";
import { ErrorNote } from "./ui/Page";

interface Props {
  item: Equipment | null;
  onClose(): void;
}

export function EquipmentDialog({ item, onClose }: Props) {
  const { isOwner } = useAuth();
  const { refresh } = useData();
  const [form, setForm] = useState({
    name: item?.name ?? "",
    category: (item?.category ?? "excavators") as CategoryId,
    specs: item?.specs ?? "",
    client_price_per_hour: item ? String(item.client_price_per_hour) : "",
    min_hours: item ? String(item.min_hours) : "1",
    is_active: item?.is_active ?? true,
    notes: item?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    const price = parseNumber(form.client_price_per_hour);
    const minHours = parseNumber(form.min_hours);
    if (!form.name.trim()) return setError("Укажите название техники.");
    if (price == null || price < 0) return setError("Укажите цену для клиента числом.");
    if (minHours == null || !Number.isInteger(minHours) || minHours < 1) return setError("Минимальный заказ — целое число часов от 1.");
    setSaving(true);
    setError(null);
    const row = { ...form, name: form.name.trim(), client_price_per_hour: price, min_hours: minHours };
    try {
      if (item) await db.update("equipment", { id: item.id }, row);
      else await db.insert("equipment", row);
      await refresh(["equipment"]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!item || !window.confirm(`Удалить «${item.name}»? Закупочные цены по ней тоже удалятся.`)) return;
    try {
      await db.remove("equipment", { id: item.id });
      await refresh(["equipment", "supplier_offers"]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить.");
    }
  }

  const clientPrice = parseNumber(form.client_price_per_hour) ?? 0;

  return (
    <Dialog
      open
      onClose={onClose}
      title={item ? item.name : "Новая техника"}
      footer={
        <>
          {item && isOwner && (
            <Button variant="danger" className="mr-auto" onClick={() => void remove()}>
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
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Название" value={form.name} onChange={(e) => set("name", e.target.value)} required className="sm:col-span-2" />
          <SelectField label="Категория" options={toOptions(categoryLabels)} value={form.category} onChange={(e) => set("category", e.target.value as CategoryId)} />
          <TextField label="Характеристики" value={form.specs} onChange={(e) => set("specs", e.target.value)} placeholder="Масса, ковш, стрела…" />
          <TextField label="Цена для клиента за час, ₽" type="number" inputMode="decimal" min={0} value={form.client_price_per_hour} onChange={(e) => set("client_price_per_hour", e.target.value)} required />
          <TextField label="Минимальный заказ, часов" type="number" inputMode="numeric" min={1} value={form.min_hours} onChange={(e) => set("min_hours", e.target.value)} />
          <TextAreaField label="Заметки" value={form.notes} onChange={(e) => set("notes", e.target.value)} className="sm:col-span-2" />
          <CheckboxField label="Сдаём в аренду (активна)" checked={form.is_active} onChange={(v) => set("is_active", v)} />
        </div>

        {isOwner && item && <Offers equipmentId={item.id} clientPrice={clientPrice} />}
        {isOwner && !item && <p className="text-sm text-muted">Закупочные цены поставщиков можно добавить после сохранения техники.</p>}
      </div>
    </Dialog>
  );
}

/** Закупочные цены по этой технике у разных поставщиков. */
function Offers({ equipmentId, clientPrice }: { equipmentId: string; clientPrice: number }) {
  const { data, refresh } = useData();
  const offers = data.supplier_offers.filter((o) => o.equipment_id === equipmentId).sort((a, b) => a.cost_per_hour - b.cost_per_hour);
  const free = data.suppliers.filter((s) => !offers.some((o) => o.supplier_id === s.id));
  const [supplierId, setSupplierId] = useState("");
  const [cost, setCost] = useState("");
  const [offerError, setOfferError] = useState<string | null>(null);

  async function add() {
    const value = parseNumber(cost);
    if (!supplierId || value == null || value < 0) return setOfferError("Выберите поставщика и укажите цену числом.");
    try {
      await db.insert("supplier_offers", { equipment_id: equipmentId, supplier_id: supplierId, cost_per_hour: value });
      await refresh(["supplier_offers"]);
      setSupplierId("");
      setCost("");
      setOfferError(null);
    } catch (e) {
      setOfferError(e instanceof Error ? e.message : "Не удалось добавить.");
    }
  }

  async function removeOffer(id: string) {
    await db.remove("supplier_offers", { id });
    await refresh(["supplier_offers"]);
  }

  return (
    <section className="rounded-card border border-signal/60 bg-signal/5 p-4">
      <h3 className="text-sm font-bold tracking-wide text-muted uppercase">Где берём и почём — видит только владелец</h3>
      {offers.length ? (
        <ul className="mt-3 divide-y divide-border rounded-control bg-white">
          {offers.map((offer, index) => {
            const supplier = data.suppliers.find((s) => s.id === offer.supplier_id);
            const m = hourMarkup(clientPrice, offer.cost_per_hour);
            return (
              <li key={offer.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <span className="font-semibold">
                  {supplier?.name ?? "?"} {index === 0 && <span className="ml-1 text-xs font-bold text-success">дешевле всех</span>}
                </span>
                <span className="tabular-nums">
                  {formatMoney(offer.cost_per_hour)}/ч → наша разница{" "}
                  <strong className={m.diff >= 0 ? "text-success" : "text-error"}>{formatMoney(m.diff)}</strong>
                  {m.markup != null && <> ({formatPercent(m.markup)})</>}
                </span>
                <Button variant="ghost" size="sm" onClick={() => void removeOffer(offer.id)} aria-label={`Удалить цену поставщика ${supplier?.name ?? ""}`}>
                  Убрать
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">Закупочных цен пока нет.</p>
      )}
      {free.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
          <SelectField label="Поставщик" placeholder="— выберите —" options={free.map((s) => ({ value: s.id, label: s.name }))} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
          <TextField label="Цена за час, ₽" type="number" inputMode="decimal" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
          <Button variant="secondary" onClick={() => void add()}>
            Добавить
          </Button>
        </div>
      )}
      {data.suppliers.length === 0 && <p className="mt-2 text-sm text-muted">Сначала добавьте поставщиков в разделе «Поставщики».</p>}
      {offerError && <p className="mt-2 text-sm font-medium text-error">{offerError}</p>}
    </section>
  );
}
