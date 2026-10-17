"use client";

import { useState, type CSSProperties } from "react";
import { RequestDialog } from "@/components/RequestDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, Stat } from "@/components/ui/Page";
import { addDays, bookings, daysBetween, layoutLanes, overlaps, parseDay, todayDay, type Booking } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { categoryLabels, statusLabels, toOptions } from "@/lib/labels";
import type { RentalRequest } from "@/types/db";

const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "short", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("ru-RU", { month: "long", timeZone: "UTC" });

/** Полосатый фон для предварительной брони — отличается не только цветом. */
const tentativeStyle: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(135deg, var(--color-steel-200) 0 6px, var(--color-white) 6px 12px)",
};

export default function CalendarPage() {
  const { data } = useData();
  const today = todayDay();
  const [span, setSpan] = useState<14 | 31>(14);
  const [from, setFrom] = useState(() => addDays(today, -2));
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<{ request: RentalRequest; key: number } | null>(null);

  const to = addDays(from, span - 1);
  const days = Array.from({ length: span }, (_, i) => addDays(from, i));
  const all = bookings(data.requests);
  const inWindow = all.filter((b) => overlaps(b, { start: from, end: to }));

  const rows = data.equipment
    .filter((e) => !category || e.category === category)
    .filter((e) => e.is_active || inWindow.some((b) => b.request.equipment_id === e.id))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, "ru"))
    .map((item) => {
      const own = all.filter((b) => b.request.equipment_id === item.id);
      const now = own.filter((b) => b.start <= today && b.end >= today && !b.tentative);
      return {
        item,
        bars: layoutLanes(own.filter((b) => overlaps(b, { start: from, end: to }))),
        busyUntil: now.length ? now.map((b) => b.end).sort().at(-1)! : null,
      };
    });

  const busyToday = rows.filter((r) => r.busyUntil).length;
  const conflictCount = new Set(rows.flatMap((r) => r.bars.filter((b) => b.conflict).map((b) => b.request.id))).size;
  // Ширина сетки задаётся явно: столбцы дней делят место поровну, а длинные подписи на полосах обрезаются.
  const dayWidth = span === 14 ? 2.75 : 2.25;
  const columns = `11rem repeat(${span}, minmax(0, 1fr))`;
  const gridMinWidth = `${11 + span * dayWidth}rem`;

  return (
    <>
      <PageHeader title="Календарь занятости" description="Какая техника в каких заявках и когда освобождается." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Занято сегодня" value={`${busyToday} из ${rows.length}`} note="Подтверждённые заявки" />
        <Stat label="Пересечения в этом окне" value={String(conflictCount)} tone={conflictCount ? "negative" : undefined} note="Одна техника в двух заявках" />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setFrom(addDays(from, -Math.round(span / 2)))}>
            ← Раньше
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setFrom(addDays(today, -2))}>
            Сегодня
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFrom(addDays(from, Math.round(span / 2)))}>
            Позже →
          </Button>
          <span className="ml-1 text-sm font-semibold tabular-nums">
            {formatDate(from)} — {formatDate(to)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Масштаб" className="flex gap-1">
            {([14, 31] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={span === s}
                onClick={() => setSpan(s)}
                className={cn(
                  "h-9 rounded-full border px-3 text-sm font-semibold",
                  span === s ? "border-graphite-900 bg-graphite-900 text-white" : "border-border-strong bg-white hover:bg-surface",
                )}
              >
                {s === 14 ? "2 недели" : "Месяц"}
              </button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Категория"
            className="h-9 rounded-control border border-border-strong bg-white px-2 text-sm"
          >
            <option value="">Все категории</option>
            {toOptions(categoryLabels).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Legend />

      {rows.length === 0 ? (
        <EmptyState>Техники нет. Добавьте её в разделе «Техника».</EmptyState>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <div style={{ minWidth: gridMinWidth }}>
            {/* Шапка с датами */}
            <div className="grid border-b border-border bg-surface text-xs" style={{ gridTemplateColumns: columns }}>
              <div className="sticky left-0 z-20 bg-surface px-3 py-2 font-bold tracking-wide text-muted uppercase">Техника</div>
              {days.map((day, i) => {
                const d = parseDay(day);
                const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
                const firstOfMonth = d.getUTCDate() === 1 || i === 0;
                return (
                  <div key={day} className={cn("border-l border-border px-1 py-1 text-center", weekend && "bg-steel-200/60", day === today && "bg-signal/40 font-bold")}>
                    <div className="h-4 truncate text-[0.625rem] font-semibold text-muted">{firstOfMonth ? monthName.format(d) : ""}</div>
                    <div className="tabular-nums">{d.getUTCDate()}</div>
                    <div className="text-[0.625rem] text-muted">{weekday.format(d)}</div>
                  </div>
                );
              })}
            </div>

            {rows.map(({ item, bars, busyUntil }) => {
              const lanes = Math.max(1, ...bars.map((b) => b.lane + 1));
              return (
                <div
                  key={item.id}
                  className="grid border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: columns, gridTemplateRows: `repeat(${lanes}, 2.5rem)` }}
                >
                  <div className="sticky left-0 z-10 flex flex-col justify-center border-r border-border bg-white px-3 py-1" style={{ gridRow: "1 / -1", gridColumn: 1 }}>
                    <p className="truncate text-sm font-semibold" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-muted">{busyUntil ? `Занята до ${formatDate(busyUntil)}` : "Сейчас свободна"}</p>
                  </div>
                  {days.map((day, i) => {
                    const dow = parseDay(day).getUTCDay();
                    return (
                      <div
                        key={day}
                        aria-hidden="true"
                        className={cn("border-l border-border", (dow === 0 || dow === 6) && "bg-surface", day === today && "bg-signal/15")}
                        style={{ gridRow: "1 / -1", gridColumn: i + 2 }}
                      />
                    );
                  })}
                  {bars.map((bar) => (
                    <Bar key={bar.request.id} bar={bar} from={from} span={span} onOpen={() => setEditing({ request: bar.request, key: Date.now() })} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing && <RequestDialog key={editing.key} open request={editing.request} onClose={() => setEditing(null)} />}
    </>
  );
}

function Bar({ bar, from, span, onOpen }: { bar: Booking & { lane: number; conflict: boolean }; from: string; span: number; onOpen(): void }) {
  const startIndex = Math.max(0, daysBetween(from, bar.start));
  const endIndex = Math.min(span - 1, daysBetween(from, bar.end));
  const clippedLeft = bar.start < from;
  const clippedRight = daysBetween(from, bar.end) > span - 1;
  const { request } = bar;
  const label = `Заявка №${request.number}, ${request.contact_name}, ${formatDate(bar.start)}–${formatDate(bar.end)}, ${statusLabels[request.status]}${bar.tentative ? ", предварительно" : ""}${bar.conflict ? ", пересечение с другой заявкой" : ""}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      title={label}
      aria-label={label}
      className={cn(
        "relative z-[5] mx-0.5 my-1 flex min-w-0 items-center gap-1 overflow-hidden rounded-[4px] px-2 text-left text-xs font-semibold whitespace-nowrap",
        bar.tentative ? "border border-dashed border-graphite-600 text-ink" : request.status === "completed" ? "bg-steel-500 text-white" : "bg-graphite-800 text-white",
        bar.conflict && "ring-2 ring-error ring-offset-1",
      )}
      style={{ gridRow: bar.lane + 1, gridColumn: `${startIndex + 2} / ${endIndex + 3}`, ...(bar.tentative ? tentativeStyle : {}) }}
    >
      {clippedLeft && <span aria-hidden="true">‹</span>}
      {bar.conflict && <span aria-hidden="true">⚠</span>}
      <span className="truncate">
        №{request.number} {request.contact_name}
      </span>
      {clippedRight && <span aria-hidden="true" className="ml-auto">›</span>}
    </button>
  );
}

function Legend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-[3px] bg-graphite-800" /> Подтверждена
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-[3px] bg-steel-500" /> Выполнена
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-[3px] border border-dashed border-graphite-600" style={tentativeStyle} /> Предварительно (новая / в работе)
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-6 rounded-[3px] bg-graphite-800 ring-2 ring-error ring-offset-1" /> ⚠ Пересечение
      </li>
      <li className="flex items-center gap-2">
        <Badge tone="signal">Сегодня</Badge> — выделенный столбец
      </li>
    </ul>
  );
}
