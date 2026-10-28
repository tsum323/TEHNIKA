"use client";

import { useState } from "react";
import { SimpleDialog } from "@/components/SimpleDialog";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { EmptyState, PageHeader, rowButtonClass } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { db } from "@/lib/db";
import { requestMoney, hourMarkup } from "@/lib/finance";
import { formatMoney, formatPercent } from "@/lib/format";
import { nextPhoneValue } from "@/lib/phone";
import type { Supplier } from "@/types/db";

export default function SuppliersPage() {
  const { isOwner } = useAuth();
  const { data } = useData();
  const [editing, setEditing] = useState<{ item: Supplier | null; key: number } | null>(null);
  const list = [...data.suppliers].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  /** Сколько заплатили поставщику по выполненным заявкам. */
  const paid = (supplierId: string) =>
    data.request_costs
      .filter((c) => c.supplier_id === supplierId)
      .reduce((sum, c) => {
        const request = data.requests.find((r) => r.id === c.request_id);
        if (!request || request.status !== "completed") return sum;
        return sum + (requestMoney(request, c).cost ?? 0);
      }, 0);

  return (
    <>
      <PageHeader
        title="Поставщики"
        description="Откуда берём технику: контакты и условия."
        actions={<Button onClick={() => setEditing({ item: null, key: Date.now() })}>Добавить поставщика</Button>}
      />
      {list.length === 0 ? (
        <EmptyState>Поставщиков пока нет.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Поставщик</th>
                <th scope="col" className="px-4 py-3">Контакт</th>
                <th scope="col" className="px-4 py-3">Город</th>
                {isOwner && (
                  <>
                    <th scope="col" className="px-4 py-3 text-right">Единиц техники</th>
                    <th scope="col" className="px-4 py-3 text-right">Заплатили</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((item) => (
                <tr key={item.id} className={rowButtonClass} onClick={() => setEditing({ item, key: Date.now() })}>
                  <td className="px-4 py-3">
                    <button type="button" className="text-left font-semibold underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); setEditing({ item, key: Date.now() }); }}>
                      {item.name}
                    </button>
                    {item.notes && <p className="text-xs text-muted">{item.notes}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {item.contact_person}
                    {item.phone && <p className="text-xs text-muted">{item.phone}</p>}
                  </td>
                  <td className="px-4 py-3">{item.city || "—"}</td>
                  {isOwner && (
                    <>
                      <td className="px-4 py-3 text-right tabular-nums">{data.supplier_offers.filter((o) => o.supplier_id === item.id).length}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{formatMoney(paid(item.id))}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <SupplierDialog key={editing.key} item={editing.item} onClose={() => setEditing(null)} />}
    </>
  );
}

function SupplierDialog({ item, onClose }: { item: Supplier | null; onClose(): void }) {
  const { isOwner } = useAuth();
  const { data, refresh } = useData();
  const [form, setForm] = useState({
    name: item?.name ?? "",
    contact_person: item?.contact_person ?? "",
    phone: item?.phone ?? "",
    email: item?.email ?? "",
    city: item?.city ?? "",
    notes: item?.notes ?? "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const offers = item ? data.supplier_offers.filter((o) => o.supplier_id === item.id) : [];

  async function save() {
    if (!form.name.trim()) throw new Error("Укажите название поставщика.");
    const row = { ...form, name: form.name.trim() };
    if (item) await db.update("suppliers", { id: item.id }, row);
    else await db.insert("suppliers", row);
    await refresh(["suppliers"]);
  }

  async function remove() {
    if (!item) return;
    await db.remove("suppliers", { id: item.id });
    await refresh(["suppliers", "supplier_offers", "request_costs"]);
  }

  return (
    <SimpleDialog title={item ? item.name : "Новый поставщик"} isNew={!item} onClose={onClose} onSave={save} onDelete={remove} deleteQuestion="Удалить поставщика? Его закупочные цены тоже удалятся.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Название" value={form.name} onChange={(e) => set("name", e.target.value)} required className="sm:col-span-2" />
        <TextField label="Контактное лицо" value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} />
        <TextField
          label="Телефон"
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          value={form.phone}
          onChange={(e) => set("phone", nextPhoneValue(form.phone, e.target.value, (e.nativeEvent as InputEvent).inputType?.startsWith("delete") ?? false))}
        />
        <TextField label="Почта" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <TextField label="Город" value={form.city} onChange={(e) => set("city", e.target.value)} />
        <TextAreaField label="Условия и заметки" value={form.notes} onChange={(e) => set("notes", e.target.value)} className="sm:col-span-2" />
      </div>
      {isOwner && item && (
        <section className="rounded-card border border-signal/60 bg-signal/5 p-4">
          <h3 className="text-sm font-bold tracking-wide text-muted uppercase">Техника у этого поставщика — видит только владелец</h3>
          {offers.length ? (
            <ul className="mt-3 divide-y divide-border rounded-control bg-white text-sm">
              {offers.map((offer) => {
                const equipment = data.equipment.find((e) => e.id === offer.equipment_id);
                const m = equipment ? hourMarkup(equipment.client_price_per_hour, offer.cost_per_hour) : null;
                return (
                  <li key={offer.id} className="flex flex-wrap justify-between gap-2 px-3 py-2.5">
                    <span className="font-semibold">{equipment?.name ?? "?"}</span>
                    <span className="tabular-nums">
                      берём за {formatMoney(offer.cost_per_hour)}/ч
                      {m && (
                        <>
                          , сдаём за {formatMoney(equipment!.client_price_per_hour)}/ч —{" "}
                          <strong className={m.diff >= 0 ? "text-success" : "text-error"}>{formatMoney(m.diff)}</strong>
                          {m.markup != null && <> ({formatPercent(m.markup)})</>}
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Цены добавляются в карточке техники (раздел «Техника»).</p>
          )}
        </section>
      )}
    </SimpleDialog>
  );
}
