import type { Env } from "../../_lib/types";

const NO_STORE = { "cache-control": "no-store" };

/** Descarta el borrador: vuelve a ser igual a lo publicado (o al original del codigo si nunca se publico). */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return Response.json({ error: "db_not_bound" }, { status: 503, headers: NO_STORE });
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("UPDATE site_content SET draft = published, updated_at = ? WHERE key = 'site'").bind(now).run();
  return Response.json({ ok: true }, { headers: NO_STORE });
};
