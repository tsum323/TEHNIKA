import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Подключение к Supabase.
 * Адрес и публичный ключ передаются при сборке (GitHub Secrets → переменные окружения).
 * Публичный (anon/publishable) ключ не секретный: доступ к данным защищён входом
 * и правилами базы (Row Level Security) из admin/supabase/schema.sql.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
