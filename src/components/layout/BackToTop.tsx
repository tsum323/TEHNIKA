"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/** Кнопка появляется, когда страницу прокрутили дальше этого расстояния (в пикселях). */
const SHOW_AFTER = 600;

/** Круглая кнопка «Наверх» в правом нижнем углу. Видна только после прокрутки вниз. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    }
    function onScroll() {
      // Не чаще одного раза за кадр
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    // Переносим фокус в начало страницы, чтобы с клавиатуры продолжить оттуда, а не с низа
    document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title={site.backToTop}
      className={cn(
        "fixed z-40 grid size-12 place-items-center rounded-full bg-signal text-graphite-950 shadow-card-hover",
        "right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6",
        "transition-[opacity,translate,visibility,background-color] duration-200 hover:bg-signal-hover active:bg-signal-pressed",
        "motion-reduce:transition-none",
        visible ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0",
      )}
    >
      <Icon name="arrowUp" className="size-6" />
      <span className="sr-only">{site.backToTop}</span>
    </button>
  );
}
