"use client";

import { WHO, SCENES, ATTIRE, ASPECTS, RESOLUTIONS } from "@/lib/app.config";
import { useLang } from "@/lib/i18n";
import { PresetGrid, LabeledChips, TextField } from "./Presets";

export default function Options({ state, set, Chips }) {
  const { t } = useLang();
  return (
    <>
      <LabeledChips label={{ en: "Who is in the photo", ru: "Кто на фото" }} items={WHO} value={state.who} onChange={(v) => set({ who: v })} />
      <PresetGrid label={{ en: "Location", ru: "Место" }} items={SCENES} value={state.scene} onChange={(v) => set({ scene: v })} />
      <LabeledChips label={{ en: "Outfits", ru: "Наряды" }} items={ATTIRE} value={state.attire} onChange={(v) => set({ attire: v })} />
      <Chips label={t("aspect")} options={ASPECTS} value={state.aspect} onChange={(v) => set({ aspect: v })} />
      <Chips label={t("resolution")} options={RESOLUTIONS} value={state.resolution} onChange={(v) => set({ resolution: v })} render={(v) => v.toUpperCase()} />
      <TextField id="note" rows={2} label={{ en: "Extra wishes (optional)", ru: "Пожелания (необязательно)" }} value={state.note} max={300}
        onChange={(v) => set({ note: v })} placeholder={{ en: "e.g. holding hands, bouquet of white peonies", ru: "например: держатся за руки, букет белых пионов" }} />
    </>
  );
}
