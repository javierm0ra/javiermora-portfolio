import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { isDegreeKind, type EducationItem } from "../../shared/content";
import type { Lang, Strings } from "../data/i18n";
import { useSite } from "../data/SiteContext";
import { prefersReducedMotion } from "../hooks/motion";
import { Reveal } from "./Reveal";

// Cuanto resalta cada peso (no cambia el tipo) y tamano del punto en la linea.
const WM = { alto: 1.1, normal: 1, bajo: 0.95 } as const;
const DOT = { alto: 18, normal: 13, bajo: 9 } as const;

const hue = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};
const initials = (s: string) => {
  const w = s.trim().split(/\s+/).filter(Boolean);
  return (w.length > 1 ? `${w[0]![0]}${w[1]![0]}` : s.trim().slice(0, 2)).toUpperCase();
};

function Logo({ item }: { item: EducationItem }) {
  if (item.logo)
    return (
      <span className="etl-logo has-img">
        <img src={item.logo} alt="" loading="lazy" decoding="async" />
      </span>
    );
  return (
    <span className="etl-logo" style={{ background: `hsl(${hue(item.institution)} 42% 38%)` }} aria-hidden="true">
      {initials(item.institution)}
    </span>
  );
}

/**
 * Formacion: linea de tiempo horizontal. El registro que queda al centro se agranda como con una lupa;
 * se recorre arrastrando con el dedo o el mouse, con las flechas o con el teclado.
 */
export function Education({ lang, t }: { lang: Lang; t: Strings }) {
  const { content } = useSite();
  const edu = content.education;
  const sorted = useMemo(() => edu.items.map((it, i) => ({ it, i })).sort((a, b) => a.it.year - b.it.year || a.i - b.i).map((x) => x.it), [edu.items]);
  const [listView, setListView] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hint, setHint] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const scRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const nudging = useRef(false);
  const userMoved = useRef(false);
  const suppress = useRef(false);

  const colWidth = () => (trackRef.current?.children[0] as HTMLElement | undefined)?.offsetWidth ?? 160;

  const zoom = useCallback(() => {
    const sc = scRef.current;
    const tr = trackRef.current;
    if (!sc || !tr) return;
    const r = sc.getBoundingClientRect();
    const trr = tr.getBoundingClientRect();
    const cols = Array.from(tr.children) as HTMLElement[];
    const cw = cols[0]?.offsetWidth ?? 160;
    const amp = r.width < 640 ? 0.36 : 0.5;
    const sigma = Math.max(100, cw * 0.95);
    // Sin relleno grande a los lados, la primera y la ultima fila no pueden quedar al centro:
    // cerca de los extremos el «centro de enfoque» se desplaza hasta ellas.
    const W = r.width;
    const sl = sc.scrollLeft;
    const maxS = Math.max(0, sc.scrollWidth - W);
    const cx = (c: HTMLElement) => c.getBoundingClientRect().left - trr.left + c.offsetWidth / 2;
    const first = cols.length ? cx(cols[0]!) : 0;
    const last = cols.length ? cx(cols[cols.length - 1]!) : 0;
    const m = sl + W / 2;
    let focusX = m;
    if (maxS > 0 && maxS < W) focusX = first + ((last - first) * sl) / maxS;
    else if (maxS >= W && sl < W / 2) focusX = first + ((W - first) * sl) / (W / 2);
    else if (maxS >= W && sl > maxS - W / 2) focusX = maxS + ((last - maxS) * (sl - (maxS - W / 2))) / (W / 2);
    let best = Infinity;
    let bestId: string | null = null;
    for (const c of cols) {
      const d = Math.abs(cx(c) - focusX);
      c.style.setProperty("--z", (1 + amp * Math.exp(-Math.pow(d / sigma, 2))).toFixed(3));
      if (d < best) {
        best = d;
        bestId = c.dataset.id ?? null;
      }
    }
    setFocusId((prev) => (prev === bestId ? prev : bestId));
  }, []);

  // Al abrir (o volver de la lista) la linea queda en lo mas reciente.
  useLayoutEffect(() => {
    const sc = scRef.current;
    if (!sc || listView) return;
    sc.style.scrollBehavior = "auto";
    sc.scrollLeft = sc.scrollWidth;
    sc.style.scrollBehavior = "";
    zoom();
  }, [listView, sorted.length, zoom]);

  useEffect(() => {
    const sc = scRef.current;
    if (!sc || listView) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        zoom();
      });
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", zoom);
    return () => {
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", zoom);
    };
  }, [listView, zoom, sorted.length]);

  const stopHint = () => {
    userMoved.current = true;
    nudging.current = false;
    setHint(false);
  };

  // Invitacion a deslizar: una sola vez al llegar a la seccion (no si hay movimiento reducido).
  useEffect(() => {
    const box = boxRef.current;
    const sc = scRef.current;
    if (!box || !sc || listView || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    let done = false;
    let timer = 0;
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const restore = () => {
      sc.style.scrollSnapType = "";
      sc.style.scrollBehavior = "";
    };
    const go = (a: number, b: number, dur: number, then: () => void) => {
      let t0: number | null = null;
      const tick = (ts: number) => {
        if (!nudging.current) return restore();
        if (t0 === null) t0 = ts;
        const k = Math.min(1, (ts - t0) / dur);
        sc.scrollLeft = a + (b - a) * ease(k);
        if (k < 1) requestAnimationFrame(tick);
        else then();
      };
      requestAnimationFrame(tick);
    };
    const run = () => {
      if (userMoved.current) return;
      nudging.current = true;
      const from = sc.scrollLeft;
      const to = Math.max(0, from - colWidth() * 2.2);
      sc.style.scrollSnapType = "none";
      sc.style.scrollBehavior = "auto";
      go(from, to, 900, () => {
        timer = window.setTimeout(() => go(to, from, 900, () => {
          nudging.current = false;
          restore();
        }), 500);
      });
    };
    const io = new IntersectionObserver(
      (en) => {
        if (en[0]?.isIntersecting && !done) {
          done = true;
          timer = window.setTimeout(run, 500);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      nudging.current = false;
      restore();
    };
  }, [listView, sorted.length]);

  const centerOn = (col: HTMLElement) => {
    const sc = scRef.current;
    if (!sc) return;
    const r = sc.getBoundingClientRect();
    const b = col.getBoundingClientRect();
    sc.scrollTo({ left: sc.scrollLeft + (b.left + b.width / 2 - (r.left + r.width / 2)), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  const step = (dir: 1 | -1) => {
    stopHint();
    scRef.current?.scrollBy({ left: dir * colWidth(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // Arrastrar con el dedo o el mouse: al soltar se acomoda en el registro mas cercano.
  const drag = useRef<{ id: number; x0: number; sl0: number; v: number; lx: number; lt: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const sc = scRef.current;
    if (!sc) return;
    drag.current = { id: e.pointerId, x0: e.clientX, sl0: sc.scrollLeft, v: 0, lx: e.clientX, lt: performance.now() };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const sc = scRef.current;
    if (!d || !sc || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (!moved.current && Math.abs(dx) > 6) {
      moved.current = true;
      try {
        sc.setPointerCapture(e.pointerId);
      } catch {
        // sin captura: el arrastre sigue mientras el puntero este encima
      }
      sc.style.scrollSnapType = "none";
      sc.style.scrollBehavior = "auto";
      sc.classList.add("grab");
      stopHint();
    }
    if (moved.current) {
      sc.scrollLeft = d.sl0 - dx;
      const now = performance.now();
      d.v = (d.lx - e.clientX) / Math.max(1, now - d.lt);
      d.lx = e.clientX;
      d.lt = now;
      zoom();
    }
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const sc = scRef.current;
    const tr = trackRef.current;
    if (!d || !sc || !tr || d.id !== e.pointerId) return;
    drag.current = null;
    if (!moved.current) return;
    sc.classList.remove("grab");
    suppress.current = true;
    window.setTimeout(() => (suppress.current = false), 0);
    const r = sc.getBoundingClientRect();
    const target = sc.scrollLeft + Math.max(-900, Math.min(900, d.v * 220));
    let best = target;
    let bd = Infinity;
    for (const c of Array.from(tr.children) as HTMLElement[]) {
      const bb = c.getBoundingClientRect();
      const left = bb.left - r.left + sc.scrollLeft + bb.width / 2 - r.width / 2;
      const dist = Math.abs(left - target);
      if (dist < bd) {
        bd = dist;
        best = left;
      }
    }
    sc.style.scrollSnapType = "";
    sc.style.scrollBehavior = "";
    sc.scrollTo({ left: best, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  if (sorted.length === 0) return null;

  return (
    <section className="sec edu" id="formacion">
      <Reveal>
        <div className="edu-head">
          <div>
            <h2>{edu.title[lang]}</h2>
            {edu.intro[lang] && <p className="sec-sub">{edu.intro[lang]}</p>}
          </div>
          <button type="button" className="edu-toggle" aria-pressed={listView} onClick={() => setListView((v) => !v)}>
            {listView ? t.edu.toTimeline : t.edu.toList}
          </button>
        </div>
      </Reveal>

      {listView ? (
        <ul className="edu-list">
          {sorted
            .slice()
            .reverse()
            .map((it) => (
              <li key={it.id}>
                <b>{it.year}</b>
                <span>
                  <strong>{it.name[lang]}</strong>
                  <br />
                  <span className="edu-meta">
                    {it.institution} · {t.edu.kinds[it.kind]}
                  </span>
                </span>
              </li>
            ))}
        </ul>
      ) : (
        <>
          <div className="etl" ref={boxRef}>
            <button type="button" className="etl-arrow l" aria-label={t.edu.prev} onClick={() => step(-1)}>
              ‹
            </button>
            <button type="button" className="etl-arrow r" aria-label={t.edu.next} onClick={() => step(1)}>
              ›
            </button>
            {hint && (
              <span className="etl-hint" aria-hidden="true">
                {t.edu.hint}
              </span>
            )}
            <div
              className="etl-scroll"
              ref={scRef}
              tabIndex={0}
              aria-label={t.edu.timelineLabel}
              onKeyDown={onKey}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={(e) => {
                if (suppress.current) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              onWheel={stopHint}
            >
              <div className="etl-track" ref={trackRef}>
                {sorted.map((it, i) => {
                  const up = i % 2 === 0;
                  const card = (
                    <button
                      type="button"
                      className="etl-item"
                      style={{ "--wm": WM[it.weight] } as CSSProperties}
                      aria-label={`${it.name[lang]}, ${it.institution}, ${it.year}`}
                      onClick={(e) => centerOn(e.currentTarget.closest(".etl-col") as HTMLElement)}
                    >
                      <Logo item={it} />
                      <span className="etl-yr">{it.year}</span>
                      <span className="etl-ttl">{it.name[lang]}</span>
                      <span className="etl-ins">{it.institution}</span>
                      <span className="etl-kind">{t.edu.kinds[it.kind]}</span>
                    </button>
                  );
                  return (
                    <div key={it.id} className={`etl-col${focusId === it.id ? " focus" : ""}`} data-id={it.id} data-t={isDegreeKind(it.kind) ? "g" : "c"} data-w={it.weight}>
                      <div className="etl-cell up">{up ? card : null}</div>
                      <span className="etl-dot" style={{ width: DOT[it.weight], height: DOT[it.weight] }} />
                      <div className="etl-cell down">{up ? null : card}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="etl-legend" aria-hidden="true">
            <span>
              <i className="g" />
              {t.edu.legendDegrees}
            </span>
            <span>
              <i className="c" />
              {t.edu.legendCourses}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
