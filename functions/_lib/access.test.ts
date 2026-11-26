// Prueba de la verificacion de Cloudflare Access con una llave RSA generada al vuelo.
// Ejecutar: node --test functions/
import assert from "node:assert/strict";
import test from "node:test";
import { _resetCertsCache, verifyAccess } from "./access.ts";

const TEAM = "equipo.cloudflareaccess.com";
const AUD = "aud-de-prueba";

const b64url = (data: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return Buffer.from(bytes).toString("base64url");
};

async function setup() {
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  const jwk = (await crypto.subtle.exportKey("jwk", pair.publicKey)) as { n: string; e: string; kty: string };
  const fetcher = (async () =>
    new Response(JSON.stringify({ keys: [{ kid: "k1", kty: jwk.kty, alg: "RS256", n: jwk.n, e: jwk.e }] }))) as typeof fetch;

  const sign = async (payload: Record<string, unknown>, header: Record<string, unknown> = { alg: "RS256", kid: "k1" }) => {
    const h = b64url(JSON.stringify(header));
    const p = b64url(JSON.stringify(payload));
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(`${h}.${p}`));
    return `${h}.${p}.${b64url(sig)}`;
  };
  return { fetcher, sign };
}

const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD } as never;
const req = (token?: string) => new Request("https://x.test/api/admin/stats", { headers: token ? { "Cf-Access-Jwt-Assertion": token } : {} });
const good = (extra: Record<string, unknown> = {}) => ({
  iss: `https://${TEAM}`,
  aud: [AUD],
  exp: Math.floor(Date.now() / 1000) + 600,
  email: "Yo@Correo.com",
  ...extra,
});

test("sin configurar, el panel queda cerrado (503)", async () => {
  const r = await verifyAccess(req("x.y.z"), {} as never);
  assert.deepEqual(r, { ok: false, status: 503, reason: "admin_not_configured" });
});

test("el bypass de desarrollo solo funciona con ADMIN_DEV_BYPASS=1", async () => {
  assert.equal((await verifyAccess(req(), { ADMIN_DEV_BYPASS: "1" } as never)).ok, true);
  assert.equal((await verifyAccess(req(), { ADMIN_DEV_BYPASS: "0" } as never)).ok, false);
});

test("sin token: 401", async () => {
  const r = await verifyAccess(req(), env);
  assert.equal(r.ok, false);
  assert.equal((r as { status: number }).status, 401);
});

test("token valido: entra y el correo sale en minusculas", async () => {
  _resetCertsCache();
  const { fetcher, sign } = await setup();
  const r = await verifyAccess(req(await sign(good())), env, fetcher);
  assert.deepEqual(r, { ok: true, email: "yo@correo.com" });
});

test("rechaza firma ajena, token vencido, otra audiencia, otro emisor y otro correo", async () => {
  _resetCertsCache();
  const a = await setup();
  const b = await setup(); // otra llave: su firma no coincide con la publicada en `a`
  assert.equal((await verifyAccess(req(await b.sign(good())), env, a.fetcher)).ok, false);
  assert.equal((await verifyAccess(req(await a.sign(good({ exp: 1 }))), env, a.fetcher)).ok, false);
  const aud = await verifyAccess(req(await a.sign(good({ aud: ["otra"] }))), env, a.fetcher);
  assert.equal((aud as { status: number }).status, 403);
  assert.equal((await verifyAccess(req(await a.sign(good({ iss: "https://otro.com" }))), env, a.fetcher)).ok, false);
  const onlyMe = { ...env, ADMIN_EMAIL: "otro@correo.com" } as never;
  assert.equal((await verifyAccess(req(await a.sign(good())), onlyMe, a.fetcher)).ok, false);
  assert.equal((await verifyAccess(req(await a.sign(good(), { alg: "none", kid: "k1" })), env, a.fetcher)).ok, false);
});
