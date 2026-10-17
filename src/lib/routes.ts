import type { CategoryId, Equipment } from "@/types/equipment";

/** Адреса страниц сайта — в одном месте, чтобы не ошибиться в ссылках. */
export const routes = {
  home: "/",
  catalog: "/catalog/",
  contacts: "/#contacts",
} as const;

/** Адрес страницы категории: /catalog/excavators/ */
export function categoryHref(id: CategoryId): string {
  return `/catalog/${id}/`;
}

/** Адрес страницы машины: /catalog/excavators/excavator-crawler-22t/ */
export function equipmentHref(item: Pick<Equipment, "id" | "categoryId">): string {
  return `/catalog/${item.categoryId}/${item.id}/`;
}
