import Link from "next/link";
import { getMinOrderHours } from "@/content/equipment";
import { formatHours, formatPrice } from "@/lib/format";
import { equipmentHref } from "@/lib/routes";
import type { Equipment } from "@/types/equipment";

interface SpecsTableProps {
  items: Equipment[];
  caption: string;
}

/**
 * Таблица сравнения моделей одной категории.
 * Строки — характеристики (объединение всех характеристик моделей), столбцы — модели.
 * На узких экранах таблица прокручивается внутри своего блока, страница не «уезжает».
 */
export function SpecsTable({ items, caption }: SpecsTableProps) {
  const labels = [...new Set(items.flatMap((item) => item.specs.map((spec) => spec.label)))];

  const rows: { label: string; values: string[] }[] = [
    ...labels.map((label) => ({
      label,
      values: items.map((item) => item.specs.find((spec) => spec.label === label)?.value ?? "—"),
    })),
    { label: "Цена за час", values: items.map((item) => `от ${formatPrice(item.pricePerHour)}`) },
    { label: "Минимальный заказ", values: items.map((item) => formatHours(getMinOrderHours(item))) },
  ];

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card" tabIndex={0} role="region" aria-label={caption}>
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-graphite-900 text-white">
            <th scope="col" className="w-1/3 px-5 py-4 font-semibold text-steel-300">
              Характеристика
            </th>
            {items.map((item) => (
              <th key={item.id} scope="col" className="px-5 py-4 font-bold">
                <Link href={equipmentHref(item)} className="underline decoration-white/30 underline-offset-4 hover:decoration-signal">
                  {item.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.label} className="even:bg-surface">
              <th scope="row" className="px-5 py-3 font-medium text-muted">
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td key={items[index].id} className="px-5 py-3 font-semibold">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
