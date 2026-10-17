import type { RentalRequest, RequestStatus } from "@/types/db";

/**
 * Календарь занятости техники.
 *
 * Аренда длится с даты начала по дату окончания включительно.
 * Если дата окончания не указана — считаем «1 смена = 1 день»: начало + смены − 1.
 */

/** Твёрдая бронь. */
export const CONFIRMED: RequestStatus[] = ["confirmed", "completed"];
/** Предварительная бронь — заявка ещё обсуждается. */
export const TENTATIVE: RequestStatus[] = ["new", "in_progress"];

/** Работа с датами в формате "2026-10-17" без часовых поясов. */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(day: string, days: number): string {
  const d = parseDay(day);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDay(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000);
}

export function todayDay(): string {
  const now = new Date();
  return formatDay(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

/** Дата окончания по умолчанию: начало + смены − 1. */
export function defaultEndDate(start: string | null, shifts: number | null): string | null {
  if (!start) return null;
  return addDays(start, Math.max(1, shifts ?? 1) - 1);
}

export function requestEnd(request: Pick<RentalRequest, "start_date" | "end_date" | "shifts">): string | null {
  return request.end_date ?? defaultEndDate(request.start_date, request.shifts);
}

export interface Booking {
  request: RentalRequest;
  start: string;
  end: string;
  tentative: boolean;
}

/** Заявки, которые занимают технику: с техникой, датой начала и не отменённые. */
export function bookings(requests: RentalRequest[]): Booking[] {
  return requests
    .filter((r) => r.equipment_id && r.start_date && r.status !== "cancelled")
    .map((r) => ({ request: r, start: r.start_date!, end: requestEnd(r)!, tentative: TENTATIVE.includes(r.status) }));
}

export function overlaps(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** Другие брони той же техники, пересекающиеся по датам с указанным периодом. */
export function conflictsFor(
  period: { equipmentId: string | null; start: string | null; end: string | null; excludeId?: string },
  requests: RentalRequest[],
): Booking[] {
  if (!period.equipmentId || !period.start) return [];
  const range = { start: period.start, end: period.end ?? period.start };
  return bookings(requests).filter(
    (b) => b.request.equipment_id === period.equipmentId && b.request.id !== period.excludeId && overlaps(b, range),
  );
}

/**
 * Раскладывает брони одной техники по «дорожкам», чтобы пересекающиеся не накладывались.
 * Возвращает брони с номером дорожки и признаком пересечения.
 */
export function layoutLanes(items: Booking[]): (Booking & { lane: number; conflict: boolean })[] {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
  const laneEnds: string[] = [];
  return sorted.map((item) => {
    let lane = laneEnds.findIndex((end) => end < item.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = item.end;
    const conflict = sorted.some((other) => other !== item && overlaps(other, item));
    return { ...item, lane, conflict };
  });
}
