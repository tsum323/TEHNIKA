import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

// Manrope поддерживает кириллицу. next/font скачивает шрифт при сборке
// и раздаёт его вместе с сайтом — внешних запросов из браузера нет.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Аренда строительной техники в Краснодарском крае — ${site.name}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  // Значок сайта — SVG из src/app/icon.svg (подключается автоматически).
};

export const viewport: Viewport = {
  themeColor: "#121519",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-control bg-signal px-4 py-3 font-semibold text-graphite-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Перейти к содержимому
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
