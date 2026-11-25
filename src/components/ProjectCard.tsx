import type { Lang, Strings } from "../data/i18n";
import type { Project } from "../data/projects";
import { Illustration } from "./Illustration";

export function ProjectCard({ project, lang, t }: { project: Project; lang: Lang; t: Strings }) {
  const copy = project.copy[lang];
  return (
    <a className="card" href={project.url} target="_blank" rel="noopener noreferrer">
      <div className="shot">
        <div className="win">
          <Illustration id={project.id} />
        </div>
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
