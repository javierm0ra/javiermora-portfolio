export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function parse<T>(res: Response): Promise<ApiResult<T>> {
  const text = await res.text();
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    // no era JSON
  }
  if (res.ok && body !== null) return { ok: true, data: body as T };
  const error = (body as { error?: string } | null)?.error;
  return { ok: false, status: res.status, error: error ?? (res.ok ? "respuesta inesperada" : `error ${res.status}`) };
}

export async function getJson<T>(url: string): Promise<ApiResult<T>> {
  try {
    return await parse<T>(await fetch(url, { headers: { accept: "application/json" }, credentials: "same-origin" }));
  } catch {
    return { ok: false, status: 0, error: "sin conexión" };
  }
}

export async function sendJson<T>(method: "PUT" | "POST", url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    return await parse<T>(
      await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
  } catch {
    return { ok: false, status: 0, error: "sin conexión" };
  }
}

export async function uploadImage(blob: Blob): Promise<ApiResult<{ id: string; url: string }>> {
  try {
    return await parse(await fetch("/api/admin/image", { method: "POST", credentials: "same-origin", headers: { "content-type": blob.type }, body: blob }));
  } catch {
    return { ok: false, status: 0, error: "sin conexión" };
  }
}

/** Mensaje en espanol para los errores comunes del servidor. */
export function explain(error: string, status: number): string {
  if (error === "admin_not_configured") return "El acceso al panel todavía no está configurado en Cloudflare.";
  if (error === "db_not_bound") return "Falta conectar la base de datos (binding DB) en Cloudflare Pages.";
  if (error === "db_not_migrated") return "Falta crear las tablas del contenido (migración 0002 en la consola de D1).";
  if (status === 401 || status === 403) return "Tu sesión no tiene permiso. Inicia sesión de nuevo.";
  return error;
}
