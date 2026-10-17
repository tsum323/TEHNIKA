import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface StyleProps {
  /** primary — жёлтая основная, secondary — графитовая, ghost — прозрачная с рамкой. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Растянуть на всю ширину контейнера. */
  fullWidth?: boolean;
  className?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-signal text-graphite-950 hover:bg-signal-hover active:bg-signal-pressed",
  secondary: "bg-graphite-900 text-white hover:bg-graphite-700 active:bg-graphite-800",
  ghost: "border-2 border-current bg-transparent hover:bg-current/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
};

/** Классы кнопки — можно использовать и для других элементов. */
export function buttonClasses({ variant = "primary", size = "md", fullWidth, className }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

function Spinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type ButtonProps = StyleProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    /** Показывает индикатор загрузки и блокирует кнопку. */
    loading?: boolean;
  };

/** Кнопка-действие (<button>). Для перехода по ссылке используйте ButtonLink. */
export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type ButtonLinkProps = StyleProps & {
  href: string;
  children: ReactNode;
  "aria-label"?: string;
  /** Обработчик нажатия — например, чтобы закрыть мобильное меню. */
  onClick?: () => void;
};

/**
 * Ссылка, оформленная как кнопка.
 * "/..." и "/#якорь" открываются через next/link (учитывает basePath GitHub Pages),
 * "tel:", "mailto:" и внешние адреса — через обычный <a>.
 */
export function ButtonLink({ href, children, variant, size, fullWidth, className, ...rest }: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, fullWidth, className });
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
