import type { Item, Stats } from "./format";
import { niceMax, num, pct, shortDay } from "./format";

const W = 720;
const H = 250;
const M = { l: 40, r: 12, t: 12, b: 26 };

/** Visitas y visitantes por dia: area y linea con eje, cuadricula y valores al pasar el cursor. */
export function AreaChart({ data }: { data: Stats["daily"] }) {
  const max = niceMax(Math.max(1, ...data.map((d) => d.views)));
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const x = (i: number) => M.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => M.t + ih - (v / max) * ih;

  const line = (key: "views" | "visitors") => data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(" ");
  const area = `${line("views")} L${x(data.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const every = Math.max(1, Math.ceil(data.length / 6));
  const step = data.length <= 1 ? iw : iw / (data.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Visitas y visitantes por día">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={M.l - 8} y={y(t) + 4} textAnchor="end" className="axis">
            {num(Math.round(t))}
          </text>
        </g>
      ))}
      <path d={area} className="area" />
      <path d={line("views")} className="line-views" />
      <path d={line("visitors")} className="line-visitors" />
      {data.map((d, i) => (
        <g key={d.day}>
          {i % every === 0 && (
            <text x={x(i)} y={H - 6} textAnchor="middle" className="axis">
              {shortDay(d.day)}
            </text>
          )}
          <rect x={x(i) - step / 2} y={M.t} width={step} height={ih} className="hit">
            <title>{`${shortDay(d.day)}: ${num(d.views)} visitas, ${num(d.visitors)} visitantes`}</title>
          </rect>
        </g>
      ))}
    </svg>
  );
}

/** Lista de barras horizontales. */
export function BarList({ items, label, empty = "Sin datos todavía." }: { items: Item[]; label: (k: string) => string; empty?: string }) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count));
  const total = items.reduce((a, i) => a + i.count, 0);
  return (
    <ul className="bars">
      {items.map((i) => (
        <li key={i.key}>
          <div className="bar-top">
            <span className="bar-label">{label(i.key)}</span>
            <span className="bar-num">
              {num(i.count)} <small>{pct(i.count, total)}</small>
            </span>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${Math.max(2, (i.count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const FUNNEL_LABELS: Record<string, string> = {
  viewed: "Entraron al sitio",
  opened: "Abrieron un proyecto",
  contacted: "Intentaron contactarte",
};

/** Embudo: cuantos visitantes llegan a cada paso (cada barra se mide contra la primera). */
export function Funnel({ steps }: { steps: Item[] }) {
  const first = steps[0]?.count ?? 0;
  if (first === 0) return <p className="empty">Sin datos todavía.</p>;
  return (
    <ol className="funnel">
      {steps.map((s, i) => (
        <li key={s.key}>
          <div className="bar-top">
            <span className="bar-label">{FUNNEL_LABELS[s.key] ?? s.key}</span>
            <span className="bar-num">
              {num(s.count)} <small>{i === 0 ? "100 %" : `${pct(s.count, first)} del total`}</small>
            </span>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${Math.max(2, (s.count / first) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
