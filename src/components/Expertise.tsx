import { useEffect, useMemo, useRef, useState } from "react";
import type { ExpertiseSub } from "../../shared/content";
import type { Lang, Strings } from "../data/i18n";
import { useSite } from "../data/SiteContext";
import { prefersReducedMotion } from "../hooks/motion";
import { createNet, type NetArea, type NetHandle, type NetSub } from "../lib/expertise-net";
import { Reveal } from "./Reveal";

type Level = "d" | "e" | "s";

/** Areas de expertise: una red 3D que gira; al tocar un nodo se abren sus subareas. Debajo, los mismos datos como botones y lista (teclado y lectores de pantalla). */
export function Expertise({ lang, t }: { lang: Lang; t: Strings }) {
  const { content } = useSite();
  const ex = content.expertise;
  const cvRef = useRef<HTMLCanvasElement>(null);
  const net = useRef<NetHandle | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);

  const areas = useMemo<NetArea[]>(
    () =>
      ex.areas.map((a) => ({
        id: a.id,
        name: a.name[lang],
        color: a.color,
        subs: a.subs.map((s: ExpertiseSub) => ({
          name: s.name[lang],
          level: s.level,
          children: s.children?.map((c) => ({ name: c.name[lang], level: c.level })),
        })),
      })),
    [ex.areas, lang],
  );

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const h = createNet(cv, {
      reduceMotion: prefersReducedMotion(),
      onState: (a, g) => {
        setActive(a);
        setGroup(g);
      },
    });
    net.current = h;
    // Solo para revisar el dibujo desde las pruebas (agregar ?netdebug a la direccion).
    if (new URLSearchParams(window.location.search).has("netdebug")) (window as unknown as { __net?: NetHandle }).__net = h;
    return () => {
      h.destroy();
      net.current = null;
    };
  }, []);
  useEffect(() => net.current?.setAreas(areas), [areas]);
  useEffect(() => net.current?.setShape(ex.shape), [ex.shape]);

  if (ex.areas.length === 0) return null;
  const ar = areas.find((a) => a.id === active) ?? null;
  const grp = ar && group ? ar.subs.find((s) => s.name === group) : null;
  const chips: NetSub[] = grp ? (grp.children ?? []) : (ar?.subs ?? []);
  const lv = (l: Level) => <i className={`lv lv-${l}`} aria-hidden="true" />;

  return (
    <section className="sec" id="expertise">
      <Reveal>
        <h2>{ex.title[lang]}</h2>
        {ex.intro[lang] && <p className="sec-sub">{ex.intro[lang]}</p>}
        <div className="xp-band">
          <canvas ref={cvRef} className="xp-net" tabIndex={0} role="img" aria-label={t.xp.canvasLabel(areas.map((a) => a.name).join(", "))} />
          <div className="xp-areas" role="group" aria-label={t.xp.areasLabel}>
            {areas.map((a) => (
              <button key={a.id} type="button" aria-pressed={a.id === active} onClick={() => net.current?.toggle(a.id)}>
                {a.name}
              </button>
            ))}
          </div>
          <div className="xp-detail" aria-live="polite">
            {!ar && t.xp.idle}
            {ar && (
              <>
                {grp ? (
                  <>
                    <button type="button" className="xp-chip grp" aria-label={t.xp.backTo(ar.name)} onClick={() => net.current?.openGroup(null)}>
                      ‹ {ar.name}
                    </button>{" "}
                    <strong>{grp.name}</strong>
                  </>
                ) : (
                  <>
                    <strong>{ar.name}</strong> · {t.xp.subareas(ar.subs.length)}
                  </>
                )}
                <div className="xp-chips">
                  {chips.map((s) =>
                    s.children ? (
                      <button key={s.name} type="button" className="xp-chip grp" aria-expanded={group === s.name} onClick={() => net.current?.openGroup(s.name)}>
                        {s.name} · {s.children.length} ›
                      </button>
                    ) : (
                      <span key={s.name} className="xp-chip">
                        {lv(s.level)}
                        {s.name}
                      </span>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
          <div className="xp-legend" aria-hidden="true">
            <span>
              {lv("d")}
              {t.xp.legendD}
            </span>
            <span>
              {lv("e")}
              {t.xp.legendE}
            </span>
            <span>
              {lv("s")}
              {t.xp.legendS}
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
