"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { catalog } from "@/content/catalog";
import { cn } from "@/lib/cn";
import { scrollToHashOnPage } from "@/lib/hashLink";
import { plural } from "@/lib/format";
import { routes } from "@/lib/routes";
import { searchCatalog, type SearchItem } from "@/lib/search";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

interface CatalogSearchProps {
  /** Список для поиска — собирается при сборке в buildSearchIndex(). */
  index: SearchItem[];
}

const text = catalog.search;

/** Выделяет в названии совпавшие слова запроса. */
function highlight(title: string, query: string): ReactNode {
  // ё → е не меняет длину строки, поэтому позиции совпадений совпадают с исходным названием
  const lower = title.toLowerCase().replace(/ё/g, "е");
  const words = query.toLowerCase().replace(/ё/g, "е").split(/\s+/).filter(Boolean);
  const marked = new Array<boolean>(title.length).fill(false);
  for (const word of words) {
    let from = lower.indexOf(word);
    while (from !== -1) {
      marked.fill(true, from, from + word.length);
      from = lower.indexOf(word, from + word.length);
    }
  }
  const parts: ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= title.length; i++) {
    if (i === title.length || marked[i] !== marked[start]) {
      const chunk = title.slice(start, i);
      parts.push(
        marked[start] ? (
          <mark key={start} className="rounded-sm bg-signal/60 text-inherit">
            {chunk}
          </mark>
        ) : (
          chunk
        ),
      );
      start = i;
    }
  }
  return parts;
}

/** Строка поиска по каталогу: подсказки появляются по мере ввода. */
export function CatalogSearch({ index }: CatalogSearchProps) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const results = useMemo(() => searchCatalog(index, query), [index, query]);
  const hasQuery = query.trim().length > 0;
  const showPanel = open && hasQuery;

  // Закрываем подсказки при нажатии за пределами поиска
  useEffect(() => {
    if (!showPanel) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showPanel]);

  function change(value: string) {
    setQuery(value);
    setActive(-1);
    setOpen(true);
  }

  function go(item: SearchItem) {
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!hasQuery || results.length === 0) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      const target = results[active] ?? results[0];
      if (showPanel && target) {
        event.preventDefault();
        go(target);
      }
    } else if (event.key === "Escape") {
      if (showPanel) setOpen(false);
      else change("");
    }
  }

  const activeId = showPanel && active >= 0 ? `${id}-option-${active}` : undefined;
  const status = !hasQuery
    ? ""
    : results.length > 0
      ? `Найдено ${results.length} ${plural(results.length, ["вариант", "варианта", "вариантов"])}`
      : text.emptyTitle;

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={`${id}-input`} className="text-sm font-semibold text-ink">
        {text.label}
      </label>
      <div className="relative mt-2">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-steel-500"
        />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          enterKeyHint="search"
          spellCheck={false}
          placeholder={text.placeholder}
          value={query}
          onChange={(event) => change(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-14 w-full appearance-none rounded-control border border-border-strong bg-white pr-12 pl-12 text-base text-ink",
            "placeholder:text-steel-500 hover:border-steel-400",
            "transition-[border-color,box-shadow] duration-150",
            "focus:border-graphite-900 focus:ring-4 focus:ring-signal/50 focus:outline-none",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              change("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-control text-steel-500 transition-colors hover:bg-surface hover:text-ink"
          >
            <Icon name="close" className="size-5" />
            <span className="sr-only">{text.clearButton}</span>
          </button>
        )}
        <div
          className={cn(
            "absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-card border border-border bg-white shadow-card-hover",
            !showPanel && "hidden",
          )}
        >
          <ul
            id={listId}
            role="listbox"
            aria-label={text.label}
            className={cn("max-h-[min(26rem,60vh)] overflow-y-auto", results.length > 0 && "py-2")}
          >
            {results.map((item, i) => (
              <li
                key={item.href}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
              >
                <Link
                  href={item.href}
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    i === active ? "bg-surface" : "hover:bg-surface",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{highlight(item.title, query.trim())}</span>
                      {item.kind === "category" && <Badge variant="signal">{text.categoryLabel}</Badge>}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{item.subtitle}</span>
                  </span>
                  <Icon name="arrowRight" className="size-5 shrink-0 text-steel-400" />
                </Link>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <div className="px-4 py-4">
              <p className="font-semibold">{text.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted">{text.emptyText}</p>
              <Link
                href={routes.contacts}
                onClick={(event) => {
                  setOpen(false);
                  scrollToHashOnPage(event, routes.contacts);
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-signal decoration-2 underline-offset-4"
              >
                {text.emptyLink}
                <Icon name="arrowRight" className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">{text.examplesLabel}</span>
        {text.examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              change(example);
              inputRef.current?.focus();
            }}
            className="rounded-sm border border-border-strong px-2.5 py-1 font-semibold text-graphite-700 transition-colors hover:border-graphite-900 hover:text-ink"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
