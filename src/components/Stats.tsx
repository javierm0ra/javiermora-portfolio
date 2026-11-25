import { useEffect, useState } from "react";
import type { Strings } from "../data/i18n";
import { PROJECTS } from "../data/projects";
import { prefersReducedMotion } from "../hooks/motion";
import { useReveal } from "../hooks/useReveal";

// Cifras derivadas de los datos de proyectos: no hay numeros escritos a mano.
const COUNTS = {
  products: PROJECTS.length,
  sectors: new Set(PROJECTS.map((p) => p.category)).size,
  tech: new Set(PROJECTS.flatMap((p) => p.tags)).size,
};

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

export function Stats({ t }: { t: Strings }) {
  const { ref, shown } = useReveal<HTMLDListElement>();
  const items: [keyof typeof COUNTS, string][] = [
    ["products", t.stats.products],
    ["sectors", t.stats.sectors],
    ["tech", t.stats.tech],
  ];
  return (
    <dl ref={ref} className={`stats reveal${shown ? " is-in" : ""}`}>
      {items.map(([key, label]) => (
        <div key={key} className="stat">
          <dt>{label}</dt>
          <dd>
            <Counter to={COUNTS[key]} run={shown} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
