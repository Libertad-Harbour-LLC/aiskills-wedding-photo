"use client";

import { useLang } from "@/lib/i18n";

// A grid of preset buttons (styles, scenes, looks…) with an optional one-line description.
export function PresetGrid({ label, items, value, onChange, cols = 2 }) {
  const { tx } = useLang();
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-primary-text">{tx(label)}</div>
      <div className={`grid gap-2 ${cols === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
        {items.map((s) => (
          <button key={s.id} type="button" onClick={() => onChange(s.id)} aria-pressed={value === s.id}
            className={`text-left rounded-xl border px-3 py-2 transition-colors ${value === s.id
              ? "border-primary-500 bg-primary-500/15 text-primary-text" : "border-glass-border bg-bg-elevated text-secondary-text hover:text-primary-text"}`}>
            <span className="block text-xs font-semibold">{tx(s.label)}</span>
            {s.desc && <span className="block text-[11px] opacity-80 mt-0.5">{tx(s.desc)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// Chips with { id, label } items (Studio's Chips takes plain strings).
export function LabeledChips({ label, items, value, onChange }) {
  const { tx } = useLang();
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-primary-text">{tx(label)}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={value === o.id}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${value === o.id
              ? "bg-primary-500/20 border-primary-500 text-primary-text"
              : "bg-bg-elevated border-glass-border text-secondary-text hover:text-primary-text"}`}>
            {o.swatch && <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-[-1px] border border-white/30" style={{ background: o.swatch }} />}
            {tx(o.label)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TextField({ id, label, value, onChange, placeholder, max = 300, rows = 0, required = false }) {
  const { tx } = useLang();
  const cls = "w-full rounded-xl bg-bg-elevated border border-glass-border px-3 py-2.5 text-sm text-primary-text placeholder:text-secondary-text/70 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none";
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-primary-text">{tx(label)}{required && <span className="text-secondary-500"> *</span>}</label>
      {rows
        ? <textarea id={id} rows={rows} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} placeholder={tx(placeholder)} className={cls} />
        : <input id={id} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} placeholder={tx(placeholder)} className={cls} />}
    </div>
  );
}

export function Toggle({ label, hint, value, onChange }) {
  const { tx } = useLang();
  return (
    <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
      className="w-full flex items-start gap-3 text-left rounded-xl border border-glass-border bg-bg-elevated px-3 py-2.5">
      <span className={`mt-0.5 w-9 h-5 rounded-full shrink-0 relative transition-colors ${value ? "bg-primary-500" : "bg-divider"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-primary-text">{tx(label)}</span>
        {hint && <span className="block text-[11px] text-secondary-text mt-0.5">{tx(hint)}</span>}
      </span>
    </button>
  );
}
