import type { Payment, RentalRequest, RequestCost, RequestStatus } from "@/types/db";
import { requestMoney } from "./finance";

/**
 * Учёт оплат.
 *
 * Клиент должен платить по заявкам со статусом «Подтверждена» и «Выполнена»:
 *   к оплате = цена за час × часы; остаток = к оплате − полученные оплаты.
 * Поставщику и на расходы (только владелец):
 *   к оплате = закупочная цена за час × часы + доп. расходы; остаток = к оплате − выплаченное.
 */

/** Статусы, по которым клиент уже должен платить. */
export const BILLABLE: RequestStatus[] = ["confirmed", "completed"];

export type PaymentState = "none" | "unpaid" | "partial" | "paid" | "overpaid";

export const paymentStateLabels: Record<PaymentState, string> = {
  none: "Не выставлено",
  unpaid: "Не оплачено",
  partial: "Частично",
  paid: "Оплачено",
  overpaid: "Переплата",
};

export interface Balance {
  due: number;
  paid: number;
  /** Сколько ещё должны (меньше нуля — переплата). */
  rest: number;
  state: PaymentState;
}

function balance(due: number, paid: number): Balance {
  const rest = due - paid;
  let state: PaymentState;
  if (due <= 0 && paid <= 0) state = "none";
  else if (paid <= 0) state = "unpaid";
  else if (rest > 0.5) state = "partial";
  else if (rest < -0.5) state = "overpaid";
  else state = "paid";
  return { due, paid, rest, state };
}

const sum = (payments: Payment[]) => payments.reduce((total, p) => total + p.amount, 0);

export function paymentsOf(requestId: string, payments: Payment[], direction?: Payment["direction"]) {
  return payments.filter((p) => p.request_id === requestId && (!direction || p.direction === direction));
}

/** Расчёты с клиентом по заявке. */
export function clientBalance(request: RentalRequest, payments: Payment[]): Balance {
  const due = BILLABLE.includes(request.status) ? (requestMoney(request, undefined).revenue ?? 0) : 0;
  return balance(due, sum(paymentsOf(request.id, payments, "incoming")));
}

/** Расчёты с поставщиком и по расходам. Только для владельца. */
export function supplierBalance(request: RentalRequest, cost: RequestCost | undefined, payments: Payment[]): Balance {
  const due = BILLABLE.includes(request.status) ? (requestMoney(request, cost).cost ?? 0) : 0;
  return balance(due, sum(paymentsOf(request.id, payments, "outgoing")));
}

export interface DebtRow {
  request: RentalRequest;
  balance: Balance;
}

/** Заявки, по которым остался долг, — самые крупные сверху. */
export function clientDebts(requests: RentalRequest[], payments: Payment[]): DebtRow[] {
  return requests
    .map((request) => ({ request, balance: clientBalance(request, payments) }))
    .filter((row) => row.balance.rest > 0.5)
    .sort((a, b) => b.balance.rest - a.balance.rest);
}

export function supplierDebts(requests: RentalRequest[], costs: RequestCost[], payments: Payment[]): DebtRow[] {
  return requests
    .map((request) => ({ request, balance: supplierBalance(request, costs.find((c) => c.request_id === request.id), payments) }))
    .filter((row) => row.balance.rest > 0.5)
    .sort((a, b) => b.balance.rest - a.balance.rest);
}

/** Сумма оплат в направлении с даты (включительно). */
export function paidSince(payments: Payment[], direction: Payment["direction"], from: string | null): number {
  return sum(payments.filter((p) => p.direction === direction && (!from || p.paid_at >= from)));
}
