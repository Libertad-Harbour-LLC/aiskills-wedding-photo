import { cleanUrl } from "@/lib/aiskills";

export class PlanError extends Error {
  constructor(message, code = "bad_args") { super(message); this.code = code; }
}

// Pick a value from an allow-list, or the default.
export const pick = (v, list, def) => (list.includes(v) ? v : def);

// Visitor's file links for one slot: only public links, at most `max`, at least `min`.
export function urls(inputs, key, { min = 1, max = 1, name = key } = {}) {
  const raw = Array.isArray(inputs?.[key]) ? inputs[key] : [];
  const out = raw.map(cleanUrl).filter(Boolean).slice(0, max);
  if (out.length < min) throw new PlanError(`Add ${min === 1 ? "a" : min} ${name} (public https link)`, "missing_input");
  return out;
}

export const text = (v, max = 600) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
