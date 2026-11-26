import { useEffect, useState } from "react";
import { NO_TRACK_KEY } from "../lib/track";
import { AreaChart, BarList, Funnel } from "./Charts";
import { labelCountry, labelDevice, labelLang, labelProject, labelSource, num, shortDay, type Stats } from "./format";
import "./admin.css";

type State =
  | { status: "loading" }
  | { status: "ok"; data: Stats }
  | { status: "error"; reason: string; http: number };

const RANGES = [7, 30, 90] as const;

function useNoTrack(): [boolean, (v: boolean) => void] {
  const read = () => {
    try {
      return localStorage.getItem(NO_TRACK_KEY) === "1";
    } catch {
      return false;
    }
  };
  const [on, setOn] = useState(read);
  return [
    on,
    (v) => {
      try {
        if (v) localStorage.setItem(NO_TRACK_KEY, "1");
        else localStorage.removeItem(NO_TRACK_KEY);
      } catch {
        // sin localStorage no se puede recordar la preferencia
      }
      setOn(v);
    },
  ];
}

function ErrorCard({ reason, http }: { reason: string; http: number }) {
  if (reason === "admin_not_configured")
    return (
      <section className="panel">
        <h2>El acceso al panel todavía no está configurado</h2>
        <p>
          Por seguridad, el panel permanece cerrado hasta conectar Cloudflare Access. Faltan las variables <code>ACCESS_TEAM_DOMAIN</code> y{" "}
          <code>ACCESS_AUD</code> en el proyecto de Cloudflare Pages. Los pasos están en <code>docs/admin-setup.md</code>.
        </p>
      </section>
    );
  if (reason === "db_not_bound")
    return (
      <section className="panel">
        <h2>Falta conectar la base de datos</h2>
        <p>
          El acceso funciona, pero el proyecto no tiene la base D1 con el nombre <code>DB</code>. Se conecta en Settings → Bindings; los pasos están en{" "}
          <code>docs/admin-setup.md</code>.
        </p>
      </section>
    );
  if (http === 401 || http === 403)
    return (
      <section className="panel">
        <h2>Sin acceso</h2>
        <p>Tu sesión no tiene permiso para ver este panel. Inicia sesión con el correo autorizado y vuelve a intentar.</p>
      </section>
    );
  return (
    <section className="panel">
      <h2>No se pudieron cargar los datos</h2>
      <p>El servicio de datos no respondió como se esperaba ({reason || `error ${http}`}). Si estás probando en local, usa el servidor de Cloudflare (ver docs/admin-setup.md).</p>
    </section>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="kpi">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {note && <small>{note}</small>}
    </div>
  );
}

export default function Visitas() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [state, setState] = useState<State>({ status: "loading" });
  const [noTrack, setNoTrack] = useNoTrack();

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    fetch(`/api/admin/stats?days=${days}`, { headers: { accept: "application/json" }, credentials: "same-origin" })
      .then(async (res) => {
        const text = await res.text();
        let body: unknown = null;
        try {
          body = JSON.parse(text);
        } catch {
          // no era JSON (por ejemplo, la pagina de inicio del sitio)
        }
        if (!alive) return;
        if (res.ok && body && typeof body === "object" && "daily" in body) setState({ status: "ok", data: body as Stats });
        else setState({ status: "error", http: res.status, reason: (body as { error?: string } | null)?.error ?? "" });
      })
      .catch(() => alive && setState({ status: "error", http: 0, reason: "sin conexión" }));
    return () => {
      alive = false;
    };
  }, [days]);

  const d = state.status === "ok" ? state.data : null;

  return (
    <>
        {state.status === "error" && <ErrorCard reason={state.reason} http={state.http} />}

        {state.status !== "error" && (
          <>
            <div className="toolbar">
              <div className="seg" role="group" aria-label="Periodo">
                {RANGES.map((r) => (
                  <button key={r} type="button" aria-pressed={days === r} onClick={() => setDays(r)}>
                    {r} días
                  </button>
                ))}
              </div>
              {d && (
                <span className="live" title="Visitantes distintos en los últimos 30 minutos">
                  <i aria-hidden="true" /> Ahora: {num(d.realtime)}
                </span>
              )}
            </div>

            <dl className="kpis" aria-busy={state.status === "loading"}>
              <Kpi label="Visitas" value={d ? num(d.totals.views) : "—"} note="Una por sesión del navegador" />
              <Kpi label="Visitantes" value={d ? num(d.totals.visitors) : "—"} note="Suma de visitantes distintos por día" />
              <Kpi label="Proyectos abiertos" value={d ? num(d.totals.projectClicks) : "—"} note="Clics en una tarjeta" />
              <Kpi label="Intentos de contacto" value={d ? num(d.totals.contacts) : "—"} note="Correo copiado o abierto" />
            </dl>

            <section className="panel">
              <div className="panel-head">
                <h2>Visitas por día</h2>
                <span className="legend">
                  <i className="sw views" /> Visitas <i className="sw visitors" /> Visitantes
                </span>
              </div>
              {d ? (
                d.totals.views === 0 ? (
                  <p className="empty">Todavía no hay visitas en este periodo. Aparecerán aquí en cuanto alguien abra el sitio publicado.</p>
                ) : (
                  <>
                    <AreaChart data={d.daily} />
                    <details className="as-table">
                      <summary>Ver como tabla</summary>
                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Día</th>
                              <th>Visitas</th>
                              <th>Visitantes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...d.daily].reverse().map((r) => (
                              <tr key={r.day}>
                                <td>{shortDay(r.day)}</td>
                                <td>{num(r.views)}</td>
                                <td>{num(r.visitors)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </>
                )
              ) : (
                <div className="skeleton" />
              )}
            </section>

            <div className="cols">
              <section className="panel">
                <h2>Proyectos más abiertos</h2>
                {d ? <BarList items={d.projects} label={labelProject} /> : <div className="skeleton short" />}
              </section>
              <section className="panel">
                <h2>De dónde llegan</h2>
                {d ? <BarList items={d.sources} label={labelSource} /> : <div className="skeleton short" />}
              </section>
              <section className="panel">
                <h2>Países</h2>
                {d ? <BarList items={d.countries} label={labelCountry} /> : <div className="skeleton short" />}
              </section>
              <section className="panel">
                <h2>Embudo</h2>
                {d ? <Funnel steps={d.funnel} /> : <div className="skeleton short" />}
              </section>
              <section className="panel">
                <h2>Dispositivo</h2>
                {d ? <BarList items={d.devices} label={labelDevice} /> : <div className="skeleton short" />}
              </section>
              <section className="panel">
                <h2>Idioma del sitio</h2>
                {d ? <BarList items={d.languages} label={labelLang} /> : <div className="skeleton short" />}
              </section>
            </div>
          </>
        )}

        <section className="panel prefs">
          <h2>Mis visitas</h2>
          <label className="check">
            <input type="checkbox" checked={noTrack} onChange={(e) => setNoTrack(e.target.checked)} />
            <span>No contar las visitas que hago desde este navegador</span>
          </label>
          <p className="note">
            Sin cookies ni IP: cada visitante es un identificador que cambia cada día, así que no se puede seguir a nadie entre días. El idioma del
            panel es solo español.
          </p>
          {d && <p className="note">Sesión: {d.admin}</p>}
        </section>
    </>
  );
}
