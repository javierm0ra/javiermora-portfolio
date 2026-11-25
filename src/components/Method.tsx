import { useEffect, useState } from "react";
import type { Strings } from "../data/i18n";
import { prefersReducedMotion } from "../hooks/motion";
import { useReveal } from "../hooks/useReveal";
import { Reveal } from "./Reveal";

export function Method({ t }: { t: Strings }) {
  const { ref, shown } = useReveal<HTMLOListElement>();
  const total = t.steps.length;
  const [lit, setLit] = useState(0);

  // Los pasos se iluminan en secuencia al llegar a la seccion.
  useEffect(() => {
    if (!shown) return;
    if (prefersReducedMotion()) {
      setLit(total);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setLit(n);
      if (n >= total) window.clearInterval(id);
    }, 520);
    return () => window.clearInterval(id);
  }, [shown, total]);

  return (
    <div className="band gut" id="metodo">
      <div className="wrap">
        <Reveal>
          <h2>{t.howTitle}</h2>
          <p className="sec-sub">{t.howSub}</p>
        </Reveal>
        <div className="track" aria-hidden="true">
          <span style={{ transform: `scaleX(${lit / total})` }} />
        </div>
        <ol ref={ref} className="steps">
          {t.steps.map((s, i) => (
            <li key={s.title} className={i < lit ? "lit" : ""}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
