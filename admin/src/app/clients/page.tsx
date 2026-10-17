"use client";

import { useState } from "react";
import { SimpleDialog } from "@/components/SimpleDialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { EmptyState, PageHeader, rowButtonClass } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { db } from "@/lib/db";
import { requestMoney } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/format";
import { clientKindLabels, toOptions } from "@/lib/labels";
import { nextPhoneValue } from "@/lib/phone";
import type { Client, ClientKind } from "@/types/db";

export default function ClientsPage() {
  const { isOwner } = useAuth();
  const { data } = useData();
  const [editing, setEditing] = useState<{ item: Client | null; key: number } | null>(null);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = data.clients
    .filter((c) => !q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  const stats = (clientId: string) => {
    const requests = data.requests.filter((r) => r.client_id === clientId);
    const revenue = requests
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + (requestMoney(r, undefined).revenue ?? 0), 0);
    return { count: requests.length, revenue };
  };

  return (
    <>
      <PageHeader
        title="Клиенты"
        description="Организации и частные лица, которые обращались к нам."
        actions={<Button onClick={() => setEditing({ item: null, key: Date.now() })}>Добавить клиента</Button>}
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск: название, телефон"
        aria-label="Поиск клиентов"
        className="mb-4 h-10 w-full rounded-control border border-border-strong bg-white px-3 sm:w-72"
      />
      {list.length === 0 ? (
        <EmptyState>{data.clients.length ? "Ничего не найдено." : "Клиентов пока нет."}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Клиент</th>
                <th scope="col" className="px-4 py-3">Тип</th>
                <th scope="col" className="px-4 py-3">Телефон</th>
                <th scope="col" className="px-4 py-3 text-right">Заявок</th>
                <th scope="col" className="px-4 py-3 text-right">Оплатил (выполнено)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((item) => {
                const s = stats(item.id);
                return (
                  <tr key={item.id} className={rowButtonClass} onClick={() => setEditing({ item, key: Date.now() })}>
                    <td className="px-4 py-3">
                      <button type="button" className="text-left font-semibold underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); setEditing({ item, key: Date.now() }); }}>
                        {item.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{clientKindLabels[item.kind]}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.phone || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.count}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{formatMoney(s.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isOwner && <p className="mt-3 text-xs text-muted">Удалять клиентов может только владелец.</p>}
      {editing && <ClientDialog key={editing.key} item={editing.item} onClose={() => setEditing(null)} />}
    </>
  );
}

function ClientDialog({ item, onClose }: { item: Client | null; onClose(): void }) {
  const { data, refresh } = useData();
  const [form, setForm] = useState({
    name: item?.name ?? "",
    kind: (item?.kind ?? "company") as ClientKind,
    phone: item?.phone ?? "",
    email: item?.email ?? "",
    notes: item?.notes ?? "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));
  const requests = item ? data.requests.filter((r) => r.client_id === item.id).sort((a, b) => b.number - a.number) : [];

  async function save() {
    if (!form.name.trim()) throw new Error("Укажите имя или название клиента.");
    const row = { ...form, name: form.name.trim() };
    if (item) await db.update("clients", { id: item.id }, row);
    else await db.insert("clients", row);
    await refresh(["clients"]);
  }

  async function remove() {
    if (!item) return;
    await db.remove("clients", { id: item.id });
    await refresh(["clients", "requests"]);
  }

  return (
    <SimpleDialog title={item ? item.name : "Новый клиент"} isNew={!item} onClose={onClose} onSave={save} onDelete={remove} deleteQuestion="Удалить клиента? Его заявки останутся, но без привязки к клиенту.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Имя или организация" value={form.name} onChange={(e) => set("name", e.target.value)} required className="sm:col-span-2" />
        <SelectField label="Тип" options={toOptions(clientKindLabels)} value={form.kind} onChange={(e) => set("kind", e.target.value as ClientKind)} />
        <TextField
          label="Телефон"
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          value={form.phone}
          onChange={(e) => set("phone", nextPhoneValue(form.phone, e.target.value, (e.nativeEvent as InputEvent).inputType?.startsWith("delete") ?? false))}
        />
        <TextField label="Почта" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="sm:col-span-2" />
        <TextAreaField label="Заметки" value={form.notes} onChange={(e) => set("notes", e.target.value)} className="sm:col-span-2" />
      </div>
      {item && (
        <section>
          <h3 className="mb-2 text-sm font-bold tracking-wide text-muted uppercase">Заявки клиента</h3>
          {requests.length ? (
            <ul className="divide-y divide-border rounded-control border border-border text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span>
                    №{r.number} · {formatDate(r.start_date)}
                  </span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Заявок нет.</p>
          )}
        </section>
      )}
    </SimpleDialog>
  );
}
