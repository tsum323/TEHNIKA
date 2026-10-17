import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { RequestStatus } from "@/types/db";
import { statusLabels } from "@/lib/labels";

type Tone = "neutral" | "signal" | "dark" | "success" | "error" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-steel-200 text-graphite-900",
  signal: "bg-signal text-graphite-950",
  dark: "bg-graphite-900 text-white",
  success: "bg-success-bg text-success",
  error: "bg-error-bg text-error",
  info: "bg-info-bg text-info",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

const statusTone: Record<RequestStatus, Tone> = {
  new: "signal",
  in_progress: "info",
  confirmed: "dark",
  completed: "success",
  cancelled: "neutral",
};

/** Статус заявки: цвет дополняет текст, а не заменяет его. */
export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabels[status]}</Badge>;
}
