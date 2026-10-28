"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavLink } from "@/types/site";

/** Раздел считается текущим, когда его верх поднялся выше этой доли высоты экрана. */
const ACTIVATION_LINE = 0.35;

function hashId(href: string): string | null {
  const index = href.indexOf("#");
  return index === -1 ? null : href.slice(index + 1) || null;
}

/**
 * Какой пункт меню подсветить.
 *
 * Пункты-якоря («Как мы работаем», «Контакты») подсвечиваются, когда их раздел на экране —
 * если такой раздел есть на текущей странице. Пока ни один раздел не на экране,
 * подсвечивается пункт-страница, в которой мы находимся («Каталог» на любой странице каталога).
 */
export function useActiveNav(links: NavLink[]): string | null {
  const pathname = usePathname();
  const [sectionHref, setSectionHref] = useState<string | null>(null);

  useEffect(() => {
    const sections = links
      .map((link) => ({ href: link.href, element: hashId(link.href) ? document.getElementById(hashId(link.href)!) : null }))
      .filter((item): item is { href: string; element: HTMLElement } => item.element !== null);

    let frame = 0;
    function update() {
      frame = 0;
      const line = window.innerHeight * ACTIVATION_LINE;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current: string | null = null;
      for (const { href, element } of sections) {
        const rect = element.getBoundingClientRect();
        // Последний раздел, чей верх уже выше линии, а низ ещё ниже неё
        if (rect.top <= line && rect.bottom > line) current = href;
      }
      // У самого низа страницы последний раздел может не дотянуться до линии — считаем текущим его
      if (atBottom && sections.length > 0) {
        const last = sections.reduce((a, b) => (a.element.offsetTop > b.element.offsetTop ? a : b));
        if (last.element.getBoundingClientRect().top < window.innerHeight) current = last.href;
      }
      setSectionHref(current);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [links, pathname]);

  if (sectionHref) return sectionHref;
  const page = links.find((link) => !link.href.includes("#") && pathname.startsWith(link.href.replace(/\/$/, "")));
  return page?.href ?? null;
}
