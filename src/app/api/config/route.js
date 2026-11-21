import { aiskills, apiKey } from "@/lib/aiskills";
import { APP } from "@/lib/app.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public facts for the page: is the key set, is upload enabled, live prices of this app's models.
let cache = { at: 0, prices: null };

async function prices() {
  if (cache.prices && Date.now() - cache.at < 10 * 60_000) return cache.prices;
  try {
    const { models = [] } = await aiskills("/models?lang=en");
    const wanted = new Set(APP.models);
    const out = {};
    for (const m of models) if (wanted.has(m.id)) out[m.id] = m.price;
    cache = { at: Date.now(), prices: out };
    return out;
  } catch (e) {
    console.error("[config] prices:", e?.code || e?.message || e);
    return null;
  }
}

export async function GET() {
  const configured = Boolean(apiKey());
  return Response.json({
    configured,
    accessCode: Boolean((process.env.ACCESS_CODE || "").trim()),
    upload: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    prices: configured ? await prices() : null,
  });
}
