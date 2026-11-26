import type { Env } from "../../_lib/types";

const NO_STORE = { "cache-control": "no-store" };

/** Publica el borrador: lo que hay en borrador pasa a ser lo que ve todo el mundo. */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return Response.json({ error: "db_not_bound" }, { status: 503, headers: NO_STORE });
  const row = await env.DB.prepare("SELECT draft FROM site_content WHERE key = 'site'").first<{ draft: string | null }>();
  if (!row?.draft) return Response.json({ error: "no hay borrador que publicar" }, { status: 409, headers: NO_STORE });
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("UPDATE site_content SET published = draft, published_at = ? WHERE key = 'site'").bind(now).run();
  return Response.json({ ok: true, publishedAt: now }, { headers: NO_STORE });
};
