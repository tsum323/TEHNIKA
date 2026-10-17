"use client";

import Link from "next/link";
import { useState } from "react";
import { RequestDialog } from "@/components/RequestDialog";
import { RequestsTable } from "@/components/RequestsTable";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, Stat } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { formatMoney, formatPercent, plural } from "@/lib/format";
import { computeStats } from "@/lib/stats";
import type { RentalRequest } from "@/types/db";

export default function DashboardPage() {
  const { isOwner, profile } = useAuth();
  const { data } = useData();
  const [editing, setEditing] = useState<{ request: RentalRequest | null; key: number } | null>(null);
  const month = computeStats({ requests: data.requests, costs: data.request_costs, equipment: data.equipment, suppliers: data.suppliers }, "month");
  const newCount = data.requests.filter((r) => r.status === "new").length;
  const activeCount = data.requests.filter((r) => r.status === "in_progress" || r.status === "confirmed").length;
  const recent = [...data.requests].sort((a, b) => b.number - a.number).slice(0, 6);
  const noOffers = data.equipment.filter((e) => e.is_active && !data.supplier_offers.some((o) => o.equipment_id === e.id)).length;

  return (
    <>
      <PageHeader
        title={`Здравствуйте${profile?.full_name ? `, ${profile.full_name}` : ""}`}
        description="Короткая сводка по заявкам и деньгам."
        actions={<Button onClick={() => setEditing({ request: null, key: Date.now() })}>Новая заявка</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Новые заявки" value={String(newCount)} note="Ждут обработки" />
        <Stat label="В работе и подтверждены" value={String(activeCount)} />
        <Stat label="Выполнено в этом месяце" value={String(month.byStatus.completed)} />
        {isOwner && (
          <>
            <Stat label="Выручка за месяц" value={formatMoney(month.revenue)} />
            <Stat label="Прибыль за месяц" value={formatMoney(month.profit)} tone={month.profit >= 0 ? "positive" : "negative"} />
            <Stat label="Наценка за месяц" value={month.markup != null ? formatPercent(month.markup) : "—"} />
          </>
        )}
      </div>

      {isOwner && noOffers > 0 && (
        <p role="status" className="mt-4 rounded-control bg-signal/15 px-4 py-3 text-sm">
          У {noOffers} {plural(noOffers, ["единицы", "единиц", "единиц"])} техники не указана закупочная цена — наценку по ним не посчитать.{" "}
          <Link href="/equipment/" className="font-semibold underline underline-offset-4">
            Открыть технику
          </Link>
        </p>
      )}

      <div className="mt-8 mb-3 flex items-end justify-between">
        <h2 className="text-xl font-bold">Последние заявки</h2>
        <Link href="/requests/" className="text-sm font-semibold underline underline-offset-4">
          Все заявки
        </Link>
      </div>
      {recent.length ? (
        <RequestsTable requests={recent} onOpen={(request) => setEditing({ request, key: Date.now() })} />
      ) : (
        <EmptyState>Заявок пока нет.</EmptyState>
      )}

      {editing && <RequestDialog key={editing.key} open request={editing.request} onClose={() => setEditing(null)} />}
    </>
  );
}
