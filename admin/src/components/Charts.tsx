import { cn } from "@/lib/cn";

/**
 * Простые графики без библиотек.
 * Один ряд данных — один цвет (графитовый). Значения подписаны прямо на графике,
 * под графиком — таблица с теми же числами (для скринридеров и точного чтения).
 */

interface ColumnChartProps {
  title: string;
  /** label — подпись под столбцом, fullLabel — для подсказки и таблицы. */
  data: { label: string; fullLabel: string; value: number }[];
  format(value: number): string;
  /** Короткая подпись над столбцом (например, «125 тыс»). */
  short(value: number): string;
}

/** Вертикальные столбцы по месяцам. Отрицательные значения уходят вниз от нулевой линии. */
export function ColumnChart({ title, data, format, short }: ColumnChartProps) {
  const max = Math.max(0, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const range = max - min || 1;
  const posShare = (max / range) * 100;

  return (
    <figure className="min-w-0">
      <figcaption className="mb-3 font-bold">{title}</figcaption>
      <div className="overflow-x-auto">
        <div className="flex h-56 min-w-full items-stretch gap-1.5" style={{ minWidth: `${data.length * 2.25}rem` }} aria-hidden="true">
          {data.map((d) => {
            const h = (Math.abs(d.value) / range) * 100;
            return (
              <div key={d.fullLabel} className="group relative flex min-w-0 flex-1 flex-col" title={`${d.fullLabel}: ${format(d.value)}`}>
                <div className="flex flex-col justify-end" style={{ height: `${posShare}%` }}>
                  {d.value > 0 && (
                    <>
                      <span className="mb-1 text-center text-[0.6875rem] leading-tight font-semibold text-muted tabular-nums">{short(d.value)}</span>
                      <div className="rounded-t-[4px] bg-graphite-800 transition-colors group-hover:bg-graphite-600" style={{ height: `${(h / posShare) * 100}%` }} />
                    </>
                  )}
                </div>
                <div className="border-t border-border-strong" />
                <div className="flex flex-1 flex-col justify-start">
                  {d.value < 0 && (
                    <>
                      <div className="rounded-b-[4px] bg-graphite-800" style={{ height: `${(h / (100 - posShare)) * 100}%` }} />
                      <span className="mt-1 text-center text-[0.6875rem] font-semibold text-error tabular-nums">{short(d.value)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex min-w-full gap-1.5" style={{ minWidth: `${data.length * 2.25}rem` }} aria-hidden="true">
          {data.map((d) => (
            <span key={d.fullLabel} className="flex-1 text-center text-[0.6875rem] leading-tight whitespace-pre-line text-muted">
              {d.label}
            </span>
          ))}
        </div>
      </div>
      <DataTable rows={data.map((d) => [d.fullLabel, format(d.value)])} />
    </figure>
  );
}

interface BarListProps {
  title: string;
  data: { label: string; value: number; count?: number }[];
  format(value: number): string;
  limit?: number;
  empty?: string;
}

/** Горизонтальный рейтинг: подпись, полоса, значение. */
export function BarList({ title, data, format, limit = 6, empty = "Нет данных за период." }: BarListProps) {
  const rows = data.slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  return (
    <figure className="min-w-0">
      <figcaption className="mb-3 font-bold">{title}</figcaption>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className={cn("font-semibold whitespace-nowrap tabular-nums", r.value < 0 && "text-error")}>{format(r.value)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-surface" aria-hidden="true">
                <div className="h-2 rounded-full bg-graphite-800" style={{ width: `${(Math.abs(r.value) / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

function DataTable({ rows }: { rows: string[][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-semibold text-muted">Показать таблицей</summary>
      <table className="mt-2 w-full">
        <tbody className="divide-y divide-border">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" className="py-1.5 text-left font-normal">{label}</th>
              <td className="py-1.5 text-right tabular-nums">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
