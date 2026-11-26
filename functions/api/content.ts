import type { Env } from "../_lib/types";

/** Contenido publicado del sitio (publico). `null` = el sitio usa los textos originales del codigo. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const headers = { "content-type": "application/json", "cache-control": "public, max-age=20, stale-while-revalidate=60" };
  if (!env.DB) return new Response('{"content":null}', { headers });
  try {
    const row = await env.DB.prepare("SELECT published FROM site_content WHERE key = 'site'").first<{ published: string | null }>();
    return new Response(`{"content":${row?.published ?? "null"}}`, { headers });
  } catch {
    // La tabla aun no existe o la base fallo: el sitio sigue con sus textos originales.
    return new Response('{"content":null}', { headers: { ...headers, "cache-control": "no-store" } });
  }
};
