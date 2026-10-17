"use client";

import { useState } from "react";
import { EquipmentDialog } from "@/components/EquipmentDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, rowButtonClass } from "@/components/ui/Page";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useData } from "@/lib/data";
import { equipmentMarkup } from "@/lib/finance";
import { formatMoney, formatPercent } from "@/lib/format";
import { categoryLabels } from "@/lib/labels";
import type { Equipment } from "@/types/db";

export default function EquipmentPage() {
  const { isOwner } = useAuth();
  const { data } = useData();
  const [editing, setEditing] = useState<{ item: Equipment | null; key: number } | null>(null);
  const list = [...data.equipment].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, "ru"));

  return (
    <>
      <PageHeader
        title="Техника"
        description={isOwner ? "Цены для клиентов и закупочные цены поставщиков: сколько зарабатываем на каждой смене." : "Техника и цены для клиентов."}
        actions={<Button onClick={() => setEditing({ item: null, key: Date.now() })}>Добавить технику</Button>}
      />
      {list.length === 0 ? (
        <EmptyState>Техники пока нет.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Техника</th>
                <th scope="col" className="px-4 py-3">Категория</th>
                <th scope="col" className="px-4 py-3 text-right">Цена клиенту</th>
                {isOwner && (
                  <>
                    <th scope="col" className="px-4 py-3 text-right">Лучшая закупка</th>
                    <th scope="col" className="px-4 py-3 text-right">Разница за смену</th>
                    <th scope="col" className="px-4 py-3 text-right">Наценка</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((item) => {
                const m = equipmentMarkup(item, data.supplier_offers);
                return (
                  <tr key={item.id} className={rowButtonClass} onClick={() => setEditing({ item, key: Date.now() })}>
                    <td className="px-4 py-3">
                      <button type="button" className="text-left font-semibold underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); setEditing({ item, key: Date.now() }); }}>
                        {item.name}
                      </button>
                      {!item.is_active && <Badge className="ml-2">Не сдаём</Badge>}
                      {item.specs && <p className="text-xs text-muted">{item.specs}</p>}
                    </td>
                    <td className="px-4 py-3">{categoryLabels[item.category]}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{formatMoney(item.client_price_per_shift)}</td>
                    {isOwner && (
                      <>
                        <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{m ? formatMoney(m.offer.cost_per_shift) : <span className="text-muted">нет цены</span>}</td>
                        <td className={cn("px-4 py-3 text-right whitespace-nowrap font-semibold tabular-nums", m && (m.diff >= 0 ? "text-success" : "text-error"))}>
                          {m ? formatMoney(m.diff) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{m?.markup != null ? formatPercent(m.markup) : "—"}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {editing && <EquipmentDialog key={editing.key} item={editing.item} onClose={() => setEditing(null)} />}
    </>
  );
}
