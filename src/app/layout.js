import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { APP } from "@/lib/app.config";
import { LangProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Outfit for the look, Inter for Cyrillic (Outfit has no Cyrillic glyphs).
const outfit = Outfit({ subsets: ["latin", "latin-ext"], display: "swap" });
const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata = {
  title: `${APP.name} — ${APP.tagline.en}`,
  description: APP.description.en,
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme={APP.theme}>
      <body style={{ fontFamily: `${outfit.style.fontFamily}, ${inter.style.fontFamily}, system-ui, sans-serif` }}
        className={`min-h-dvh flex flex-col antialiased bg-bg-page text-primary-text`}>
        <LangProvider>
          <Header />
          {children}
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
