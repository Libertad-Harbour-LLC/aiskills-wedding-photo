"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiUploadCloud, FiLink, FiX, FiDownload, FiExternalLink, FiZap, FiLoader, FiAlertTriangle, FiTrash2, FiLock } from "react-icons/fi";
import { APP } from "@/lib/app.config";
import { useLang, errorText } from "@/lib/i18n";
import CompareSlider from "./CompareSlider";
import Options from "./Options";

const HISTORY_KEY = `${APP.id}:history`;
const CODE_KEY = `${APP.id}:access-code`;
const TERMINAL = new Set(["completed", "failed", "refunded"]);
const isVideo = (url, category) => category === "video" || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url || "");

function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function writeHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 40))); } catch {}
}

function priceLabel(price, t) {
  if (!price) return null;
  if (price.cents != null) return `$${(price.cents / 100).toFixed(2)}`;
  if (price.from_cents != null) return `${t("priceFrom")} $${(price.from_cents / 100).toFixed(2)}`;
  if (price.cents_per_second != null) return `$${(price.cents_per_second / 100).toFixed(2)}/s`;
  return null;
}

async function downloadFile(url, name) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error();
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

function Placeholder({ kind }) {
  return (
    <div className="w-full h-full grid place-items-center bg-gradient-to-br from-primary-500/15 via-bg-elevated to-secondary-500/10">
      <span className="text-[10px] uppercase tracking-widest text-secondary-text">{kind}</span>
    </div>
  );
}

function Thumb({ url, kind, onRemove, label }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-glass-border bg-bg-elevated shrink-0">
      {broken ? <Placeholder kind={kind} /> : kind === "video"
        ? <video src={url} className="w-full h-full object-cover" muted onError={() => setBroken(true)} />
        : <img src={url} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} />}
      <button type="button" onClick={onRemove} aria-label={label}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white grid place-items-center hover:bg-black">
        <FiX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Slot({ slot, urls, setUrls, uploadOn, code, onError }) {
  const { t, tx } = useLang();
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const full = urls.length >= slot.max;

  const addLink = () => {
    const v = link.trim();
    if (!/^https?:\/\//i.test(v)) { onError(t("err_bad_input_url")); return; }
    setUrls([...urls, v].slice(0, slot.max));
    setLink("");
  };

  const onFiles = async (files) => {
    const list = [...files].slice(0, slot.max - urls.length);
    if (!list.length) return;
    setBusy(true);
    try {
      const { upload } = await import("@vercel/blob/client");
      const out = [];
      for (const f of list) {
        if (f.size > APP.upload.maxBytes) { onError(t(slot.kind === "video" ? "err_video_too_large" : "err_image_too_large")); continue; }
        const b = await upload(`${APP.id}/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload", clientPayload: code || "" });
        out.push(b.url);
      }
      setUrls([...urls, ...out].slice(0, slot.max));
    } catch {
      onError(t("err_generic"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-primary-text">{tx(slot.label)}</label>
        <span className="text-[11px] text-secondary-text">{urls.length}/{slot.max}</span>
      </div>
      {slot.hint && <p className="text-xs text-secondary-text">{tx(slot.hint)}</p>}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((u, i) => (
            <Thumb key={u + i} url={u} kind={slot.kind} label={t("remove")} onRemove={() => setUrls(urls.filter((_, j) => j !== i))} />
          ))}
        </div>
      )}
      {!full && (
        <>
          {uploadOn && (
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
              className="w-full rounded-2xl border border-dashed border-divider hover:border-primary-500 bg-glass-bg px-4 py-5 flex flex-col items-center gap-1.5 text-secondary-text hover:text-primary-text transition-colors">
              {busy ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiUploadCloud className="w-5 h-5" />}
              <span className="text-sm font-medium">{busy ? t("uploading") : t("upload")}</span>
            </button>
          )}
          <input ref={fileRef} type="file" hidden multiple={slot.max - urls.length > 1}
            accept={APP.upload.types.join(",")} onChange={(e) => onFiles(e.target.files)} />
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("pasteLink")}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                className="w-full rounded-xl bg-bg-elevated border border-glass-border pl-9 pr-3 py-2.5 text-sm text-primary-text placeholder:text-secondary-text/70 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <button type="button" onClick={addLink}
              className="rounded-xl px-4 text-sm font-semibold bg-bg-card-hover hover:bg-glass-hover border border-glass-border text-primary-text">
              {t("add")}
            </button>
          </div>
          {!uploadOn && <p className="text-[11px] text-secondary-text">{t("uploadOff")} {t("linkHint")}</p>}
        </>
      )}
    </div>
  );
}

function Chips({ label, options, value, onChange, render }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-primary-text">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${value === o
              ? "bg-primary-500/20 border-primary-500 text-primary-text"
              : "bg-bg-elevated border-glass-border text-secondary-text hover:text-primary-text"}`}>
            {render ? render(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultTile({ job, input }) {
  const { t } = useLang();
  const url = job.result_urls?.[0];
  if (!TERMINAL.has(job.status)) {
    return (
      <div className="aspect-square rounded-2xl border border-glass-border bg-bg-card grid place-items-center animate-pulse-glow">
        <div className="flex flex-col items-center gap-2 text-secondary-text">
          <FiLoader className="w-6 h-6 animate-spin text-primary-500" />
          <span className="text-xs">{job.status === "pending" ? t("queued") : t("processing")}</span>
        </div>
      </div>
    );
  }
  if (job.status !== "completed" || !url) {
    return (
      <div className="aspect-square rounded-2xl border border-glass-border bg-bg-card grid place-items-center p-4 text-center">
        <div className="flex flex-col items-center gap-2 text-secondary-text">
          <FiAlertTriangle className="w-6 h-6 text-secondary-500" />
          <span className="text-xs">{t("failed")}</span>
          {job.error && <code className="text-[10px] opacity-70">{job.error}</code>}
        </div>
      </div>
    );
  }
  return (
    <div className={job.result_urls.length > 1 ? "grid gap-4 sm:grid-cols-3" : "space-y-2"}>
      {job.result_urls.map((u, i) => (
        <div key={u} className="space-y-2">
          <div className="rounded-2xl overflow-hidden border border-glass-border bg-bg-card">
            {isVideo(u, job.category)
              ? <video src={u} controls playsInline className="w-full max-h-[70vh] bg-black" />
              : APP.compare && input && i === 0
                ? <CompareSlider before={input} after={u} />
                : <img src={u} alt="" className="w-full h-auto max-h-[75vh] object-contain mx-auto" />}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => downloadFile(u, `${APP.id}-${job.id.slice(0, 8)}-${i + 1}${isVideo(u, job.category) ? ".mp4" : ".png"}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold bg-primary hover:bg-primary-hover">
              <FiDownload className="w-4 h-4" /> {t("download")}
            </button>
            <a href={u} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-bg-elevated border border-glass-border text-primary-text">
              <FiExternalLink className="w-4 h-4" /> {t("open")}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Studio() {
  const { t, tx } = useLang();
  const [cfg, setCfg] = useState(null);
  const [code, setCode] = useState("");
  const [codeDraft, setCodeDraft] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [state, setState] = useState(() => APP.initialState());
  const [slots, setSlots] = useState(() => Object.fromEntries(APP.slots.map((s) => [s.key, []])));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [run, setRun] = useState(null); // { at, label, input, jobs: [] }
  const [history, setHistory] = useState([]);
  const resultRef = useRef(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then(setCfg).catch(() => setCfg({ configured: false }));
    setHistory(readHistory());
    try { setCode(localStorage.getItem(CODE_KEY) || ""); } catch {}
  }, []);
  useEffect(() => { if (cfg?.accessCode && !code) setNeedCode(true); }, [cfg, code]);

  const headers = useMemo(() => ({ "Content-Type": "application/json", ...(code ? { "x-access-code": code } : {}) }), [code]);
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const visibleSlots = APP.slots.filter((s) => !s.modes || s.modes.includes(state.mode));
  const ready = visibleSlots.every((s) => (slots[s.key] || []).length >= (s.min || 0));
  const count = APP.counts ? state.count : 1;
  const price = cfg?.prices?.[APP.priceModel(state)];
  const pLabel = priceLabel(price, t);
  const total = price?.cents != null && count > 1 ? ` × ${count} = $${((price.cents * count) / 100).toFixed(2)}` : "";
  // Optional per-app price text (e.g. per-second video × chosen duration): APP.priceText(state, price) → { en, ru } or null.
  const customPrice = APP.priceText && price ? APP.priceText(state, price) : null;

  // Poll unfinished jobs every 5 s.
  const runRef = useRef(run);
  runRef.current = run;
  const poll = useCallback(async () => {
    const r = runRef.current;
    if (!r) return;
    const open = r.jobs.filter((j) => !TERMINAL.has(j.status));
    if (!open.length) return;
    const fresh = await Promise.all(open.map((j) =>
      fetch(`/api/generations/${j.id}`, { headers, cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null)));
    setRun((cur) => {
      if (!cur || cur.at !== r.at) return cur;
      const jobs = cur.jobs.map((j) => fresh.find((f) => f && f.id === j.id) || j);
      const next = { ...cur, jobs };
      if (jobs.every((j) => TERMINAL.has(j.status))) {
        const list = [{ ...next }, ...readHistory().filter((h) => h.at !== next.at)];
        writeHistory(list);
        setHistory(list);
      }
      return next;
    });
  }, [headers]);
  useEffect(() => {
    if (!run || run.jobs.every((j) => TERMINAL.has(j.status))) return;
    const id = setInterval(poll, 5000);
    const first = setTimeout(poll, 2500);
    return () => { clearInterval(id); clearTimeout(first); };
  }, [run, poll]);

  const generate = async () => {
    setErr("");
    if (!ready) { setErr(t("needInput")); return; }
    // Optional per-app check of the options (e.g. a required text field): returns { en, ru } or null.
    const bad = APP.check ? APP.check(state) : null;
    if (bad) { setErr(tx(bad)); return; }
    setBusy(true);
    try {
      const inputs = Object.fromEntries(visibleSlots.map((s) => [s.key, slots[s.key]]));
      const r = await fetch("/api/generate", { method: "POST", headers, body: JSON.stringify({ ...state, inputs }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (d.error === "access_code_required") { setNeedCode(true); setCode(""); }
        setErr(d.error === "missing_input" ? t("needInput") : errorText(t, d.error || "generic"));
        return;
      }
      const firstInput = visibleSlots[0] ? slots[visibleSlots[0].key]?.[0] : null;
      const next = {
        at: Date.now(),
        label: APP.label(state, tx),
        input: firstInput || null,
        jobs: d.items.map((i) => ({ id: i.id, status: "processing", result_urls: [], price_cents: i.price_cents })),
      };
      setRun(next);
      if (window.innerWidth < 1024) setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      const list = [next, ...readHistory()];
      writeHistory(list);
      setHistory(list);
    } catch {
      setErr(t("err_generic"));
    } finally {
      setBusy(false);
    }
  };

  const openHistory = (h) => {
    setRun({ ...h, jobs: h.jobs.map((j) => (j.status === "completed" ? j : { ...j, status: "processing" })) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCode = () => {
    const v = codeDraft.trim();
    if (!v) return;
    setCode(v);
    try { localStorage.setItem(CODE_KEY, v); } catch {}
    setNeedCode(false);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <section className="mb-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass-bg text-[11px] font-bold uppercase tracking-widest text-secondary-text mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" /> {tx(APP.kicker)}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-primary-text leading-[1.05]">
          {tx(APP.headline)}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-secondary-text">{tx(APP.description)}</p>
      </section>

      {cfg && !cfg.configured && (
        <div className="mb-6 rounded-2xl border border-secondary-500/50 bg-secondary-500/10 p-4 text-sm text-primary-text">
          {t("notConfigured")}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start">
        <div className="rounded-3xl border border-glass-border bg-bg-card p-5 sm:p-6 space-y-6">
          {APP.modes && (
            <div className="grid gap-2" role="radiogroup">
              {APP.modes.map((m) => (
                <button key={m.id} type="button" role="radio" aria-checked={state.mode === m.id} onClick={() => set({ mode: m.id })}
                  className={`text-left rounded-2xl border p-3 transition-colors ${state.mode === m.id
                    ? "border-primary-500 bg-primary-500/10" : "border-glass-border bg-bg-elevated hover:bg-bg-card-hover"}`}>
                  <div className="text-sm font-bold text-primary-text">{tx(m.label)}</div>
                  <div className="text-xs text-secondary-text mt-0.5">{tx(m.desc)}</div>
                </button>
              ))}
            </div>
          )}
          {visibleSlots.map((s) => (
            <Slot key={s.key} slot={s} urls={slots[s.key] || []} uploadOn={Boolean(cfg?.upload)} code={code}
              setUrls={(v) => setSlots((cur) => ({ ...cur, [s.key]: v }))} onError={setErr} />
          ))}
          <Options state={state} set={set} Chips={Chips} />
          {APP.counts && (
            <Chips label={t("variants")} options={APP.counts} value={state.count} onChange={(v) => set({ count: v })} render={String} />
          )}

          <div className="space-y-3 pt-2 border-t border-divider/40">
            {pLabel && (
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-secondary-text">{t("price")}</span>
                <span className="font-bold text-primary-text">{customPrice ? tx(customPrice) : <>{pLabel} <span className="font-normal text-secondary-text">{t("perRun")}{total}</span></>}</span>
              </div>
            )}
            <button type="button" onClick={generate} disabled={busy || (cfg && !cfg.configured)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {busy ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiZap className="w-5 h-5" />}
              {busy ? t("generating") : tx(APP.cta) || t("generate")}
            </button>
            {err && <p role="alert" className="text-sm text-secondary-500">{err}</p>}
            <p className="text-[11px] leading-relaxed text-secondary-text">{t("charged")}</p>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <div ref={resultRef} className="scroll-mt-20 rounded-3xl border border-glass-border bg-bg-card p-5 sm:p-6 min-h-[320px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-secondary-text">{t("result")}</h2>
              {run?.label && <span className="text-xs text-secondary-text truncate ml-3">{run.label}</span>}
            </div>
            {run ? (
              <div className={`grid gap-4 ${run.jobs.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {run.jobs.map((j) => <ResultTile key={j.id} job={j} input={run.input} />)}
              </div>
            ) : (
              <div className="h-[260px] rounded-2xl border border-dashed border-divider grid place-items-center text-center px-6">
                <div>
                  <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-primary-500/15 grid place-items-center">
                    <FiZap className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="font-bold text-primary-text">{t("emptyTitle")}</div>
                  <div className="text-sm text-secondary-text mt-1">{t("emptyText")}</div>
                </div>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="rounded-3xl border border-glass-border bg-bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary-text">{t("history")}</h2>
                <button type="button" onClick={() => { writeHistory([]); setHistory([]); }}
                  className="inline-flex items-center gap-1 text-xs text-secondary-text hover:text-primary-text">
                  <FiTrash2 className="w-3.5 h-3.5" /> {t("clear")}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {history.map((h) => {
                  const u = h.jobs.find((j) => j.result_urls?.[0])?.result_urls?.[0];
                  return (
                    <button key={h.at} type="button" onClick={() => openHistory(h)} title={h.label}
                      className="aspect-square rounded-xl overflow-hidden border border-glass-border bg-bg-elevated hover:border-primary-500">
                      {u ? (isVideo(u) ? <video src={u} muted className="w-full h-full object-cover" /> : <img src={u} alt="" className="w-full h-full object-cover" />)
                        : <Placeholder kind={h.jobs.some((j) => !TERMINAL.has(j.status)) ? "…" : "—"} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {needCode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-glass-border bg-bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 font-bold text-primary-text"><FiLock /> {t("accessTitle")}</div>
            <p className="text-sm text-secondary-text">{t("accessText")}</p>
            <input value={codeDraft} onChange={(e) => setCodeDraft(e.target.value)} type="password" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") saveCode(); }}
              className="w-full rounded-xl bg-bg-elevated border border-glass-border px-3 py-2.5 text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <button type="button" onClick={saveCode} className="w-full rounded-xl py-2.5 font-bold bg-primary hover:bg-primary-hover">{t("accessSave")}</button>
          </div>
        </div>
      )}
    </main>
  );
}
