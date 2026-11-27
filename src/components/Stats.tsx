import { useEffect, useState, type CSSProperties } from "react";
import { isDegreeKind } from "../../shared/content";
import type { Lang, Strings } from "../data/i18n";
import { useSite } from "../data/SiteContext";
import { prefersReducedMotion } from "../hooks/motion";
import { useReveal } from "../hooks/useReveal";

function Counter({ to, run }: { to: number; run: boolean }) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!run || prefersReducedMotion()) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1000);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);

  return <span>{value}</span>;
}

export function Stats({ t, lang }: { t: Strings; lang: Lang }) {
  const { projects, content } = useSite();
  // Productos y sectores salen de los proyectos visibles; los anos de experiencia se editan en el panel;
  // grados y cursos salen de los registros de Formacion (solo si esa seccion se muestra).
  const eduOn = content.layout.some((e) => e.id === "formacion" && e.show);
  const degrees = content.education.items.filter((i) => isDegreeKind(i.kind)).length;
  const courses = content.education.items.length - degrees;
  const items: { key: string; label: string; to: number; before?: string; after?: string }[] = [
    { key: "years", label: t.stats.years, to: content.years, before: lang === "es" ? "+" : "", after: lang === "es" ? "" : "+" },
    { key: "products", label: t.stats.products, to: projects.length },
    { key: "sectors", label: t.stats.sectors, to: new Set(projects.map((p) => p.category)).size },
    ...(eduOn && degrees > 0 ? [{ key: "degrees", label: t.stats.degrees, to: degrees }] : []),
    ...(eduOn && courses > 0 ? [{ key: "courses", label: t.stats.courses, to: courses }] : []),
  ];
  const { ref, shown } = useReveal<HTMLDListElement>();
  return (
    <dl ref={ref} className={`stats reveal${shown ? " is-in" : ""}`} style={{ "--n": items.length } as CSSProperties}>
      {items.map((it) => (
        <div key={it.key} className="stat">
          <dt>{it.label}</dt>
          <dd>
            {it.before}
            <Counter to={it.to} run={shown} />
            {it.after}
          </dd>
        </div>
      ))}
    </dl>
  );
}
