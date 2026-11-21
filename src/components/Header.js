"use client";

import { APP } from "@/lib/app.config";
import { useLang } from "@/lib/i18n";

export default function Header() {
  const { lang, setLang, tx } = useLang();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-glass-border bg-bg-page/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-primary grid place-items-center font-black text-lg shrink-0">{APP.name.charAt(0)}</span>
          <span className="font-black tracking-tight text-primary-text truncate">{APP.name}</span>
        </a>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline text-xs text-secondary-text">{tx(APP.tagline)}</span>
          <div className="flex rounded-full border border-glass-border bg-glass-bg p-0.5" role="group" aria-label="Language">
            {["en", "ru"].map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${lang === l ? "bg-primary" : "text-secondary-text hover:text-primary-text"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
