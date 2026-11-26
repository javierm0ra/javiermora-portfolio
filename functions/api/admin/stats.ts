import { addDays, mxDay } from "../../_lib/time";
import type { Env } from "../../_lib/types";

interface Row {
  [key: string]: string | number | null;
}

const RANGES = new Set([7, 30, 90]);

function breakdown(column: "ref" | "country" | "device" | "lang", env: Env, from: string) {
  return env.DB.prepare(
    `SELECT COALESCE(${column}, 'desconocido') AS k, COUNT(*) AS c
       FROM events WHERE type = 'view' AND day >= ?
      GROUP BY k ORDER BY c DESC LIMIT 8`,
  ).bind(from);
}

/** Resumen de visitas para el panel. Solo lectura. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  if (!env.DB) return Response.json({ error: "db_not_bound" }, { status: 503, headers: { "cache-control": "no-store" } });
  const url = new URL(request.url);
  const asked = Number(url.searchParams.get("days"));
  const days = RANGES.has(asked) ? asked : 30;

  const now = Math.floor(Date.now() / 1000);
  const to = mxDay(now);
  const from = addDays(to, -(days - 1));

  const [daily, clicks, contacts, projects, ref, country, device, lang, funnel, realtime] = await env.DB.batch<Row>([
    env.DB.prepare(
      `SELECT day,
              SUM(type = 'view') AS views,
              COUNT(DISTINCT CASE WHEN type = 'view' THEN visitor END) AS visitors
         FROM events WHERE day >= ? GROUP BY day`,
    ).bind(from),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events WHERE type = 'project_click' AND day >= ?`).bind(from),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events WHERE type IN ('contact_copy', 'contact_mail') AND day >= ?`).bind(from),
    env.DB.prepare(
      `SELECT target AS k, COUNT(*) AS c FROM events
        WHERE type = 'project_click' AND target IS NOT NULL AND day >= ?
        GROUP BY target ORDER BY c DESC LIMIT 10`,
    ).bind(from),
    breakdown("ref", env, from),
    breakdown("country", env, from),
    breakdown("device", env, from),
    breakdown("lang", env, from),
    env.DB.prepare(
      `SELECT
         COUNT(DISTINCT CASE WHEN type = 'view' THEN day || visitor END) AS viewed,
         COUNT(DISTINCT CASE WHEN type = 'project_click' THEN day || visitor END) AS opened,
         COUNT(DISTINCT CASE WHEN type IN ('contact_copy', 'contact_mail') THEN day || visitor END) AS contacted
         FROM events WHERE day >= ?`,
    ).bind(from),
    env.DB.prepare(`SELECT COUNT(DISTINCT visitor) AS c FROM events WHERE ts >= ?`).bind(now - 30 * 60),
  ]);

  const byDay = new Map<string, { views: number; visitors: number }>();
  for (const r of daily!.results) byDay.set(String(r.day), { views: Number(r.views ?? 0), visitors: Number(r.visitors ?? 0) });
  const series: { day: string; views: number; visitors: number }[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
    series.push({ day, ...(byDay.get(day) ?? { views: 0, visitors: 0 }) });
  }

  const list = (rs: { results: Row[] }) => rs.results.map((r) => ({ key: String(r.k), count: Number(r.c ?? 0) }));
  const f = funnel!.results[0] ?? {};

  return Response.json(
    {
      admin: data.admin,
      range: { days, from, to },
      realtime: Number(realtime!.results[0]?.c ?? 0),
      totals: {
        views: series.reduce((a, d) => a + d.views, 0),
        visitors: series.reduce((a, d) => a + d.visitors, 0),
        projectClicks: Number(clicks!.results[0]?.c ?? 0),
        contacts: Number(contacts!.results[0]?.c ?? 0),
      },
      daily: series,
      projects: list(projects!),
      sources: list(ref!),
      countries: list(country!),
      devices: list(device!),
      languages: list(lang!),
      funnel: [
        { key: "viewed", count: Number(f.viewed ?? 0) },
        { key: "opened", count: Number(f.opened ?? 0) },
        { key: "contacted", count: Number(f.contacted ?? 0) },
      ],
    },
    { headers: { "cache-control": "no-store" } },
  );
};
