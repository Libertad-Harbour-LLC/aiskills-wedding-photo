import { aiskills, checkAccess, errorResponse, ApiError } from "@/lib/aiskills";
import { plan } from "@/lib/plan";

export const runtime = "nodejs";
export const maxDuration = 60;

// Starts one or more generations for the visitor's request. The model, the prompt and the
// parameters are built HERE from the app's own presets (src/lib/plan.js): a visitor cannot
// run an arbitrary model on the owner's balance.
export async function POST(req) {
  const denied = checkAccess(req);
  if (denied) return denied;
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400 }); }
  let jobs;
  try {
    jobs = plan(body || {});
  } catch (e) {
    return Response.json({ error: e.code || "bad_args", message: e.message }, { status: 400 });
  }
  const items = [];
  for (const job of jobs) {
    try {
      const r = await aiskills("/generations", { method: "POST", body: job });
      items.push({ id: r.id, price_cents: r.price_cents ?? null, model: r.model });
    } catch (e) {
      // The first start failed: report the error. A later one failed: keep what already started.
      if (!items.length) return errorResponse(e);
      if (!(e instanceof ApiError)) console.error(e);
      break;
    }
  }
  return Response.json({ items }, { status: 201 });
}
