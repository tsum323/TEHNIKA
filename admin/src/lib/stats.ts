import type { CategoryId, Equipment, RentalRequest, RequestCost, RequestSource, RequestStatus, Supplier } from "@/types/db";
import { monthKey, requestDate, requestMoney } from "./finance";
import { categoryLabels, sourceLabels, statusOrder } from "./labels";

export type Period = "month" | "3m" | "12m" | "all";

export const periodLabels: Record<Period, string> = {
  month: "Этот месяц",
  "3m": "3 месяца",
  "12m": "12 месяцев",
  all: "Всё время",
};

/** Первый день периода в формате "2026-10-01" или null для «всё время». */
export function periodStart(period: Period, today = new Date()): string | null {
  if (period === "all") return null;
  const back = { month: 0, "3m": 2, "12m": 11 }[period];
  const d = new Date(today.getFullYear(), today.getMonth() - back, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Все месяцы от первого до текущего: ["2026-08", "2026-09", "2026-10"]. */
function monthRange(from: string, today = new Date()): string[] {
  const [y, m] = from.split("-").map(Number);
  const keys: string[] = [];
  const d = new Date(y, m - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 1);
  while (d <= end && keys.length < 120) {
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() + 1);
  }
  return keys;
}

export interface Ranked {
  label: string;
  value: number;
  count: number;
}

interface Input {
  requests: RentalRequest[];
  costs: RequestCost[];
  equipment: Equipment[];
  suppliers: Supplier[];
}

/**
 * Статистика за период. Заявка попадает в период по дате начала работ (или дате создания).
 * Деньги считаются только по ВЫПОЛНЕННЫМ заявкам.
 */
export function computeStats({ requests, costs, equipment, suppliers }: Input, period: Period) {
  const start = periodStart(period);
  const inPeriod = requests.filter((r) => !start || requestDate(r) >= start);
  const costOf = (r: RentalRequest) => costs.find((c) => c.request_id === r.id);

  const byStatus = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<RequestStatus, number>;
  inPeriod.forEach((r) => byStatus[r.status]++);
  const closed = byStatus.completed + byStatus.cancelled;

  const completed = inPeriod.filter((r) => r.status === "completed");
  let revenue = 0;
  let cost = 0;
  let missingCost = 0;
  const months = new Map<string, { revenue: number; profit: number; count: number }>();
  const byEquipment = new Map<string, Ranked>();
  const byCategory = new Map<string, Ranked>();
  const bySupplier = new Map<string, Ranked>();
  const add = (map: Map<string, Ranked>, label: string, value: number) => {
    const row = map.get(label) ?? { label, value: 0, count: 0 };
    row.value += value;
    row.count += 1;
    map.set(label, row);
  };

  for (const r of completed) {
    const c = costOf(r);
    const money = requestMoney(r, c);
    revenue += money.revenue ?? 0;
    if (money.cost == null) missingCost++;
    cost += money.cost ?? 0;
    const profit = money.profit ?? 0;
    const key = monthKey(requestDate(r));
    const m = months.get(key) ?? { revenue: 0, profit: 0, count: 0 };
    m.revenue += money.revenue ?? 0;
    m.profit += profit;
    m.count += 1;
    months.set(key, m);
    add(byEquipment, equipment.find((e) => e.id === r.equipment_id)?.name ?? "Без техники", profit);
    add(byCategory, r.category ? categoryLabels[r.category as CategoryId] : "Без категории", profit);
    if (c?.supplier_id) add(bySupplier, suppliers.find((s) => s.id === c.supplier_id)?.name ?? "Поставщик удалён", money.cost ?? 0);
  }

  // Количество заявок по месяцам (все статусы) — для менеджера и для общей картины.
  const requestCounts = new Map<string, number>();
  inPeriod.forEach((r) => {
    const key = monthKey(requestDate(r));
    requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
  });

  const earliest = inPeriod.map(requestDate).sort()[0];
  const monthKeys = monthRange(start ?? earliest ?? new Date().toISOString().slice(0, 10));

  const bySource = new Map<RequestSource, number>();
  inPeriod.forEach((r) => bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1));

  const requestsByEquipment = new Map<string, Ranked>();
  inPeriod.forEach((r) => add(requestsByEquipment, equipment.find((e) => e.id === r.equipment_id)?.name ?? "Без техники", 1));

  const profit = revenue - cost;
  const sortDesc = (map: Map<string, Ranked>) => [...map.values()].sort((a, b) => b.value - a.value);

  return {
    total: inPeriod.length,
    byStatus,
    /** Доля выполненных среди закрытых (выполнено + отменено). */
    conversion: closed ? byStatus.completed / closed : null,
    completedCount: completed.length,
    revenue,
    cost,
    profit,
    markup: cost ? profit / cost : null,
    margin: revenue ? profit / revenue : null,
    averageCheck: completed.length ? revenue / completed.length : null,
    missingCost,
    months: monthKeys.map((key) => ({ key, ...(months.get(key) ?? { revenue: 0, profit: 0, count: 0 }), requests: requestCounts.get(key) ?? 0 })),
    bySource: [...bySource.entries()].map(([source, count]) => ({ label: sourceLabels[source], value: count, count })).sort((a, b) => b.value - a.value),
    byEquipment: sortDesc(byEquipment),
    byCategory: sortDesc(byCategory),
    bySupplier: sortDesc(bySupplier),
    requestsByEquipment: sortDesc(requestsByEquipment),
  };
}
