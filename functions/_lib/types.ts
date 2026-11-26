export interface Env {
  /** Base de datos D1 (binding "DB"). */
  DB: D1Database;
  /** Dominio de equipo de Cloudflare Zero Trust, p. ej. "miequipo.cloudflareaccess.com". */
  ACCESS_TEAM_DOMAIN?: string;
  /** "Application Audience (AUD) Tag" de la aplicacion de Access que protege /admin. */
  ACCESS_AUD?: string;
  /** Correo permitido (opcional: ademas de Access, solo entra este correo). */
  ADMIN_EMAIL?: string;
  /** Solo para desarrollo local (.dev.vars): "1" salta la verificacion de Access. */
  ADMIN_DEV_BYPASS?: string;
  /** Sal para el hash de visitantes (opcional). */
  ANALYTICS_SALT?: string;
}
