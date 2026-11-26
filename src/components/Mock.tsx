import type { Project } from "../data/projects";
import { ScreenFrame } from "./ScreenFrame";

/**
 * Imagen del proyecto: la que se subio desde el panel; si no hay, las pantallas simuladas
 * (escritorio con celular encima, o dos celulares); y si tampoco, un recuadro con la inicial.
 */
export function Mock({ project }: { project: Project }) {
  if (project.image) {
    return (
      <div className="mock mock-img">
        <img src={project.image} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }

  const desktop = project.screens.find((s) => s.kind === "desktop");
  const phones = project.screens.filter((s) => s.kind === "phone");
  const label = project.name;

  if (desktop) {
    return (
      <div className="mock mock-dp">
        <ScreenFrame screen={desktop} label={label} className="m-main" />
        {phones[0] && <ScreenFrame screen={phones[0]} label={label} className="m-phone" />}
      </div>
    );
  }
  if (phones.length > 0) {
    return (
      <div className="mock mock-pp">
        {phones[0] && <ScreenFrame screen={phones[0]} label={label} className="m-p1" />}
        {phones[1] && <ScreenFrame screen={phones[1]} label={label} className="m-p2" />}
      </div>
    );
  }
  return (
    <div className="mock mock-ph" aria-hidden="true">
      <span>{project.name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
