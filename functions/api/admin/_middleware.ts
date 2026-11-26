import { verifyAccess } from "../../_lib/access";
import type { Env } from "../../_lib/types";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Todo lo que cuelga de /api/admin exige una sesion valida de Cloudflare Access y, para
 * cambios (POST, PUT...), que la peticion venga del mismo sitio (proteccion contra CSRF).
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const deny = (status: number, error: string) =>
    Response.json({ error }, { status, headers: { "cache-control": "no-store" } });

  const result = await verifyAccess(request, context.env);
  if (!result.ok) return deny(result.status, result.reason);

  if (!SAFE.has(request.method)) {
    const site = request.headers.get("Sec-Fetch-Site");
    const origin = request.headers.get("Origin");
    const sameOrigin = site === "same-origin" || (origin !== null && new URL(origin).host === new URL(request.url).host);
    if (!sameOrigin) return deny(403, "cross_site");
  }

  context.data.admin = result.email;
  return context.next();
};
