import { mxDay } from "../_lib/time";
import type { Env } from "../_lib/types";

const TYPES = new Set(["view", "project_click", "lang", "contact_copy", "contact_mail", "github_click", "linkedin_click"]);
const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|facebookexternalhit|python|curl|wget|httpclient/i;
const TARGET = /^[a-z0-9_.-]{1,40}$/i;
const MAX_BODY = 2048;

interface Beacon {
  type?: unknown;
  target?: unknown;
  lang?: unknown;
  ref?: unknown;
  utm?: unknown;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Dominio de donde viene la visita, o "directo". */
function refOf(ref: unknown, utm: unknown, ownHost: string): string {
  if (typeof utm === "string" && TARGET.test(utm)) return `utm:${utm.toLowerCase()}`;
  if (typeof ref !== "string" || ref === "") return "directo";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === ownHost) return "directo";
    return host.slice(0, 60);
  } catch {
    return "directo";
  }
}

/**
 * Registra una visita o accion. Responde siempre 204 (el sitio no debe enterarse si algo falla)
 * y no guarda cookies, IP ni nada que identifique a la persona.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const done = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  if (!env.DB) return done();

  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).host !== url.host) return done();
    } catch {
      return done();
    }
  }

  const ua = request.headers.get("User-Agent") ?? "";
  if (!ua || BOT.test(ua)) return done();

  let data: Beacon;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return done();
    data = JSON.parse(text) as Beacon;
  } catch {
    return done();
  }

  if (typeof data.type !== "string" || !TYPES.has(data.type)) return done();
  const target = typeof data.target === "string" && TARGET.test(data.target) ? data.target : null;
  const lang = data.lang === "en" ? "en" : "es";

  const ts = Math.floor(Date.now() / 1000);
  const day = mxDay(ts);
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const visitor = (await sha256Hex(`${env.ANALYTICS_SALT ?? "jm"}|${day}|${ip}|${ua}`)).slice(0, 16);
  const country = (request.cf as { country?: string } | undefined)?.country ?? null;

  waitUntil(
    env.DB.prepare(
      "INSERT INTO events (ts, day, type, target, visitor, country, device, ref, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(ts, day, data.type, target, visitor, country, deviceOf(ua), refOf(data.ref, data.utm, url.hostname), lang)
      .run()
      .catch(() => undefined),
  );
  return done();
};
