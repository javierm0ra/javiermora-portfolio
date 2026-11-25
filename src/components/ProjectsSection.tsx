import { useEffect, useState } from "react";
import type { Filter, Lang, Strings } from "../data/i18n";
import { PROJECTS } from "../data/projects";
import { prefersReducedMotion } from "../hooks/motion";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

const FILTERS: Filter[] = ["all", "finance", "realestate", "health", "events"];
const matches = (f: Filter, category: string) => f === "all" || f === category;

export function ProjectsSection({ lang, t }: { lang: Lang; t: Strings }) {
  // `filter` es lo que eligio la persona; `applied` es lo que ya se ve en el DOM.
  // Entre uno y otro las tarjetas que salen se desvanecen antes de ocultarse.
  const [filter, setFilter] = useState<Filter>("all");
  const [applied, setApplied] = useState<Filter>("all");

  useEffect(() => {
    if (filter === applied) return;
    if (prefersReducedMotion()) {
      setApplied(filter);
      return;
    }
    const id = window.setTimeout(() => setApplied(filter), 220);
    return () => window.clearTimeout(id);
  }, [filter, applied]);

  return (
    <section className="sec" id="proyectos">
      <Reveal>
        <h2>{t.projTitle}</h2>
        <p className="sec-sub">{t.projSub}</p>
        <div className="filters" role="group" aria-label={t.filterLabel}>
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {t.filters[f]}
            </button>
          ))}
        </div>
      </Reveal>
      <div className="grid">
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            lang={lang}
            t={t}
            index={i}
            leaving={!matches(filter, p.category)}
            hidden={!matches(applied, p.category)}
          />
        ))}
      </div>
    </section>
  );
}
