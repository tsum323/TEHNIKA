"use client";

import { useState } from "react";
import { PaymentStateBadge } from "@/components/PaymentStateBadge";
import { RequestDialog } from "@/components/RequestDialog";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, PageHeader, Stat, rowButtonClass } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentDirectionLabels, paymentMethodLabels } from "@/lib/labels";
import { clientDebts, paidSince, supplierDebts, type DebtRow } from "@/lib/payments";
import { periodLabels, periodStart, type Period } from "@/lib/stats";
import type { RentalRequest } from "@/types/db";

type Tab = "clients" | "suppliers" | "journal";

export default function PaymentsPage() {
  const { isOwner } = useAuth();
  const { data } = useData();
  const [tab, setTab] = useState<Tab>("clients");
  const [period, setPeriod] = useState<Period>("month");
  const [editing, setEditing] = useState<{ request: RentalRequest; key: number } | null>(null);
  const open = (request: RentalRequest) => setEditing({ request, key: Date.now() });

  const debts = clientDebts(data.requests, data.payments);
  const ourDebts = isOwner ? supplierDebts(data.requests, data.request_costs, data.payments) : [];
  const owedToUs = debts.reduce((s, d) => s + d.balance.rest, 0);
  const weOwe = ourDebts.reduce((s, d) => s + d.balance.rest, 0);
  const from = periodStart(period);
  const received = paidSince(data.payments, "incoming", from);
  const spent = paidSince(data.payments, "outgoing", from);

  const tabs: { id: Tab; label: string }[] = [
    { id: "clients", label: `Нам должны (${debts.length})` },
    ...(isOwner ? [{ id: "suppliers" as const, label: `Мы должны (${ourDebts.length})` }] : []),
    { id: "journal", label: "Журнал оплат" },
  ];

  return (
    <>
      <PageHeader title="Оплаты" description="Кто сколько должен и какие деньги пришли и ушли." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Нам должны клиенты" value={formatMoney(owedToUs)} tone={owedToUs > 0 ? "negative" : undefined} note={`${debts.length} заявок с долгом`} />
        {isOwner && <Stat label="Мы должны поставщикам" value={formatMoney(weOwe)} note={`${ourDebts.length} заявок`} />}
        <Stat label={`Получено (${periodLabels[period].toLowerCase()})`} value={formatMoney(received)} tone="positive" />
        {isOwner && <Stat label={`Выплачено (${periodLabels[period].toLowerCase()})`} value={formatMoney(spent)} />}
      </div>
      {isOwner && (
        <p className="mt-3 text-sm text-muted">
          Остаток денег за период (получено − выплачено):{" "}
          <strong className={cn("tabular-nums", received - spent >= 0 ? "text-success" : "text-error")}>{formatMoney(received - spent)}</strong>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Разделы оплат" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 rounded-control border px-4 text-sm font-semibold transition-colors",
                tab === t.id ? "border-graphite-900 bg-graphite-900 text-white" : "border-border-strong bg-white hover:bg-surface",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          Период
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="h-10 rounded-control border border-border-strong bg-white px-2">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <option key={p} value={p}>
                {periodLabels[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        {tab === "clients" && <DebtTable rows={debts} onOpen={open} empty="Долгов нет — все клиенты расплатились." />}
        {tab === "suppliers" && isOwner && <DebtTable rows={ourDebts} onOpen={open} empty="Мы никому не должны." />}
        {tab === "journal" && <Journal from={from} onOpen={open} />}
      </div>

      {editing && <RequestDialog key={editing.key} open request={editing.request} onClose={() => setEditing(null)} />}
    </>
  );
}

function DebtTable({ rows, onOpen, empty }: { rows: DebtRow[]; onOpen(r: RentalRequest): void; empty: string }) {
  if (!rows.length) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Заявка</th>
            <th scope="col" className="px-4 py-3">Клиент</th>
            <th scope="col" className="px-4 py-3 text-right">К оплате</th>
            <th scope="col" className="px-4 py-3 text-right">Оплачено</th>
            <th scope="col" className="px-4 py-3 text-right">Долг</th>
            <th scope="col" className="px-4 py-3">Состояние</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ request, balance }) => (
            <tr key={request.id} className={rowButtonClass} onClick={() => onOpen(request)}>
              <td className="px-4 py-3">
                <button type="button" className="font-semibold underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); onOpen(request); }}>
                  №{request.number}
                </button>
                <p className="text-xs text-muted">{formatDate(request.start_date)}</p>
              </td>
              <td className="px-4 py-3">
                {request.contact_name}
                <p className="text-xs text-muted">{request.contact_phone}</p>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{formatMoney(balance.due)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{formatMoney(balance.paid)}</td>
              <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-error tabular-nums">{formatMoney(balance.rest)}</td>
              <td className="px-4 py-3">
                <PaymentStateBadge state={balance.state} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Journal({ from, onOpen }: { from: string | null; onOpen(r: RentalRequest): void }) {
  const { data } = useData();
  const list = data.payments.filter((p) => !from || p.paid_at >= from).sort((a, b) => b.paid_at.localeCompare(a.paid_at) || b.created_at.localeCompare(a.created_at));
  if (!list.length) return <EmptyState>Оплат за период нет.</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">Дата</th>
            <th scope="col" className="px-4 py-3">Заявка</th>
            <th scope="col" className="px-4 py-3">Направление</th>
            <th scope="col" className="px-4 py-3">Способ</th>
            <th scope="col" className="px-4 py-3 text-right">Сумма</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {list.map((p) => {
            const request = data.requests.find((r) => r.id === p.request_id);
            return (
              <tr key={p.id} className={rowButtonClass} onClick={() => request && onOpen(request)}>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatDate(p.paid_at)}</td>
                <td className="px-4 py-3">
                  {request ? `№${request.number} · ${request.contact_name}` : "—"}
                  {p.comment && <p className="text-xs text-muted">{p.comment}</p>}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.direction === "incoming" ? "success" : "neutral"}>{paymentDirectionLabels[p.direction]}</Badge>
                </td>
                <td className="px-4 py-3">{paymentMethodLabels[p.method]}</td>
                <td className={cn("px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums", p.direction === "incoming" ? "text-success" : "text-ink")}>
                  {p.direction === "incoming" ? "+" : "−"}
                  {formatMoney(p.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
