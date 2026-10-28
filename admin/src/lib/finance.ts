import type { Equipment, RentalRequest, RequestCost, SupplierOffer } from "@/types/db";

/**
 * Финансовые расчёты.
 *
 * Выручка  = цена для клиента за час × количество часов
 * Расходы  = закупочная цена за час × количество часов + разовые расходы (доставка и т. п.)
 * Прибыль  = выручка − расходы
 * Наценка  = прибыль / расходы   (на сколько процентов мы продаём дороже, чем берём)
 * Маржа    = прибыль / выручка   (какая доля выручки остаётся у нас)
 */

export interface Money {
  revenue: number | null;
  cost: number | null;
  profit: number | null;
  markup: number | null;
  margin: number | null;
}

export function requestMoney(request: RentalRequest, cost: RequestCost | undefined): Money {
  const hours = request.hours ?? 0;
  const revenue = request.client_price_per_hour != null && hours > 0 ? request.client_price_per_hour * hours : null;
  const totalCost = cost && hours > 0 ? cost.cost_per_hour * hours + cost.extra_costs : null;
  const profit = revenue != null && totalCost != null ? revenue - totalCost : null;
  return {
    revenue,
    cost: totalCost,
    profit,
    markup: profit != null && totalCost ? profit / totalCost : null,
    margin: profit != null && revenue ? profit / revenue : null,
  };
}

/** Самое выгодное (дешёвое) предложение поставщиков по технике. */
export function bestOffer(equipmentId: string, offers: SupplierOffer[]): SupplierOffer | undefined {
  return offers
    .filter((offer) => offer.equipment_id === equipmentId)
    .reduce<SupplierOffer | undefined>((best, offer) => (!best || offer.cost_per_hour < best.cost_per_hour ? offer : best), undefined);
}

/** Разница между нашей ценой и закупочной за один час. */
export function hourMarkup(clientPrice: number, costPrice: number) {
  const diff = clientPrice - costPrice;
  return { diff, markup: costPrice > 0 ? diff / costPrice : null };
}

export function equipmentMarkup(item: Equipment, offers: SupplierOffer[]) {
  const offer = bestOffer(item.id, offers);
  if (!offer) return null;
  return { offer, ...hourMarkup(item.client_price_per_hour, offer.cost_per_hour) };
}

/** Дата, к которой относим заявку в статистике: дата начала работ или дата создания. */
export function requestDate(request: RentalRequest): string {
  return (request.start_date ?? request.created_at).slice(0, 10);
}

/** Ключ месяца: "2026-10". */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}
