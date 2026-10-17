"use client";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { requestMoney } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/format";
import { clientBalance } from "@/lib/payments";
import type { RentalRequest } from "@/types/db";
import { PaymentStateBadge } from "./PaymentStateBadge";
import { StatusBadge } from "./ui/Badge";
import { rowButtonClass } from "./ui/Page";

/** Таблица заявок. На узком экране прокручивается внутри себя. */
export function RequestsTable({ requests, onOpen }: { requests: RentalRequest[]; onOpen(request: RentalRequest): void }) {
  const { isOwner } = useAuth();
  const { data } = useData();
  const equipmentName = (id: string | null) => data.equipment.find((e) => e.id === id)?.name ?? "—";

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
      <table className="w-full min-w-[50rem] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">№</th>
            <th scope="col" className="px-4 py-3">Клиент</th>
            <th scope="col" className="px-4 py-3">Техника</th>
            <th scope="col" className="px-4 py-3">Начало</th>
            <th scope="col" className="px-4 py-3 text-right">Смен</th>
            <th scope="col" className="px-4 py-3 text-right">Сумма</th>
            {isOwner && <th scope="col" className="px-4 py-3 text-right">Прибыль</th>}
            <th scope="col" className="px-4 py-3">Статус</th>
            <th scope="col" className="px-4 py-3">Оплата</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((request) => {
            const money = requestMoney(request, data.request_costs.find((c) => c.request_id === request.id));
            return (
              <tr key={request.id} className={rowButtonClass} onClick={() => onOpen(request)}>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  <button type="button" className="underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); onOpen(request); }}>
                    {request.number}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{request.contact_name}</p>
                  <p className="text-xs text-muted">{request.contact_phone}</p>
                </td>
                <td className="px-4 py-3">{equipmentName(request.equipment_id)}</td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatDate(request.start_date)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{request.shifts ?? "—"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{money.revenue != null ? formatMoney(money.revenue) : "—"}</td>
                {isOwner && (
                  <td className={cn("px-4 py-3 text-right whitespace-nowrap font-semibold tabular-nums", money.profit != null && (money.profit >= 0 ? "text-success" : "text-error"))}>
                    {money.profit != null ? formatMoney(money.profit) : "—"}
                  </td>
                )}
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3">
                  <PaymentStateBadge state={clientBalance(request, data.payments).state} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
