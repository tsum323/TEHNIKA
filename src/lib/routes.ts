import type { CategoryId } from "@/types/equipment";

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
