import { base64ToBytes } from "../../_lib/b64";
import type { Env } from "../../_lib/types";

/** Imagen subida desde el panel (publica; el id es imposible de adivinar y la imagen nunca cambia). */
export const onRequestGet: PagesFunction<Env, "id"> = async ({ env, params }) => {
  const id = String(params.id ?? "");
  if (!/^[a-f0-9]{24}$/.test(id) || !env.DB) return new Response("No encontrada", { status: 404 });
  const row = await env.DB.prepare("SELECT mime, data FROM images WHERE id = ?").bind(id).first<{ mime: string; data: string }>();
  if (!row) return new Response("No encontrada", { status: 404 });
  return new Response(base64ToBytes(row.data), {
    headers: {
      "content-type": row.mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
};
