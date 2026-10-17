import { paymentStateLabels, type PaymentState } from "@/lib/payments";
import { Badge } from "./ui/Badge";

const tone = {
  none: "neutral",
  unpaid: "error",
  partial: "signal",
  paid: "success",
  overpaid: "info",
} as const;

/** Состояние оплаты: цвет дополняет текст, а не заменяет его. */
export function PaymentStateBadge({ state }: { state: PaymentState }) {
  return <Badge tone={tone[state]}>{paymentStateLabels[state]}</Badge>;
}
