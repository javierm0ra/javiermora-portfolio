/**
 * Red 3D de areas de expertise dibujada en un canvas 2D (sin librerias).
 * Los nodos de area son neuronas o chips; al elegir un area, sus subareas se despliegan dentro de la misma red.
 */

export type NetLevel = "d" | "e" | "s";
export type NetShape = "neuron" | "chip";

export interface NetSub {
  name: string;
  level: NetLevel;
  /** Si existe, la subarea es un grupo que se abre con un toque. */
  children?: { name: string; level: NetLevel }[];
}

export interface NetArea {
  id: string;
  name: string;
  /** #rrggbb */
  color: string;
  subs: NetSub[];
}

export interface NetOptions {
  reduceMotion: boolean;
  /** Se llama cuando cambia el area o el grupo abierto (por un toque en el lienzo o por una orden externa). */
  onState: (active: string | null, group: string | null) => void;
}

export interface NetHandle {
  setAreas: (areas: NetArea[]) => void;
  setShape: (shape: NetShape) => void;
  toggle: (id: string | null) => void;
  openGroup: (name: string | null) => void;
  destroy: () => void;
  /** Revision: textos encimados o fuera del lienzo en la vista actual. */
  report: () => { labels: number; problems: string[] };
}

type Col = [number, number, number];
interface P3 {
  x: number;
  y: number;
  z: number;
}
interface Proj {
  x: number;
  y: number;
  s: number;
  z: number;
}
interface Pt {
  x: number;
  y: number;
}
interface AreaRt extends NetArea {
  i: number;
  col: Col;
  p: P3;
}
interface Amb {
  p: P3;
  r: number;
}
interface Edge {
  a: number;
  b: number;
  kind: "area" | "amb";
  ph: number;
  sp: number;
  bend: number;
}
type Seg = { t: "q"; a: Pt; b: Pt; c: Pt } | { t: "p"; a: Pt; m: Pt; b: Pt };
interface Hit {
  kind: "area" | "group";
  id: string;
  x: number;
  y: number;
  r: number;
}
interface Box {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
interface SubItem {
  name: string;
  level: NetLevel;
  isGroup: boolean;
  count: number;
}
interface Placed {
  it: SubItem;
  x: number;
  y: number;
  side: number;
  w: number;
  h: number;
  fs: number;
}

const hexToCol = (hex: string): Col => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)] : [86, 140, 255];
};
const rgba = (c: Col, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const FONT = "Inter, system-ui, sans-serif";

export function createNet(cv: HTMLCanvasElement, opts: NetOptions): NetHandle {
  const ctx = cv.getContext("2d")!;
  const reduce = opts.reduceMotion;
  let W = 0;
  let H = 0;
  let narrow = false;
  let style: NetShape = "neuron";
  let areas: AreaRt[] = [];

  function size() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth;
    H = cv.clientHeight;
    narrow = W < 560;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Nodos de ambiente fijos (misma semilla siempre) que dan volumen a la red.
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const amb: Amb[] = [];
  for (let k = 0; k < 40; k++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const rs = Math.sqrt(1 - u * u);
    const R = 260 + rnd() * 110;
    amb.push({ p: { x: Math.cos(th) * rs * R * 1.05, y: u * R * 0.6, z: Math.sin(th) * rs * R * 1.05 }, r: 2.6 + rnd() * 1.6 });
  }
  const dist3 = (a: P3, b: P3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

  let nodes: { p: P3; area?: AreaRt; r?: number }[] = [];
  let edges: Edge[] = [];

  function buildNet() {
    nodes = [];
    edges = [];
    const seen: Record<string, 1> = {};
    const addEdge = (a: number, b: number, kind: "area" | "amb") => {
      const key = `${a}-${b}`;
      if (a === b || seen[key] || seen[`${b}-${a}`]) return;
      seen[key] = 1;
      edges.push({ a, b, kind, ph: rnd(), sp: 0.07 + rnd() * 0.07, bend: rnd() < 0.5 ? -1 : 1 });
    };
    const n = areas.length;
    areas.forEach((a, i) => {
      const y = 1 - ((i + 0.5) * 2) / Math.max(1, n);
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * 2.399963;
      a.i = i;
      a.p = { x: Math.cos(phi) * rr * 250, y: y * 150, z: Math.sin(phi) * rr * 250 };
      nodes.push({ area: a, p: a.p });
    });
    amb.forEach((m) => nodes.push({ p: m.p, r: m.r }));
    nodes.forEach((nd, i) => {
      const order = nodes
        .map((m, j) => [j, dist3(nd.p, m.p)] as const)
        .filter((x) => x[0] !== i)
        .sort((a, b) => a[1] - b[1]);
      for (let t = 0; t < 2 && t < order.length; t++) addEdge(i, order[t]![0], i < n && order[t]![0] < n ? "area" : "amb");
    });
    if (n > 1) for (let q = 0; q < n; q++) addEdge(q, (q + 1) % n, "area");
  }

  let theta = 0.6;
  const tilt = 0.3;
  let panY = 0;
  let offX = 0;
  const F = 640;
  let active: string | null = null;
  let group: string | null = null;
  let follow = false;
  let thetaT = 0;
  let panT = 0;
  let offT = 0;
  let grow = 0;
  let hover: string | null = null;
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let downX = 0;
  let downY = 0;
  let lastT = 0;
  let visible = true;
  let rectsNow: Box[] = [];
  let hitsNow: Hit[] = [];
  let raf = 0;
  let dead = false;

  function proj(p: P3): Proj {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const x1 = p.x * c + p.z * s;
    const z1 = -p.x * s + p.z * c;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const y2 = p.y * ct - z1 * st + panY;
    const z2 = p.y * st + z1 * ct;
    const k = F / (F + z2);
    return { x: W / 2 + offX + x1 * k, y: H / 2 + y2 * k, s: k, z: z2 };
  }

  /** Segmentos: curva (neurona) o traza con codo a 45 grados (chip). */
  function mkSeg(a: Pt, b: Pt, bend: number): Seg {
    if (style === "chip") {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const sx = dx < 0 ? -1 : 1;
      const sy = dy < 0 ? -1 : 1;
      const m = ax >= ay ? { x: a.x + sx * (ax - ay), y: a.y } : { x: a.x, y: a.y + sy * (ay - ax) };
      return { t: "p", a, m, b };
    }
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const ddx = b.x - a.x;
    const ddy = b.y - a.y;
    const L = Math.hypot(ddx, ddy) || 1;
    return { t: "q", a, b, c: { x: mx - ((ddy / L) * L * 0.16) * bend, y: my + ((ddx / L) * L * 0.16) * bend } };
  }
  function strokeSeg(s: Seg) {
    ctx.beginPath();
    ctx.moveTo(s.a.x, s.a.y);
    if (s.t === "p") {
      ctx.lineTo(s.m.x, s.m.y);
      ctx.lineTo(s.b.x, s.b.y);
    } else ctx.quadraticCurveTo(s.c.x, s.c.y, s.b.x, s.b.y);
    ctx.stroke();
  }
  function segAt(s: Seg, t: number): Pt {
    if (s.t === "q") {
      const u = 1 - t;
      return { x: u * u * s.a.x + 2 * u * t * s.c.x + t * t * s.b.x, y: u * u * s.a.y + 2 * u * t * s.c.y + t * t * s.b.y };
    }
    const l1 = Math.hypot(s.m.x - s.a.x, s.m.y - s.a.y);
    const l2 = Math.hypot(s.b.x - s.m.x, s.b.y - s.m.y);
    const d = t * (l1 + l2 || 1);
    if (d <= l1 && l1 > 0) {
      const k = d / l1;
      return { x: s.a.x + (s.m.x - s.a.x) * k, y: s.a.y + (s.m.y - s.a.y) * k };
    }
    const k2 = l2 ? (d - l1) / l2 : 0;
    return { x: s.m.x + (s.b.x - s.m.x) * k2, y: s.m.y + (s.b.y - s.m.y) * k2 };
  }

  /** Nodo de area: neurona (soma + dendritas) o chip hexagonal. */
  function drawCell(x: number, y: number, r: number, col: Col, al: number, id: number, tm: number) {
    const glow = r * 3.6;
    const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, glow);
    g.addColorStop(0, rgba(col, 0.5 * al));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glow, 0, 7);
    ctx.fill();
    ctx.globalAlpha = al;
    if (style === "chip") {
      const hr = r * 1.3;
      ctx.strokeStyle = rgba(col, 1);
      ctx.fillStyle = rgba(col, 1);
      ctx.lineWidth = 2;
      for (const o of [-0.55, 0, 0.55])
        for (const sd of [-1, 1]) {
          const px = x + sd * hr * 0.87;
          const py = y + o * hr;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + sd * 10, py);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px + sd * 12.5, py, 2.4, 0, 7);
          ctx.fill();
        }
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const an = Math.PI / 6 + (i * Math.PI) / 3;
        ctx.lineTo(x + Math.cos(an) * hr, y + Math.sin(an) * hr);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(14,27,52,.95)";
      ctx.fill();
      ctx.strokeStyle = rgba(col, 1);
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.fillStyle = rgba(col, 1);
      ctx.beginPath();
      ctx.arc(x, y, hr * 0.38, 0, 7);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - hr * 0.62, y - hr * 0.62, hr * 1.24, hr * 1.24);
    } else {
      const k = 6 + (id % 2);
      for (let j = 0; j < k; j++) {
        const ang = id * 0.9 + (j * Math.PI * 2) / k + (reduce ? 0 : tm * 0.05 * (id % 2 ? 1 : -1));
        const len = r * (2.2 + (0.9 * ((j * 7 + id * 3) % 5)) / 4) * (1 + (reduce ? 0 : 0.06 * Math.sin(tm * 1.4 + j + id)));
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const x0 = x + ca * r * 0.8;
        const y0 = y + sa * r * 0.8;
        const x1 = x + ca * len;
        const y1 = y + sa * len;
        const sg = j % 2 ? 1 : -1;
        const cx = (x0 + x1) / 2 - sa * r * 0.6 * sg;
        const cy = (y0 + y1) / 2 + ca * r * 0.6 * sg;
        ctx.strokeStyle = rgba(col, 0.8);
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx, cy, x1, y1);
        ctx.stroke();
        ctx.fillStyle = rgba(col, 1);
        ctx.beginPath();
        ctx.arc(x1, y1, r * 0.2, 0, 7);
        ctx.fill();
        const bx = 0.25 * x0 + 0.5 * cx + 0.25 * x1;
        const by = 0.25 * y0 + 0.5 * cy + 0.25 * y1;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(ang + 0.8 * sg) * r * 0.9, by + Math.sin(ang + 0.8 * sg) * r * 0.9);
        ctx.stroke();
      }
      ctx.beginPath();
      for (let j = 0; j <= 40; j++) {
        const a2 = (j / 40) * Math.PI * 2;
        const rr = r * (1 + 0.1 * Math.sin(3 * a2 + id) + 0.07 * Math.sin(5 * a2 + (reduce ? 0 : tm * 0.8) + id));
        ctx.lineTo(x + Math.cos(a2) * rr, y + Math.sin(a2) * rr);
      }
      ctx.closePath();
      const light: Col = [Math.min(255, col[0] + 70), Math.min(255, col[1] + 70), Math.min(255, col[2] + 70)];
      const sg2 = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 1.1);
      sg2.addColorStop(0, rgba(light, 1));
      sg2.addColorStop(1, rgba(col, 1));
      ctx.fillStyle = sg2;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.beginPath();
      ctx.arc(x, y, r * 0.36, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const labelFont = (fs: number) => {
    ctx.font = `600 ${fs}px ${FONT}`;
  };
  function drawLabel(text: string, rc: { x: number; y: number; w: number; h: number; fs: number }, alpha: number) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(255,255,255,.97)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rc.x, rc.y, rc.w, rc.h, rc.h / 2);
    else ctx.rect(rc.x, rc.y, rc.w, rc.h);
    ctx.fill();
    ctx.fillStyle = "#1a335d";
    labelFont(rc.fs);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(text, rc.x + 9, rc.y + rc.h / 2 + 0.5);
    ctx.globalAlpha = 1;
  }
  const labelOf = (it: SubItem) => it.name + (it.isGroup ? `  +${it.count}` : "");

  /** Distribucion de subareas: elipse (ancho) o columna (angosto), con etiquetas hacia afuera y separacion garantizada. */
  function layout(list: SubItem[], cx: number, cy: number): Placed[] {
    const n = list.length;
    const fs = narrow ? 12 : 13;
    const rx = Math.min(W * 0.3, 330);
    const ry = Math.min(H * 0.36, 225);
    const out: Placed[] = [];
    labelFont(fs);
    for (let i = 0; i < n; i++) {
      let x: number;
      let y: number;
      let side: number;
      if (narrow) {
        x = cx + W * 0.24 + 14 * Math.sin(Math.PI * (n > 1 ? i / (n - 1) : 0.5));
        y = n > 1 ? H * 0.09 + i * ((H * 0.82) / (n - 1)) : cy;
        side = 1;
      } else {
        const an = -Math.PI / 2 + ((i + 0.5) * Math.PI * 2) / n;
        x = cx + Math.cos(an) * rx;
        y = cy + Math.sin(an) * ry;
        side = Math.cos(an) >= 0 ? 1 : -1;
      }
      const w = ctx.measureText(labelOf(list[i]!)).width + 20;
      out.push({ it: list[i]!, x, y, side, w, h: fs + 12, fs });
    }
    for (let pass = 0; pass < 40; pass++) {
      let any = false;
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const A = out[i]!;
          const B = out[j]!;
          const ax0 = A.side > 0 ? A.x + 12 : A.x - 12 - A.w;
          const bx0 = B.side > 0 ? B.x + 12 : B.x - 12 - B.w;
          const ox = Math.min(ax0 + A.w, bx0 + B.w) - Math.max(ax0, bx0);
          const oy = Math.min(A.y + A.h / 2, B.y + B.h / 2) - Math.max(A.y - A.h / 2, B.y - B.h / 2);
          if (ox > -4 && oy > -4) {
            const push = ((oy + 6) / 2) * (A.y <= B.y ? 1 : -1);
            A.y -= push;
            B.y += push;
            any = true;
          }
        }
      for (const o of out) o.y = Math.max(o.h / 2 + 6, Math.min(H - o.h / 2 - 6, o.y));
      if (!any) break;
    }
    return out;
  }

  const itemsOf = (a: AreaRt): SubItem[] => a.subs.map((s) => ({ name: s.name, level: s.level, isGroup: !!s.children, count: s.children?.length ?? 0 }));
  const groupItems = (a: AreaRt, name: string): SubItem[] =>
    (a.subs.find((s) => s.name === name)?.children ?? []).map((c) => ({ name: c.name, level: c.level, isGroup: false, count: 0 }));

  function frame(ts: number) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (!visible || W === 0) {
      lastT = ts;
      return;
    }
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0);
    lastT = ts;
    if (!reduce && !dragging && !active) theta += dt * ((Math.PI * 2) / 80);
    const kk = Math.min(1, dt * 4);
    if (follow) {
      let d = thetaT - theta;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      theta += d * kk;
      panY += (panT - panY) * kk;
      offX += (offT - offX) * kk;
    } else if (!active) {
      panY += -panY * Math.min(1, dt * 3);
      offX += -offX * Math.min(1, dt * 3);
    }
    if (active) grow = Math.min(1, grow + dt * 1.8);
    ctx.clearRect(0, 0, W, H);
    const tm = reduce ? 0 : ts / 1000;
    const act = active ? (areas.find((a) => a.id === active) ?? null) : null;
    const P = nodes.map((n) => proj(n.p));
    rectsNow = [];
    hitsNow = [];

    for (const e of edges) {
      const a = P[e.a]!;
      const b = P[e.b]!;
      const depth = (a.s + b.s) / 2;
      const isArea = e.kind === "area";
      const f = act ? 0.16 : 1;
      const sg = mkSeg(a, b, e.bend);
      ctx.strokeStyle = isArea ? `rgba(140,190,255,${0.42 * depth * f})` : `rgba(140,170,220,${0.2 * depth * f})`;
      ctx.lineWidth = isArea ? 1.4 : 1;
      strokeSeg(sg);
      if (!reduce && isArea) {
        const ps = segAt(sg, (tm * e.sp + e.ph) % 1);
        ctx.fillStyle = `rgba(190,225,255,${0.9 * f})`;
        ctx.beginPath();
        ctx.arc(ps.x, ps.y, 2.4 * depth, 0, 7);
        ctx.fill();
      }
    }
    nodes.forEach((n, i) => {
      if (n.area) return;
      const p = P[i]!;
      ctx.fillStyle = `rgba(170,200,245,${0.5 * p.s * (act ? 0.3 : 1)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (n.r ?? 3) * p.s, 0, 7);
      ctx.fill();
    });

    // Areas, de atras hacia adelante.
    areas
      .map((a, i) => ({ a, p: P[i]! }))
      .sort((u, v) => v.p.z - u.p.z)
      .forEach(({ a, p }) => {
        const isAct = !!act && act.id === a.id;
        const hov = hover === a.id;
        const al = act ? (isAct ? 1 : 0.2) : 1;
        let r = (16 + (hov ? 2 : 0)) * Math.max(0.8, Math.min(1.15, p.s));
        if (isAct && group) r *= 0.85;
        drawCell(p.x, p.y, r, a.col, al, a.i, tm);
        hitsNow.push({ kind: "area", id: a.id, x: p.x, y: p.y, r: Math.max(24, r * 2.6) });
        if (!act || isAct) {
          const fs = narrow ? 12 : Math.max(12, Math.min(15, 13.5 * p.s));
          const txt = isAct && group ? `‹ ${a.name}` : a.name;
          ctx.font = `700 ${fs}px ${FONT}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          let lines = [txt];
          const maxW = W * 0.3;
          if (narrow && isAct) {
            lines = [];
            let cur = "";
            for (const wd of txt.split(" ")) {
              const t2 = cur ? `${cur} ${wd}` : wd;
              if (cur && ctx.measureText(t2).width > maxW) {
                lines.push(cur);
                cur = wd;
              } else cur = t2;
            }
            lines.push(cur);
          }
          let widest = 0;
          for (const ln of lines) widest = Math.max(widest, ctx.measureText(ln).width);
          const lx = Math.max(6, Math.min(W - widest - 6, p.x - widest / 2));
          const lh = fs + 3;
          let ly = p.y + r * 3.1 + 6;
          if (isAct) ly = Math.min(ly, H - lh * lines.length - 8);
          ctx.globalAlpha = al;
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(8,18,40,.9)";
          ctx.shadowBlur = 6;
          lines.forEach((ln, li) => ctx.fillText(ln, lx, ly + li * lh));
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          rectsNow.push({ key: `area:${a.id}`, x: lx, y: ly, w: widest, h: lh * lines.length });
        }
      });

    // Subareas del area activa: se despliegan dentro de la misma red.
    if (act) {
      const pa = proj(act.p);
      const list = group ? groupItems(act, group) : itemsOf(act);
      const L = layout(list, pa.x, pa.y);
      L.forEach((o, i) => {
        const g = Math.max(0, Math.min(1, grow * 1.3 - i * 0.05));
        const e = 1 - Math.pow(1 - g, 3);
        const nx = pa.x + (o.x - pa.x) * e;
        const ny = pa.y + (o.y - pa.y) * e;
        const sg = mkSeg({ x: pa.x, y: pa.y }, { x: nx, y: ny }, i % 2 ? 1 : -1);
        ctx.strokeStyle = rgba(act.col, 0.8 * e);
        ctx.lineWidth = 1.8;
        strokeSeg(sg);
        if (!reduce && e > 0.9) {
          const pp = segAt(sg, (tm * 0.22 + i * 0.137) % 1);
          ctx.fillStyle = "rgba(255,255,255,.95)";
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 2.6, 0, 7);
          ctx.fill();
        }
        ctx.globalAlpha = e;
        const rr = o.it.isGroup ? 10 : 7.5;
        ctx.beginPath();
        if (style === "chip") ctx.rect(nx - rr, ny - rr, rr * 2, rr * 2);
        else ctx.arc(nx, ny, rr, 0, 7);
        if (o.it.isGroup) {
          ctx.fillStyle = "#e6f2f9";
          ctx.fill();
          ctx.strokeStyle = "#2aa0e0";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.strokeStyle = "#1a335d";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(nx - 5, ny);
          ctx.lineTo(nx + 5, ny);
          ctx.moveTo(nx, ny - 5);
          ctx.lineTo(nx, ny + 5);
          ctx.stroke();
        } else if (o.it.level === "d") {
          ctx.fillStyle = "#2aa0e0";
          ctx.fill();
        } else if (o.it.level === "e") {
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.strokeStyle = "#2aa0e0";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = "#b9c4d0";
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (e > 0.7) {
          const rc = { x: o.side > 0 ? nx + 12 : nx - 12 - o.w, y: ny - o.h / 2, w: o.w, h: o.h, fs: o.fs };
          rc.x = Math.max(4, Math.min(W - rc.w - 4, rc.x));
          drawLabel(labelOf(o.it), rc, Math.min(1, (e - 0.7) / 0.3));
          rectsNow.push({ key: `sub:${o.it.name}`, x: rc.x, y: rc.y, w: rc.w, h: rc.h });
        }
        if (o.it.isGroup && e > 0.9) hitsNow.push({ kind: "group", id: o.it.name, x: nx, y: ny, r: 24 });
      });
    }
  }

  // Interaccion.
  function hit(mx: number, my: number): Hit | null {
    let best: Hit | null = null;
    let bd = 1e9;
    for (const h of hitsNow) {
      const d = Math.hypot(mx - h.x, my - h.y);
      if (d < h.r && d < bd) {
        bd = d;
        best = h;
      }
    }
    return best;
  }
  const pos = (e: PointerEvent): Pt => {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  function emit() {
    opts.onState(active, group);
  }
  function toggle(id: string | null) {
    group = null;
    if (id === null || id === active || !areas.some((a) => a.id === id)) {
      active = null;
      follow = false;
      grow = 0;
    } else {
      active = id;
      grow = 0;
      follow = true;
      const a = areas.find((x) => x.id === id)!;
      const rho = Math.sqrt(a.p.x * a.p.x + a.p.z * a.p.z);
      thetaT = Math.atan2(a.p.x, -a.p.z);
      panT = -(a.p.y * Math.cos(tilt) + rho * Math.sin(tilt));
      offT = narrow ? -W * 0.34 : 0;
    }
    emit();
  }
  function openGroup(name: string | null) {
    group = name || null;
    grow = 0;
    emit();
  }

  const onDown = (e: PointerEvent) => {
    const p = pos(e);
    dragging = true;
    moved = false;
    lastX = downX = p.x;
    downY = p.y;
    cv.classList.add("drag");
    try {
      cv.setPointerCapture(e.pointerId);
    } catch {
      // sin captura: el arrastre sigue mientras el puntero este encima
    }
  };
  const onMove = (e: PointerEvent) => {
    const p = pos(e);
    if (dragging) {
      if (Math.abs(p.x - downX) + Math.abs(p.y - downY) > 5) moved = true;
      if (moved && !active) theta += (p.x - lastX) * 0.008;
      lastX = p.x;
    } else {
      const h = hit(p.x, p.y);
      const id = h ? h.id : null;
      if (id !== hover) {
        hover = id;
        cv.classList.toggle("hot", !!h);
      }
    }
  };
  const onUp = (e: PointerEvent) => {
    const p = pos(e);
    dragging = false;
    cv.classList.remove("drag");
    if (!moved) {
      const h = hit(p.x, p.y);
      if (h) {
        if (h.kind === "group") openGroup(h.id);
        else if (h.id === active && group) openGroup(null);
        else toggle(h.id);
      }
    }
  };
  const onLeave = () => {
    hover = null;
    cv.classList.remove("hot");
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (group) openGroup(null);
      else toggle(null);
    }
  };
  cv.addEventListener("pointerdown", onDown);
  cv.addEventListener("pointermove", onMove);
  cv.addEventListener("pointerup", onUp);
  cv.addEventListener("pointerleave", onLeave);
  cv.addEventListener("keydown", onKey);

  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
    size();
    if (active) offT = narrow ? -W * 0.34 : 0;
  }) : null;
  ro?.observe(cv);
  const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((en) => (visible = en[0]?.isIntersecting ?? true)) : null;
  io?.observe(cv);
  size();
  raf = requestAnimationFrame(frame);

  return {
    setAreas(list) {
      const keep = active;
      areas = list.map((a, i) => ({ ...a, i, col: hexToCol(a.color), p: { x: 0, y: 0, z: 0 } }));
      buildNet();
      // Si el area abierta ya no existe (se borro o cambio su id), se cierra; si existe, se vuelve a abrir.
      active = null;
      group = null;
      grow = 0;
      follow = false;
      if (keep && areas.some((a) => a.id === keep)) toggle(keep);
      else emit();
    },
    setShape(s) {
      style = s;
    },
    toggle,
    openGroup,
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("keydown", onKey);
    },
    report() {
      const bad: string[] = [];
      const r = rectsNow;
      for (let i = 0; i < r.length; i++) {
        const a = r[i]!;
        if (a.x < -1 || a.y < -1 || a.x + a.w > W + 1 || a.y + a.h > H + 1) bad.push(`fuera:${a.key}`);
        for (let j = i + 1; j < r.length; j++) {
          const b = r[j]!;
          const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (ox > 0 && oy > 0) bad.push(`${a.key} x ${b.key}`);
        }
      }
      return { labels: r.length, problems: bad };
    },
  };
}
