/**
 * Добавляет базовый путь сайта к ссылке на файл из папки public/.
 *
 * Next.js сам добавляет basePath к ссылкам <Link>, но не к адресам картинок.
 * На GitHub Pages сайт лежит в подпапке (/<репозиторий>/), поэтому для изображений
 * используем эту функцию: asset("/placeholders/excavator.svg").
 */
export function asset(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}
