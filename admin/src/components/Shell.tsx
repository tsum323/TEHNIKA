"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { DataProvider, useData } from "@/lib/data";
import { demoSession } from "@/lib/demo";
import { roleLabels } from "@/lib/labels";
import { InactiveScreen, LoginScreen } from "./LoginScreen";
import { Badge } from "./ui/Badge";
import { ErrorNote } from "./ui/Page";

const nav = [
  { href: "/", label: "Обзор" },
  { href: "/requests/", label: "Заявки" },
  { href: "/payments/", label: "Оплаты" },
  { href: "/calendar/", label: "Календарь" },
  { href: "/equipment/", label: "Техника" },
  { href: "/suppliers/", label: "Поставщики" },
  { href: "/clients/", label: "Клиенты" },
  { href: "/stats/", label: "Статистика" },
  { href: "/team/", label: "Сотрудники", ownerOnly: true },
];

/** Проверяет вход и показывает либо экран входа, либо приложение. */
export function Gate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted" aria-busy="true">
        Загрузка…
      </main>
    );
  }
  if (status === "signedOut") return <LoginScreen />;
  if (status === "inactive") return <InactiveScreen />;
  return (
    <DataProvider>
      <Shell>{children}</Shell>
    </DataProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { profile, isOwner, isDemo, signOut } = useAuth();
  const { loading, error } = useData();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = nav.filter((item) => !item.ownerOnly || isOwner);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, "")));

  const navList = (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={isActive(item.href) ? "page" : undefined}
            className="flex min-h-11 items-center rounded-control px-3 font-semibold text-steel-300 transition-colors hover:bg-white/5 hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:text-signal"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const userBlock = (
    <div className="border-t border-white/10 pt-4">
      <p className="truncate text-sm font-semibold text-white">{profile?.full_name || profile?.email}</p>
      <p className="mt-1 flex items-center gap-2 text-xs text-muted-inverse">
        {profile && <Badge tone={profile.role === "owner" ? "signal" : "neutral"}>{roleLabels[profile.role]}</Badge>}
      </p>
      {!isDemo && (
        <button type="button" onClick={() => void signOut()} className="mt-3 text-sm font-semibold text-steel-300 underline-offset-4 hover:text-white hover:underline">
          Выйти
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Боковое меню на широком экране */}
      <aside className="surface-dark sticky top-0 hidden h-dvh flex-col gap-6 bg-graphite-950 p-4 lg:flex">
        <Brand />
        <nav aria-label="Разделы" className="flex-1">
          {navList}
        </nav>
        {userBlock}
      </aside>

      {/* Верхняя панель на iPad в вертикальном положении и телефоне */}
      <header className="surface-dark sticky top-0 z-40 bg-graphite-950 text-white lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Brand />
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-control hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            <span className="sr-only">{menuOpen ? "Закрыть меню" : "Открыть меню"}</span>
          </button>
        </div>
        <div id="admin-menu" hidden={!menuOpen} className="border-t border-white/10 px-4 pt-3 pb-4">
          <nav aria-label="Разделы">{navList}</nav>
          <div className="mt-4">{userBlock}</div>
        </div>
      </header>

      <div className="min-w-0">
        {isDemo && <DemoBanner />}
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {error && <ErrorNote>{error}</ErrorNote>}
          {loading ? <p className="py-20 text-center text-muted" aria-busy="true">Загрузка данных…</p> : children}
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold text-white">
      <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-control bg-signal text-sm text-graphite-950">
        А
      </span>
      Админ-панель
    </Link>
  );
}

/** Плашка демо-режима с переключателем роли — чтобы посмотреть, что видит менеджер. */
function DemoBanner() {
  const { profile } = useAuth();
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-signal/60 bg-signal/15 px-4 py-3 text-sm sm:px-6 lg:px-8")}>
      <p>
        <strong>Демо-режим.</strong> База не подключена: данные выдуманы и сбросятся при обновлении страницы.
      </p>
      <label className="flex items-center gap-2 font-semibold">
        Смотреть как
        <select
          value={profile?.role}
          onChange={(event) => demoSession.setRole(event.target.value as "owner" | "manager")}
          className="h-9 rounded-control border border-border-strong bg-white px-2"
        >
          <option value="owner">Владелец</option>
          <option value="manager">Менеджер</option>
        </select>
      </label>
    </div>
  );
}
