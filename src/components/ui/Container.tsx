import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Ограничивает ширину контента и задаёт единые боковые отступы. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-(--container-site) px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
