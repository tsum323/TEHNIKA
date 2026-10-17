import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { Gate } from "@/components/Shell";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Админ-панель", template: "%s — Админ-панель" },
  // Служебное приложение: не индексируется поисковиками.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#121519" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <AuthProvider>
          <Gate>{children}</Gate>
        </AuthProvider>
      </body>
    </html>
  );
}
