import { verifyAccess } from "../../_lib/access";
import type { Env } from "../../_lib/types";

/** Todo lo que cuelga de /api/admin exige una sesion valida de Cloudflare Access. */
export const onRequest: PagesFunction<Env> = async (context) => {
  const result = await verifyAccess(context.request, context.env);
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: result.status, headers: { "cache-control": "no-store" } });
  }
  context.data.admin = result.email;
  return context.next();
};
