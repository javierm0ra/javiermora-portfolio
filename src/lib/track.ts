export type TrackType = "view" | "project_click" | "lang" | "contact_copy" | "contact_mail" | "github_click";

/** Clave de localStorage con la que el panel apaga el conteo de las visitas propias. */
export const NO_TRACK_KEY = "jm-no-track";
const SESSION_KEY = "jm-session-view";

function enabled(): boolean {
  try {
    if (localStorage.getItem(NO_TRACK_KEY) === "1") return false;
  } catch {
    // sin localStorage: se sigue contando
  }
  if (navigator.doNotTrack === "1") return false;
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  return !location.pathname.startsWith("/admin");
}

/**
 * Manda una visita o accion a /api/t. Sin cookies: el servidor arma un hash diario del visitante
 * y no guarda la IP. Si falla, no pasa nada.
 */
export function track(type: TrackType, target?: string): void {
  if (!enabled()) return;
  const utm = new URLSearchParams(location.search).get("utm_source") ?? undefined;
  const body = JSON.stringify({ type, target, lang: document.documentElement.lang, ref: document.referrer, utm });
  try {
    if (navigator.sendBeacon?.("/api/t", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // se intenta con fetch
  }
  void fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => undefined);
}

/** Cuenta una visita por sesion del navegador (no cada recarga). */
export function trackView(): void {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // sin sessionStorage: se cuenta una vez por carga
  }
  track("view");
}
