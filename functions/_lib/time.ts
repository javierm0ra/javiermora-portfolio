/** Mexico no usa horario de verano desde 2022: Ciudad de Mexico es UTC-6 todo el ano. */
const MX_OFFSET_SECONDS = -6 * 3600;

/** Dia (AAAA-MM-DD) en hora de Ciudad de Mexico para un instante en segundos. */
export function mxDay(tsSeconds: number): string {
  return new Date((tsSeconds + MX_OFFSET_SECONDS) * 1000).toISOString().slice(0, 10);
}

/** Resta `days` dias a un AAAA-MM-DD. */
export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
