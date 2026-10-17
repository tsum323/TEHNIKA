"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { TableName, Tables } from "@/types/db";
import { useAuth } from "./auth";
import { db } from "./db";

type AllData = { [K in TableName]: Tables[K][] };

const empty: AllData = {
  profiles: [],
  suppliers: [],
  equipment: [],
  supplier_offers: [],
  clients: [],
  requests: [],
  request_costs: [],
  payments: [],
};

const ALL_TABLES = Object.keys(empty) as TableName[];

interface DataContextValue {
  data: AllData;
  loading: boolean;
  error: string | null;
  /** Перечитать таблицы из базы после изменения. Без аргумента — все. */
  refresh(tables?: TableName[]): Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Загружает все таблицы после входа. Для небольшой компании это сотни-тысячи строк —
 * проще и быстрее держать всё в памяти и считать статистику прямо в браузере.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const { status, profile } = useAuth();
  const [data, setData] = useState<AllData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (tables: TableName[] = ALL_TABLES) => {
    try {
      const results = await Promise.all(tables.map((table) => db.list(table)));
      setData((prev) => {
        const next = { ...prev };
        tables.forEach((table, i) => {
          (next as Record<TableName, unknown[]>)[table] = results[i];
        });
        return next;
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить данные.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Перезагружаем всё при входе и при смене пользователя или роли.
  useEffect(() => {
    if (status !== "ready") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- загрузка данных при смене пользователя
    setLoading(true);
    void refresh();
  }, [status, profile?.id, profile?.role, refresh]);

  return <DataContext.Provider value={{ data, loading, error, refresh }}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData должен использоваться внутри DataProvider");
  return value;
}
