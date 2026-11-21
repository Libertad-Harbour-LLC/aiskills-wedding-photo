"use client";

import { APP } from "@/lib/app.config";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="w-full border-t border-glass-border py-6 text-xs text-secondary-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>{APP.name}</div>
        <a href="https://aiskills.team" target="_blank" rel="noopener" className="hover:text-primary-text">
          {t("poweredBy")} <span className="font-bold text-primary-text">AI SKILLS</span>
        </a>
      </div>
    </footer>
  );
}
