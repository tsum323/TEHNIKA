import type { MouseEvent } from "react";

/**
 * Плавная прокрутка к якорю на текущей странице.
 *
 * Если блок с нужным id есть на этой странице (например, форма #contacts есть почти везде),
 * прокручиваем к нему сами — это срабатывает и при повторном нажатии.
 * Если блока нет (например, #faq на странице каталога), ничего не делаем —
 * ссылка откроет главную страницу с этим якорем.
 */
export function scrollToHashOnPage(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;
  const id = href.slice(hashIndex + 1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;

  event.preventDefault();
  if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Прокручиваем в следующем кадре: сначала успевает закрыться мобильное меню,
  // иначе страница сдвинется после прокрутки и блок окажется не на своём месте.
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
}
