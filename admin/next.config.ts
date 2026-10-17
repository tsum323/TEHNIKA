import type { NextConfig } from "next";

/**
 * Админ-панель — отдельное статическое приложение.
 * На GitHub Pages она лежит в подпапке /<репозиторий>/admin/,
 * адрес передаётся при сборке через ADMIN_BASE_PATH. Локально — пусто.
 */
const basePath = process.env.ADMIN_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    // Админка лежит внутри репозитория сайта; корень сборки — эта папка.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
