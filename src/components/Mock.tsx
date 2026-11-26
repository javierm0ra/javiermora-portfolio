import type { Project } from "../data/projects";
import { ScreenFrame } from "./ScreenFrame";

/** Composicion de las pantallas de un proyecto: escritorio con celular encima, o dos celulares. */
export function Mock({ project }: { project: Project }) {
  const desktop = project.screens.find((s) => s.kind === "desktop");
  const phones = project.screens.filter((s) => s.kind === "phone");
  const label = `${project.name}`;

  if (desktop) {
    return (
      <div className="mock mock-dp">
        <ScreenFrame screen={desktop} label={label} className="m-main" />
        {phones[0] && <ScreenFrame screen={phones[0]} label={label} className="m-phone" />}
      </div>
    );
  }
  return (
    <div className="mock mock-pp">
      {phones[0] && <ScreenFrame screen={phones[0]} label={label} className="m-p1" />}
      {phones[1] && <ScreenFrame screen={phones[1]} label={label} className="m-p2" />}
    </div>
  );
}
