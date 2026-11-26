import { LIMITS, sniffImage } from "../../../shared/content";
import { bytesToBase64 } from "../../_lib/b64";
import type { Env } from "../../_lib/types";

const NO_STORE = { "cache-control": "no-store" };
const MAX_IMAGES = 200;

/** Sube una imagen (cuerpo = los bytes de un PNG, JPEG o WEBP ya comprimido desde el navegador). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return Response.json({ error: "db_not_bound" }, { status: 503, headers: NO_STORE });
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0) return Response.json({ error: "imagen vacia" }, { status: 400, headers: NO_STORE });
  if (bytes.length > LIMITS.maxImageBytes)
    return Response.json({ error: `la imagen pesa mas de ${Math.round(LIMITS.maxImageBytes / 1000)} KB` }, { status: 413, headers: NO_STORE });
  const mime = sniffImage(bytes);
  if (!mime) return Response.json({ error: "solo se aceptan PNG, JPEG o WEBP" }, { status: 415, headers: NO_STORE });

  const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM images").first<{ c: number }>();
  if ((count?.c ?? 0) >= MAX_IMAGES) return Response.json({ error: "demasiadas imagenes guardadas" }, { status: 409, headers: NO_STORE });

  const id = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, "0")).join("");
  await env.DB.prepare("INSERT INTO images (id, mime, data, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, mime, bytesToBase64(bytes), Math.floor(Date.now() / 1000))
    .run();
  return Response.json({ id, url: `/api/img/${id}` }, { headers: NO_STORE });
};
