import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
}

/** Временный логотип: жёлтый знак и название компании из src/content/site.ts. */
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-control bg-signal"
      >
        <svg viewBox="0 0 24 24" className="size-6 text-graphite-950" fill="currentColor">
          <path d="M3 18h18v2H3zM5 16l4-9h3l-1.5 4H15l2-4h2l-3 9z" />
        </svg>
      </span>
      <span className="text-lg leading-none font-extrabold tracking-tight">{site.name}</span>
    </Link>
  );
}
