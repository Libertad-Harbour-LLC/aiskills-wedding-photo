// Server-only client for the AI SKILLS API (https://aiskills.team/v1).
// The key lives in process.env.AISKILLS_API_KEY and never reaches the browser:
// every call below runs inside Next.js route handlers.
import "server-only";
import http from "node:http";
import https from "node:https";

export const API_BASE = (process.env.AISKILLS_API_BASE || "https://aiskills.team/v1").replace(/\/+$/, "");

export function apiKey() {
  return (process.env.AISKILLS_API_KEY || "").trim();
}

export class ApiError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

// Why not fetch(): Node's built-in fetch adds the browser header `Sec-Fetch-Mode: cors` to every
// request, and the AI SKILLS API refuses requests that look like they come from a browser
// (`server_side_only`). A plain node:https request sends only the headers below.
function request(url, { method, headers, body }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "http:" ? http : https;
    const req = lib.request(u, { method, headers, timeout: 120_000 }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString("utf8") }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

export async function aiskills(path, { method = "GET", body } = {}) {
  const key = apiKey();
  if (!key) throw new ApiError(500, "missing_api_key", "AISKILLS_API_KEY is not set on the server");
  const payload = body ? JSON.stringify(body) : null;
  let res;
  try {
    res = await request(`${API_BASE}${path}`, {
      method,
      headers: {
        "X-API-Key": key,
        Accept: "application/json",
        "User-Agent": "aiskills-app-template/1.0",
        ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
      },
      body: payload,
    });
  } catch {
    throw new ApiError(502, "api_unreachable", "Could not reach the AI SKILLS API");
  }
  let data = {};
  try { data = JSON.parse(res.text || "{}"); } catch {}
  if (res.status < 200 || res.status >= 300) {
    const { error, message, ...extra } = data || {};
    throw new ApiError(res.status, error || "api_error", message || `HTTP ${res.status}`, extra);
  }
  return data;
}

// Visitors may only pass public https links (or http links when the API base itself is a local mock).
export function cleanUrl(v) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s || s.length > 2000) return null;
  let u;
  try { u = new URL(s); } catch { return null; }
  const allowHttp = API_BASE.startsWith("http://");
  if (u.protocol !== "https:" && !(allowHttp && u.protocol === "http:")) return null;
  return u.toString();
}

// Optional ACCESS_CODE: protects the owner's balance on a public deployment.
export function checkAccess(req) {
  const code = (process.env.ACCESS_CODE || "").trim();
  if (!code) return null;
  const got = (req.headers.get("x-access-code") || "").trim();
  if (got === code) return null;
  return Response.json({ error: "access_code_required", message: "Enter the access code" }, { status: 401 });
}

export function errorResponse(e) {
  if (e instanceof ApiError) {
    return Response.json({ error: e.code, message: e.message, ...e.extra }, { status: e.status >= 400 ? e.status : 500 });
  }
  console.error(e);
  return Response.json({ error: "internal_error", message: "Something went wrong" }, { status: 500 });
}
