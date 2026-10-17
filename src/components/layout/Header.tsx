"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";

const REQUEST_HREF = "/#contacts";

/** Шапка сайта: логотип, навигация, телефон, кнопка заявки и мобильное меню. */
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { contacts, navigation } = site;

  // Закрываем меню клавишей Escape и возвращаем фокус на кнопку меню.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Закрываем мобильное меню, если экран стал широким (поворот iPad).
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className="surface-dark sticky top-0 z-50 border-b border-white/10 bg-graphite-950/95 text-white backdrop-blur supports-[backdrop-filter]:bg-graphite-950/85">
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Logo />

        <nav aria-label="Основная навигация" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-control px-3 py-2 text-[0.9375rem] font-medium text-steel-300 transition-colors duration-150 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${contacts.phoneHref}`}
            className="hidden items-center gap-2 font-semibold whitespace-nowrap transition-colors hover:text-signal xl:inline-flex"
          >
            <Icon name="phone" className="size-4 text-signal" />
            {contacts.phone}
          </a>
          <ButtonLink href={REQUEST_HREF} size="sm">
            Оставить заявку
          </ButtonLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-control text-white hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} className="size-6" />
          <span className="sr-only">{open ? "Закрыть меню" : "Открыть меню"}</span>
        </button>
      </Container>

      <div
        id="mobile-menu"
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-graphite-950 lg:hidden"
      >
        <Container className="py-4">
          <nav aria-label="Мобильная навигация">
            <ul className="flex flex-col">
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-lg font-semibold"
                  >
                    {link.label}
                    <Icon name="arrowRight" className="size-5 text-signal" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`tel:${contacts.phoneHref}`} variant="ghost" size="lg" fullWidth className="sm:w-auto sm:flex-1">
              <Icon name="phone" className="size-5" />
              {contacts.phone}
            </ButtonLink>
            <ButtonLink href={REQUEST_HREF} size="lg" fullWidth className="sm:w-auto sm:flex-1" onClick={close}>
              Оставить заявку
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted-inverse">{contacts.workingHours}</p>
        </Container>
      </div>
    </header>
  );
}
