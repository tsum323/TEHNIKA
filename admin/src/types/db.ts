/**
 * Типы таблиц базы данных. Соответствуют admin/supabase/schema.sql —
 * при изменении схемы обновите и этот файл.
 */

export type StaffRole = "owner" | "manager";

export type CategoryId =
  | "excavators"
  | "backhoe-loaders"
  | "truck-cranes"
  | "dump-trucks"
  | "rollers"
  | "wheel-loaders";

export type RequestStatus = "new" | "in_progress" | "confirmed" | "completed" | "cancelled";
export type RequestSource = "site" | "phone" | "messenger" | "repeat" | "other";
export type ClientKind = "company" | "person";
export type PaymentDirection = "incoming" | "outgoing";
export type PaymentMethod = "bank" | "cash" | "card" | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: CategoryId;
  specs: string;
  /** Цена для клиента за час. */
  client_price_per_hour: number;
  min_hours: number;
  is_active: boolean;
  notes: string;
  created_at: string;
}

/** Закупочная цена: сколько стоит час работы этой техники у поставщика. Только владелец. */
export interface SupplierOffer {
  id: string;
  equipment_id: string;
  supplier_id: string;
  cost_per_hour: number;
  notes: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  kind: ClientKind;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
}

export interface RentalRequest {
  id: string;
  number: number;
  client_id: string | null;
  contact_name: string;
  contact_phone: string;
  source: RequestSource;
  category: CategoryId | null;
  equipment_id: string | null;
  address: string;
  start_date: string | null;
  /** Дата окончания аренды. null — считается по количеству часов (8 часов = 1 день). */
  end_date: string | null;
  hours: number | null;
  client_price_per_hour: number | null;
  status: RequestStatus;
  comment: string;
  created_by: string | null;
  created_at: string;
}

/** Расходы по заявке: у кого взяли технику и за сколько. Только владелец. */
export interface RequestCost {
  request_id: string;
  supplier_id: string | null;
  cost_per_hour: number;
  extra_costs: number;
  notes: string;
}

/**
 * Оплата по заявке.
 * incoming — деньги от клиента; outgoing — оплата поставщику и расходов (видит только владелец).
 */
export interface Payment {
  id: string;
  request_id: string;
  direction: PaymentDirection;
  amount: number;
  /** Дата оплаты "2026-10-17". */
  paid_at: string;
  method: PaymentMethod;
  comment: string;
  created_by: string | null;
  created_at: string;
}

/** Все таблицы и типы их строк. */
export interface Tables {
  profiles: Profile;
  suppliers: Supplier;
  equipment: Equipment;
  supplier_offers: SupplierOffer;
  clients: Client;
  requests: RentalRequest;
  request_costs: RequestCost;
  payments: Payment;
}

export type TableName = keyof Tables;
