"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { db } from "@/lib/db";
import { formatDate, formatMoney, parseNumber } from "@/lib/format";
import { paymentMethodLabels, toOptions } from "@/lib/labels";
import { clientBalance, paymentsOf, supplierBalance, type Balance } from "@/lib/payments";
import type { Payment, PaymentDirection, PaymentMethod } from "@/types/db";
import { PaymentStateBadge } from "./PaymentStateBadge";
import { Button } from "./ui/Button";
import { SelectField, TextField } from "./ui/Field";

/** Блок «Оплаты» в карточке заявки. Оплаты сохраняются сразу, отдельно от кнопки «Сохранить». */
export function PaymentsSection({ requestId }: { requestId: string }) {
  const { isOwner } = useAuth();
  const { data } = useData();
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) return null;
  const cost = data.request_costs.find((c) => c.request_id === requestId);

  return (
    <div className="flex flex-col gap-4">
      <Ledger
        title="Расчёты с клиентом"
        direction="incoming"
        requestId={requestId}
        balance={clientBalance(request, data.payments)}
        payments={paymentsOf(requestId, data.payments, "incoming")}
      />
      {isOwner && (
        <Ledger
          title="Оплата поставщику и расходов — видит только владелец"
          direction="outgoing"
          requestId={requestId}
          balance={supplierBalance(request, cost, data.payments)}
          payments={paymentsOf(requestId, data.payments, "outgoing")}
          owner
        />
      )}
    </div>
  );
}

interface LedgerProps {
  title: string;
  direction: PaymentDirection;
  requestId: string;
  balance: Balance;
  payments: Payment[];
  owner?: boolean;
}

function Ledger({ title, direction, requestId, balance, payments, owner }: LedgerProps) {
  const { isOwner } = useAuth();
  const { refresh } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(today);
  const [method, setMethod] = useState<PaymentMethod>("bank");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add() {
    const value = parseNumber(amount);
    if (value == null || value <= 0) return setError("Введите сумму больше нуля.");
    if (!paidAt) return setError("Укажите дату оплаты.");
    setBusy(true);
    setError(null);
    try {
      await db.insert("payments", { request_id: requestId, direction, amount: value, paid_at: paidAt, method, comment: comment.trim() });
      await refresh(["payments"]);
      setAmount("");
      setComment("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить оплату.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(payment: Payment) {
    if (!window.confirm(`Удалить оплату ${formatMoney(payment.amount)} от ${formatDate(payment.paid_at)}?`)) return;
    try {
      await db.remove("payments", { id: payment.id });
      await refresh(["payments"]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить.");
    }
  }

  return (
    <section className={cn("rounded-card border p-4", owner ? "border-signal/60 bg-signal/5" : "border-border bg-surface")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold tracking-wide text-muted uppercase">{title}</h3>
        <PaymentStateBadge state={balance.state} />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3 rounded-control bg-white p-3 text-sm">
        <div>
          <dt className="text-muted">{direction === "incoming" ? "К оплате" : "Нужно заплатить"}</dt>
          <dd className="mt-0.5 font-bold tabular-nums">{formatMoney(balance.due)}</dd>
        </div>
        <div>
          <dt className="text-muted">{direction === "incoming" ? "Получено" : "Заплачено"}</dt>
          <dd className="mt-0.5 font-bold tabular-nums">{formatMoney(balance.paid)}</dd>
        </div>
        <div>
          <dt className="text-muted">{balance.rest >= 0 ? "Остаток" : "Переплата"}</dt>
          <dd className={cn("mt-0.5 font-bold tabular-nums", balance.rest > 0.5 && "text-error")}>{formatMoney(Math.abs(balance.rest))}</dd>
        </div>
      </dl>
      {balance.due === 0 && direction === "incoming" && (
        <p className="mt-2 text-xs text-muted">Долг считается, когда заявка «Подтверждена» или «Выполнена». Предоплату можно внести заранее.</p>
      )}

      {payments.length > 0 && (
        <ul className="mt-3 divide-y divide-border rounded-control bg-white text-sm">
          {[...payments]
            .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
            .map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="tabular-nums">
                  {formatDate(p.paid_at)} · <strong>{formatMoney(p.amount)}</strong> · {paymentMethodLabels[p.method]}
                  {p.comment && <span className="text-muted"> · {p.comment}</span>}
                </span>
                {isOwner && (
                  <Button variant="ghost" size="sm" onClick={() => void remove(p)} aria-label={`Удалить оплату ${formatMoney(p.amount)}`}>
                    Удалить
                  </Button>
                )}
              </li>
            ))}
        </ul>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr] sm:items-end">
        <TextField label="Сумма, ₽" type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <TextField label="Дата" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
        <SelectField label="Способ" options={toOptions(paymentMethodLabels)} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} />
        <TextField label="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} className="sm:col-span-2" />
        <Button variant="secondary" onClick={() => void add()} loading={busy}>
          Внести оплату
        </Button>
      </div>
      {balance.rest > 0.5 && !amount && (
        <button type="button" onClick={() => setAmount(String(Math.round(balance.rest)))} className="mt-2 text-sm font-semibold underline underline-offset-4">
          Подставить остаток: {formatMoney(balance.rest)}
        </button>
      )}
      {error && <p className="mt-2 text-sm font-medium text-error">{error}</p>}
    </section>
  );
}
