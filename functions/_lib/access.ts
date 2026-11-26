import type { Env } from "./types";

/**
 * Verifica que la peticion venga de Cloudflare Access: valida la firma RS256 del token
 * (cabecera Cf-Access-Jwt-Assertion), su vigencia, el emisor y la audiencia (AUD).
 * Si Access no esta configurado, el panel queda cerrado (nunca abierto por omision).
 */
export type AccessResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 503; reason: string };

interface Jwk {
  kid: string;
  kty: string;
  alg?: string;
  n: string;
  e: string;
}

const CERTS_TTL_MS = 60 * 60 * 1000;
let certsCache: { team: string; at: number; keys: Jwk[] } | null = null;

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function decodeJson<T>(part: string): T {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(part))) as T;
}

async function loadKeys(team: string, fetcher: typeof fetch): Promise<Jwk[]> {
  if (certsCache && certsCache.team === team && Date.now() - certsCache.at < CERTS_TTL_MS) return certsCache.keys;
  const res = await fetcher(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`certs ${res.status}`);
  const body = (await res.json()) as { keys: Jwk[] };
  certsCache = { team, at: Date.now(), keys: body.keys };
  return body.keys;
}

/** Solo para pruebas. */
export function _resetCertsCache() {
  certsCache = null;
}

export async function verifyAccess(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<AccessResult> {
  if (env.ADMIN_DEV_BYPASS === "1") return { ok: true, email: "dev@local" };

  const team = env.ACCESS_TEAM_DOMAIN?.trim();
  const aud = env.ACCESS_AUD?.trim();
  if (!team || !aud) return { ok: false, status: 503, reason: "admin_not_configured" };

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { ok: false, status: 401, reason: "missing_token" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, status: 401, reason: "bad_token" };
  const [h, p, s] = parts as [string, string, string];

  try {
    const header = decodeJson<{ alg: string; kid: string }>(h);
    const payload = decodeJson<{ aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string }>(p);
    if (header.alg !== "RS256") return { ok: false, status: 401, reason: "bad_alg" };

    const keys = await loadKeys(team, fetcher);
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) return { ok: false, status: 401, reason: "unknown_key" };

    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(s), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return { ok: false, status: 401, reason: "bad_signature" };

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= now) return { ok: false, status: 401, reason: "expired" };
    if (typeof payload.nbf === "number" && payload.nbf > now + 60) return { ok: false, status: 401, reason: "not_yet_valid" };
    if (payload.iss !== `https://${team}`) return { ok: false, status: 401, reason: "bad_issuer" };
    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!auds.includes(aud)) return { ok: false, status: 403, reason: "bad_audience" };

    const email = (payload.email ?? "").toLowerCase();
    const allowed = env.ADMIN_EMAIL?.trim().toLowerCase();
    if (allowed && email !== allowed) return { ok: false, status: 403, reason: "email_not_allowed" };

    return { ok: true, email };
  } catch {
    return { ok: false, status: 401, reason: "invalid_token" };
  }
}
