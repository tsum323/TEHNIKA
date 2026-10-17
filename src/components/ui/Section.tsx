import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

type SectionTone = "white" | "light" | "dark";

interface SectionProps {
  children: ReactNode;
  id?: string;
  /** Фон секции: белый, светлый серый или графитовый. */
  tone?: SectionTone;
  className?: string;
  /** Подпись для скринридеров, если у секции нет видимого заголовка с id. */
  "aria-labelledby"?: string;
}

const toneClasses: Record<SectionTone, string> = {
  white: "bg-white text-ink",
  light: "bg-surface text-ink",
  dark: "surface-dark bg-graphite-900 text-white",
};

/** Секция страницы с едиными вертикальными отступами. */
export function Section({ children, id, tone = "white", className, ...rest }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", toneClasses[tone], className)} {...rest}>
      <Container>{children}</Container>
    </section>
  );
}

interface SectionHeadingProps {
  id?: string;
  /** Короткая надпись над заголовком. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Для тёмных секций — светлый вторичный текст. */
  inverse?: boolean;
  className?: string;
}

/** Заголовок секции: надпись, крупный заголовок и описание. */
export function SectionHeading({ id, eyebrow, title, description, inverse, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-10 max-w-3xl md:mb-14", className)}>
      {eyebrow && (
        <p className="mb-4 flex items-center gap-3 text-overline uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-signal" />
          <span className={inverse ? "text-signal" : "text-graphite-700"}>{eyebrow}</span>
        </p>
      )}
      <h2 id={id} className="text-h2 text-balance">
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-lead", inverse ? "text-muted-inverse" : "text-muted")}>{description}</p>
      )}
    </div>
  );
}
