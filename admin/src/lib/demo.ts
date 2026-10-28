import type {
  CategoryId,
  Client,
  Equipment,
  Payment,
  PaymentMethod,
  Profile,
  RentalRequest,
  RequestCost,
  RequestSource,
  RequestStatus,
  StaffRole,
  Supplier,
  SupplierOffer,
  TableName,
  Tables,
} from "@/types/db";
import type { Db } from "./db";

/**
 * ДЕМО-РЕЖИМ — работает, пока база Supabase не подключена.
 * Все данные выдуманы, хранятся только в памяти браузера и пропадают при обновлении страницы.
 * Права повторяют правила настоящей базы: менеджер не видит закупочные цены и не может удалять.
 */

const DEMO_OWNER_ID = "demo-owner";
const DEMO_MANAGER_ID = "demo-manager";

let role: StaffRole = "owner";
const listeners = new Set<() => void>();

export const demoSession = {
  get role() {
    return role;
  },
  get userId() {
    return role === "owner" ? DEMO_OWNER_ID : DEMO_MANAGER_ID;
  },
  setRole(next: StaffRole) {
    role = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const OWNER_ONLY: TableName[] = ["supplier_offers", "request_costs"];

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

/** Детерминированный генератор псевдослучайных чисел — демо-данные одинаковые при каждом запуске. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function buildSeed(): { [K in TableName]: Tables[K][] } {
  const created = isoDaysAgo(200);
  const profiles: Profile[] = [
    { id: DEMO_OWNER_ID, email: "owner@example.com", full_name: "Владелец (демо)", role: "owner", is_active: true, created_at: created },
    { id: DEMO_MANAGER_ID, email: "manager@example.com", full_name: "Менеджер (демо)", role: "manager", is_active: true, created_at: created },
    { id: "demo-new", email: "new@example.com", full_name: "", role: "manager", is_active: false, created_at: isoDaysAgo(2) },
  ];

  const suppliers: Supplier[] = [
    { id: "s1", name: "Поставщик А (демо)", contact_person: "Иван", phone: "+7 (000) 000-00-01", email: "a@example.com", city: "Краснодар", notes: "", created_at: created },
    { id: "s2", name: "Поставщик Б (демо)", contact_person: "Олег", phone: "+7 (000) 000-00-02", email: "b@example.com", city: "Новороссийск", notes: "Скидка при заказе от 40 часов", created_at: created },
    { id: "s3", name: "Поставщик В (демо)", contact_person: "Анна", phone: "+7 (000) 000-00-03", email: "c@example.com", city: "Армавир", notes: "", created_at: created },
  ];

  const eq = (id: string, name: string, category: CategoryId, price: number, specs: string, min = 1): Equipment => ({
    id, name, category, specs, client_price_per_hour: price, min_hours: min, is_active: true, notes: "", created_at: created,
  });
  const equipment: Equipment[] = [
    eq("e1", "Гусеничный экскаватор 22 т", "excavators", 2800, "Ковш 1,0 м³, копание 6,5 м", 4),
    eq("e2", "Колёсный экскаватор 16 т", "excavators", 2500, "Ковш 0,7 м³", 4),
    eq("e3", "Экскаватор-погрузчик 8 т", "backhoe-loaders", 1800, "Ковш 1,0 / 0,2 м³", 2),
    eq("e4", "Экскаватор-погрузчик с гидромолотом", "backhoe-loaders", 2200, "Гидромолот", 2),
    eq("e5", "Автокран 25 т", "truck-cranes", 2500, "Стрела 28 м", 4),
    eq("e6", "Автокран 50 т", "truck-cranes", 4500, "Стрела 40 м", 4),
    eq("e7", "Самосвал 20 м³", "dump-trucks", 2000, "25 т, 6×4", 8),
    eq("e8", "Самосвал 10 м³", "dump-trucks", 1700, "15 т, 6×6", 8),
    eq("e9", "Грунтовый каток 12 т", "rollers", 2000, "Валец 2,1 м", 8),
    eq("e10", "Асфальтовый тандемный каток", "rollers", 1700, "4 т", 8),
    eq("e11", "Фронтальный погрузчик 3 м³", "wheel-loaders", 2200, "5 т", 2),
    eq("e12", "Мини-погрузчик", "wheel-loaders", 1500, "Ковш 0,5 м³", 2),
  ];

  const offer = (equipment_id: string, supplier_id: string, cost: number): SupplierOffer => ({
    id: `${equipment_id}-${supplier_id}`, equipment_id, supplier_id, cost_per_hour: cost, notes: "", created_at: created,
  });
  const supplier_offers: SupplierOffer[] = [
    offer("e1", "s1", 2200), offer("e1", "s2", 2100), offer("e2", "s1", 2000), offer("e3", "s2", 1400),
    offer("e4", "s2", 1700), offer("e5", "s3", 1900), offer("e6", "s3", 3600), offer("e7", "s1", 1550),
    offer("e7", "s3", 1600), offer("e8", "s1", 1300), offer("e9", "s2", 1500), offer("e10", "s2", 1300),
    offer("e11", "s3", 1700), offer("e12", "s1", 1150),
  ];

  const clients: Client[] = [
    { id: "c1", name: "ООО «СтройПример» (демо)", kind: "company", phone: "+7 (000) 111-11-11", email: "", notes: "", created_at: created },
    { id: "c2", name: "ИП Примеров (демо)", kind: "company", phone: "+7 (000) 222-22-22", email: "", notes: "Работает по договору", created_at: created },
    { id: "c3", name: "Пётр (демо)", kind: "person", phone: "8 (000) 333-33-33", email: "", notes: "", created_at: created },
    { id: "c4", name: "ООО «ДорогиЮга» (демо)", kind: "company", phone: "+7 (000) 444-44-44", email: "", notes: "", created_at: created },
  ];

  const rnd = seeded(7);
  const statuses: RequestStatus[] = ["completed", "completed", "completed", "completed", "confirmed", "in_progress", "new", "cancelled"];
  const sources: RequestSource[] = ["site", "phone", "phone", "messenger", "repeat", "other"];
  const requests: RentalRequest[] = [];
  const request_costs: RequestCost[] = [];
  for (let i = 0; i < 36; i++) {
    const daysAgo = Math.floor(rnd() * 180);
    const item = equipment[Math.floor(rnd() * equipment.length)];
    const client = rnd() < 0.75 ? clients[Math.floor(rnd() * clients.length)] : null;
    // Свежие заявки чаще новые и в работе, старые — выполнены или отменены.
    const status: RequestStatus = daysAgo < 10 ? (["new", "in_progress", "confirmed"] as const)[i % 3] : statuses[Math.floor(rnd() * statuses.length)];
    const hours = Math.max(item.min_hours, 4 * (1 + Math.floor(rnd() * 10)));
    const start = isoDaysAgo(daysAgo).slice(0, 10);
    const id = `r${i + 1}`;
    requests.push({
      id, number: i + 1, client_id: client?.id ?? null,
      contact_name: client?.name ?? "Частный заказчик (демо)", contact_phone: client?.phone ?? "+7 (000) 555-55-55",
      source: sources[Math.floor(rnd() * sources.length)], category: item.category, equipment_id: item.id,
      address: "Краснодарский край (демо)", start_date: start, end_date: null, hours, client_price_per_hour: item.client_price_per_hour,
      status, comment: "", created_by: DEMO_MANAGER_ID, created_at: isoDaysAgo(daysAgo + 3),
    });
    const best = supplier_offers.filter((o) => o.equipment_id === item.id).sort((a, b) => a.cost_per_hour - b.cost_per_hour)[0];
    if (best && (status === "completed" || status === "confirmed")) {
      request_costs.push({ request_id: id, supplier_id: best.supplier_id, cost_per_hour: best.cost_per_hour, extra_costs: rnd() < 0.5 ? 3000 : 0, notes: "" });
    }
  }
  // Брони на ближайшие недели — чтобы календарь занятости был наглядным (есть и одно пересечение).
  const future: [string, number, number, RequestStatus, string][] = [
    ["e1", 1, 40, "confirmed", "c1"], ["e1", 4, 24, "in_progress", "c3"], ["e5", 2, 16, "confirmed", "c4"],
    ["e7", 0, 80, "confirmed", "c2"], ["e9", 6, 32, "new", "c1"], ["e11", 3, 48, "confirmed", "c4"],
    ["e3", 9, 24, "in_progress", "c2"], ["e6", 12, 16, "confirmed", "c1"], ["e12", 1, 32, "confirmed", "c3"],
  ];
  future.forEach(([equipmentId, inDays, hours, status, clientId], i) => {
    const item = equipment.find((e) => e.id === equipmentId)!;
    const client = clients.find((c) => c.id === clientId)!;
    const start = isoDaysAgo(-inDays).slice(0, 10);
    const id = `f${i + 1}`;
    requests.push({
      id, number: requests.length + 1, client_id: client.id, contact_name: client.name, contact_phone: client.phone,
      source: "phone", category: item.category, equipment_id: item.id, address: "Краснодарский край (демо)",
      start_date: start, end_date: null, hours, client_price_per_hour: item.client_price_per_hour,
      status, comment: "", created_by: DEMO_MANAGER_ID, created_at: isoDaysAgo(2),
    });
    const best = supplier_offers.filter((o) => o.equipment_id === item.id).sort((a, b) => a.cost_per_hour - b.cost_per_hour)[0];
    if (best && status === "confirmed") request_costs.push({ request_id: id, supplier_id: best.supplier_id, cost_per_hour: best.cost_per_hour, extra_costs: 0, notes: "" });
  });
  requests.sort((a, b) => b.number - a.number);

  // Оплаты: большинство выполненных заявок оплачено полностью, часть — частично, часть — долг.
  const payments: Payment[] = [];
  const methods: PaymentMethod[] = ["bank", "bank", "cash", "card"];
  const pay = (r: RentalRequest, direction: Payment["direction"], amount: number, daysAfterStart: number) => {
    const date = new Date(r.start_date ?? r.created_at);
    date.setDate(date.getDate() + daysAfterStart);
    const today = new Date();
    payments.push({
      id: `p${payments.length + 1}`, request_id: r.id, direction, amount: Math.round(amount),
      paid_at: (date > today ? today : date).toISOString().slice(0, 10),
      method: methods[Math.floor(rnd() * methods.length)], comment: "", created_by: DEMO_MANAGER_ID, created_at: date.toISOString(),
    });
  };
  for (const r of requests) {
    if (r.status !== "completed" && r.status !== "confirmed") continue;
    const revenue = (r.client_price_per_hour ?? 0) * (r.hours ?? 0);
    const cost = request_costs.find((c) => c.request_id === r.id);
    const roll = rnd();
    if (r.status === "completed") {
      if (roll < 0.65) pay(r, "incoming", revenue, 3);
      else if (roll < 0.85) { pay(r, "incoming", revenue * 0.5, 0); }
      // иначе — клиент ещё не платил (должник)
    } else if (roll < 0.5) pay(r, "incoming", revenue * 0.3, -2); // предоплата
    if (cost && r.status === "completed") {
      const total = cost.cost_per_hour * (r.hours ?? 0) + cost.extra_costs;
      if (rnd() < 0.8) pay(r, "outgoing", total, 7);
      else pay(r, "outgoing", total * 0.5, 2);
    }
  }

  return { profiles, suppliers, equipment, supplier_offers, clients, requests, request_costs, payments };
}

let data = buildSeed();
let nextNumber = data.requests.length + 1;

function denied(): never {
  throw new Error("Недостаточно прав для этого действия.");
}

function matches<T>(row: T, key: Partial<T>): boolean {
  return (Object.keys(key) as (keyof T)[]).every((k) => row[k] === key[k]);
}

function rows<T extends TableName>(table: T): Tables[T][] {
  return data[table] as Tables[T][];
}

function canRead(table: TableName) {
  return role === "owner" || !OWNER_ONLY.includes(table);
}

function canWrite(table: TableName) {
  if (table === "profiles") return role === "owner";
  return canRead(table);
}

/** Как в базе: менеджер видит и вносит только оплаты от клиентов. */
function rowAllowed(table: TableName, row: Record<string, unknown>) {
  return role === "owner" || table !== "payments" || row.direction === "incoming";
}

export const demoDb: Db = {
  async list(table) {
    if (!canRead(table)) return [];
    return rows(table)
      .filter((row) => rowAllowed(table, row as unknown as Record<string, unknown>))
      .map((row) => ({ ...row }));
  },
  async insert(table, row) {
    if (!canWrite(table) || !rowAllowed(table, row as Record<string, unknown>)) denied();
    const now = new Date().toISOString();
    const full = { id: uid(), created_at: now, ...row } as Tables[typeof table];
    if (table === "requests") Object.assign(full, { number: nextNumber++, created_by: demoSession.userId });
    if (table === "payments") Object.assign(full, { created_by: demoSession.userId });
    data = { ...data, [table]: [full, ...rows(table)] };
    return { ...full };
  },
  async update(table, key, patch) {
    if (!canWrite(table) || !rowAllowed(table, { direction: "incoming", ...(patch as Record<string, unknown>) })) denied();
    data = { ...data, [table]: rows(table).map((row) => (matches(row, key) ? { ...row, ...patch } : row)) };
  },
  async upsert(table, row) {
    if (!canWrite(table)) denied();
    // В демо upsert используется только для request_costs (ключ request_id).
    const keyField = table === "request_costs" ? "request_id" : "id";
    const key = { [keyField]: (row as Record<string, unknown>)[keyField] } as Partial<Tables[typeof table]>;
    const exists = rows(table).some((r) => matches(r, key));
    data = {
      ...data,
      [table]: exists ? rows(table).map((r) => (matches(r, key) ? { ...r, ...row } : r)) : [row as Tables[typeof table], ...rows(table)],
    };
  },
  async remove(table, key) {
    if (role !== "owner") denied();
    data = { ...data, [table]: rows(table).filter((row) => !matches(row, key)) };
  },
};

export function demoProfile(): Profile {
  return data.profiles.find((p) => p.id === demoSession.userId)!;
}
