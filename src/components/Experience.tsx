import type { Lang } from "../data/i18n";
import { useSite } from "../data/SiteContext";
import { Reveal } from "./Reveal";

/** Trayectoria: misma banda azul que «Como trabajo», con los puntos en tarjetas. */
export function Experience({ lang }: { lang: Lang }) {
  const { content } = useSite();
  const ex = content.experience;
  return (
    <div className="band exp gut" id="trayectoria">
      <div className="wrap">
        <Reveal>
          <h2>{ex.title[lang]}</h2>
          <p className="sec-sub">{ex.intro[lang]}</p>
        </Reveal>
        <ul className="exp-list">
          {ex.points.map((p, i) => (
            <li key={i}>{p[lang]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
