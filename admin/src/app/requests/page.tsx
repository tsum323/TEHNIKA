"use client";

import { useState } from "react";
import { RequestDialog } from "@/components/RequestDialog";
import { RequestsTable } from "@/components/RequestsTable";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Page";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { statusLabels, statusOrder } from "@/lib/labels";
import type { RentalRequest, RequestStatus } from "@/types/db";

export default function RequestsPage() {
  const { data } = useData();
  const [status, setStatus] = useState<RequestStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ request: RentalRequest | null; key: number } | null>(null);

  const q = query.trim().toLowerCase();
  const list = data.requests
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => !q || `${r.number} ${r.contact_name} ${r.contact_phone} ${r.address}`.toLowerCase().includes(q))
    .sort((a, b) => b.number - a.number);

  const count = (s: RequestStatus | "all") => (s === "all" ? data.requests.length : data.requests.filter((r) => r.status === s).length);

  return (
    <>
      <PageHeader
        title="Заявки"
        description="Все обращения клиентов: от первого звонка до выполненной работы."
        actions={<Button onClick={() => setEditing({ request: null, key: Date.now() })}>Новая заявка</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Фильтр по статусу" className="flex flex-wrap gap-2">
          {(["all", ...statusOrder] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "h-9 rounded-full border px-3 text-sm font-semibold transition-colors",
                status === s ? "border-graphite-900 bg-graphite-900 text-white" : "border-border-strong bg-white hover:bg-surface",
              )}
            >
              {s === "all" ? "Все" : statusLabels[s]} <span className="tabular-nums opacity-70">{count(s)}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: имя, телефон, номер"
          aria-label="Поиск заявок"
          className="h-10 w-full rounded-control border border-border-strong bg-white px-3 lg:w-72"
        />
      </div>

      {list.length > 0 ? (
        <RequestsTable requests={list} onOpen={(request) => setEditing({ request, key: Date.now() })} />
      ) : (
        <EmptyState>{data.requests.length ? "Ничего не найдено." : "Заявок пока нет. Нажмите «Новая заявка»."}</EmptyState>
      )}

      {editing && <RequestDialog key={editing.key} open request={editing.request} onClose={() => setEditing(null)} />}
    </>
  );
}
