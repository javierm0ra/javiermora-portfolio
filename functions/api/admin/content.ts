import { LIMITS, validateContent } from "../../../shared/content";
import type { Env } from "../../_lib/types";

interface Row {
  draft: string | null;
  published: string | null;
  updated_at: number | null;
  published_at: number | null;
}

const NO_STORE = { "cache-control": "no-store" };

/** Borrador y version publicada, para el editor. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return Response.json({ error: "db_not_bound" }, { status: 503, headers: NO_STORE });
  try {
    const row = await env.DB.prepare("SELECT draft, published, updated_at, published_at FROM site_content WHERE key = 'site'").first<Row>();
    return Response.json(
      {
        draft: row?.draft ? JSON.parse(row.draft) : null,
        published: row?.published ? JSON.parse(row.published) : null,
        updatedAt: row?.updated_at ?? null,
        publishedAt: row?.published_at ?? null,
        // true si el borrador difiere de lo publicado
        unpublished: (row?.draft ?? null) !== (row?.published ?? null),
      },
      { headers: NO_STORE },
    );
  } catch {
    return Response.json({ error: "db_not_migrated" }, { status: 503, headers: NO_STORE });
  }
};

/** Guarda el borrador (validado). No cambia lo publicado. */
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return Response.json({ error: "db_not_bound" }, { status: 503, headers: NO_STORE });
  const text = await request.text();
  if (text.length > LIMITS.maxDoc + 1000) return Response.json({ error: "demasiado grande" }, { status: 413, headers: NO_STORE });

  let body: { draft?: unknown };
  try {
    body = JSON.parse(text) as { draft?: unknown };
  } catch {
    return Response.json({ error: "JSON no valido" }, { status: 400, headers: NO_STORE });
  }
  const result = validateContent(body.draft);
  if (!result.ok) return Response.json({ error: result.error }, { status: 422, headers: NO_STORE });

  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO site_content (key, draft, updated_at) VALUES ('site', ?, ?)
     ON CONFLICT(key) DO UPDATE SET draft = excluded.draft, updated_at = excluded.updated_at`,
  )
    .bind(JSON.stringify(result.value), now)
    .run();
  return Response.json({ ok: true, updatedAt: now }, { headers: NO_STORE });
};
