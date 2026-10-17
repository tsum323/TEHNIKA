import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "signal" | "dark" | "outline" | "success" | "error";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-steel-200 text-graphite-900",
  signal: "bg-signal text-graphite-950",
  dark: "bg-graphite-900 text-white",
  outline: "border border-border-strong text-graphite-700",
  success: "bg-success-bg text-success",
  error: "bg-error-bg text-error",
};

/** Компактная метка: категория, статус, «Демо». */
export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold tracking-wide uppercase",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
