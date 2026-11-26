import type { CSSProperties } from "react";
import type { Lang, Strings } from "../data/i18n";
import type { Project } from "../data/projects";
import { useReveal } from "../hooks/useReveal";
import { Mock } from "./Mock";

interface Props {
  project: Project;
  lang: Lang;
  t: Strings;
  index: number;
  leaving: boolean;
  hidden: boolean;
}

export function ProjectCard({ project, lang, t, index, leaving, hidden }: Props) {
  const copy = project.copy[lang];
  const { ref, shown } = useReveal<HTMLAnchorElement>();
  const cls = ["card", "reveal", shown ? "is-in" : "", leaving ? "leaving" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      ref={ref}
      className={cls}
      style={{ "--d": `${(index % 2) * 90}ms` } as CSSProperties}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      hidden={hidden}
    >
      <div className="shot">
        <Mock project={project} />
        <span className="fict">{t.fictional}</span>
      </div>
      <div className="body">
        <div className="row">
          <h3>{project.name}</h3>
          <span className="pill good">{t.status[project.status]}</span>
        </div>
        <p className="desc">{copy.desc}</p>
        <p className="role">
          <b>{t.role}:</b> {copy.role}
        </p>
        <ul className="tags">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <span className="visit">{t.visit}</span>
      </div>
    </a>
  );
}
