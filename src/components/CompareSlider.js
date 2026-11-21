"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

// Before / after comparison: the result defines the size, the original is clipped on top.
export default function CompareSlider({ before, after }) {
  const { t } = useLang();
  const [pos, setPos] = useState(50);
  return (
    <div className="relative select-none">
      <img src={after} alt={t("after")} className="w-full h-auto block" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={t("before")} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white/90 shadow pointer-events-none" style={{ left: `${pos}%` }} />
      <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-[10px] font-bold uppercase tracking-widest text-white">{t("before")}</span>
      <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-[10px] font-bold uppercase tracking-widest text-white">{t("after")}</span>
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`${t("before")} / ${t("after")}`}
        className="absolute inset-x-0 bottom-3 mx-auto w-2/3 accent-[var(--color-primary)]" />
    </div>
  );
}
