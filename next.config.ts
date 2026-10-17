import type { NextConfig } from "next";

/**
 * Базовый путь сайта.
 *
 * На GitHub Pages сайт открывается в подпапке с именем репозитория:
 * https://<владелец>.github.io/<репозиторий>/
 * Поэтому при сборке в GitHub Actions передаётся переменная NEXT_PUBLIC_BASE_PATH
 * (например, "/TEHNIKA"). При локальном запуске она пустая и сайт работает от корня.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Статический экспорт: после `npm run build` готовый сайт лежит в папке out/.
  output: "export",
  basePath,
  // Страницы сохраняются как папка/index.html — так GitHub Pages отдаёт их без ошибок.
  trailingSlash: true,
  images: {
    // Серверная оптимизация изображений на GitHub Pages недоступна.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
