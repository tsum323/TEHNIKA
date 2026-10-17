import type { TableName, Tables } from "@/types/db";
import { demoDb } from "./demo";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Единый способ работы с данными. Страницы не знают, откуда данные:
 * из Supabase или из демо-режима (если база не подключена).
 */
export interface Db {
  list<T extends TableName>(table: T): Promise<Tables[T][]>;
  insert<T extends TableName>(table: T, row: Partial<Tables[T]>): Promise<Tables[T]>;
  update<T extends TableName>(table: T, key: Partial<Tables[T]>, patch: Partial<Tables[T]>): Promise<void>;
  upsert<T extends TableName>(table: T, row: Partial<Tables[T]>): Promise<void>;
  remove<T extends TableName>(table: T, key: Partial<Tables[T]>): Promise<void>;
}

/** Сообщение об ошибке на русском для частых случаев. */
function explain(error: { message: string; code?: string }): Error {
  if (error.code === "42501" || /row-level security|permission denied/i.test(error.message)) {
    return new Error("Недостаточно прав для этого действия.");
  }
  if (error.code === "23503") return new Error("Запись связана с другими данными и не может быть удалена.");
  if (error.code === "23505") return new Error("Такая запись уже существует.");
  if (/fetch|network/i.test(error.message)) return new Error("Нет связи с базой. Проверьте интернет и попробуйте ещё раз.");
  return new Error(error.message);
}

// Таблицы описаны своими типами в src/types/db.ts, поэтому клиенту Supabase передаём простые объекты.
type Row = Record<string, unknown>;

function createSupabaseDb(client: SupabaseClient): Db {
  return {
    async list(table) {
      const { data, error } = await client.from(table).select("*");
      if (error) throw explain(error);
      return data ?? [];
    },
    async insert(table, row) {
      const { data, error } = await client.from(table).insert(row as Row).select().single();
      if (error) throw explain(error);
      return data;
    },
    async update(table, key, patch) {
      const { error } = await client.from(table).update(patch as Row).match(key as Row);
      if (error) throw explain(error);
    },
    async upsert(table, row) {
      const { error } = await client.from(table).upsert(row as Row);
      if (error) throw explain(error);
    },
    async remove(table, key) {
      const { error } = await client.from(table).delete().match(key as Row);
      if (error) throw explain(error);
    },
  };
}

export const db: Db = supabase ? createSupabaseDb(supabase) : demoDb;
