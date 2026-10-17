"use client";

import { useState } from "react";
import { BarList, ColumnChart } from "@/components/Charts";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, PageHeader, Stat } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { formatMoney, formatMonth, formatMonthShort, formatNumber, formatPercent, plural } from "@/lib/format";
import { statusOrder } from "@/lib/labels";
import { computeStats, periodLabels, type Period } from "@/lib/stats";

/** «125 тыс», «1,2 млн» — короткие подписи на столбцах. */
function short(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млн`;
  if (abs >= 1000) return `${sign}${Math.round(abs / 1000)} тыс`;
  return `${sign}${Math.round(abs)}`;
}

export default function StatsPage() {
  const { isOwner } = useAuth();
  const { data } = useData();
  const [period, setPeriod] = useState<Period>("12m");
  const s = computeStats({ requests: data.requests, costs: data.request_costs, equipment: data.equipment, suppliers: data.suppliers }, period);
  const months = s.months.map((m, i) => ({ ...m, label: formatMonthShort(m.key, i === 0), fullLabel: formatMonth(m.key) }));
  const count = (n: number) => `${formatNumber(n)} ${plural(n, ["заявка", "заявки", "заявок"])}`;

  return (
    <>
      <PageHeader title="Статистика" description={isOwner ? "Заявки, выручка и прибыль. Деньги считаются по выполненным заявкам." : "Заявки и их результаты."} />

      <div role="group" aria-label="Период" className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            onClick={() => setPeriod(p)}
            className={cn(
              "h-9 rounded-full border px-3 text-sm font-semibold transition-colors",
              period === p ? "border-graphite-900 bg-graphite-900 text-white" : "border-border-strong bg-white hover:bg-surface",
            )}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {isOwner && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Выручка" value={formatMoney(s.revenue)} note={`${s.completedCount} ${plural(s.completedCount, ["выполненная", "выполненные", "выполненных"])}`} />
            <Stat label="Расходы" value={formatMoney(s.cost)} note="Поставщики и доп. расходы" />
            <Stat label="Прибыль" value={formatMoney(s.profit)} tone={s.profit >= 0 ? "positive" : "negative"} />
            <Stat label="Средняя наценка" value={s.markup != null ? formatPercent(s.markup) : "—"} note={s.margin != null ? `Маржа ${formatPercent(s.margin)}` : undefined} />
          </div>
          {s.missingCost > 0 && (
            <p role="status" className="mt-3 rounded-control bg-signal/15 px-4 py-3 text-sm">
              У {s.missingCost} {plural(s.missingCost, ["выполненной заявки", "выполненных заявок", "выполненных заявок"])} не указаны расходы — прибыль по ним завышена. Откройте заявку и заполните блок «Финансы».
            </p>
          )}
        </>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Заявок за период" value={formatNumber(s.total)} />
        <Stat label="Выполнено" value={formatNumber(s.byStatus.completed)} />
        <Stat label="Отменено" value={formatNumber(s.byStatus.cancelled)} />
        <Stat label="Доля выполненных" value={s.conversion != null ? formatPercent(s.conversion) : "—"} note="Среди выполненных и отменённых" />
      </div>
      {isOwner && <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Средний чек" value={s.averageCheck != null ? formatMoney(s.averageCheck) : "—"} /></div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {isOwner ? (
          <>
            <Card className="lg:col-span-2">
              <ColumnChart title="Выручка по месяцам" data={months.map((m) => ({ label: m.label, fullLabel: m.fullLabel, value: m.revenue }))} format={formatMoney} short={short} />
            </Card>
            <Card className="lg:col-span-2">
              <ColumnChart title="Прибыль по месяцам" data={months.map((m) => ({ label: m.label, fullLabel: m.fullLabel, value: m.profit }))} format={formatMoney} short={short} />
            </Card>
          </>
        ) : (
          <Card className="lg:col-span-2">
            <ColumnChart title="Заявки по месяцам" data={months.map((m) => ({ label: m.label, fullLabel: m.fullLabel, value: m.requests }))} format={count} short={(v) => String(v)} />
          </Card>
        )}

        {isOwner && (
          <>
            <Card>
              <BarList title="Прибыль по технике" data={s.byEquipment} format={formatMoney} />
            </Card>
            <Card>
              <BarList title="Прибыль по категориям" data={s.byCategory} format={formatMoney} />
            </Card>
            <Card>
              <BarList title="Сколько заплатили поставщикам" data={s.bySupplier} format={formatMoney} />
            </Card>
          </>
        )}
        <Card>
          <BarList title="Откуда приходят заявки" data={s.bySource} format={count} />
        </Card>
        <Card>
          <BarList title="Самая востребованная техника" data={s.requestsByEquipment} format={count} />
        </Card>
        <Card>
          <h2 className="mb-3 font-bold">Заявки по статусам</h2>
          <ul className="divide-y divide-border text-sm">
            {statusOrder.map((st) => (
              <li key={st} className="flex items-center justify-between py-2">
                <StatusBadge status={st} />
                <span className="font-semibold tabular-nums">{s.byStatus[st]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
