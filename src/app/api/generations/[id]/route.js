import { aiskills, checkAccess, errorResponse } from "@/lib/aiskills";

export const runtime = "nodejs";
export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req, { params }) {
  const denied = checkAccess(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id || "")) return Response.json({ error: "not_found" }, { status: 404 });
  try {
    const g = await aiskills(`/generations/${id}`);
    return Response.json({
      id: g.id,
      status: g.status,
      category: g.category,
      result_urls: Array.isArray(g.result_urls) ? g.result_urls : [],
      error: g.error ?? null,
      refunded: Boolean(g.refunded),
      price_cents: g.price_cents ?? null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
