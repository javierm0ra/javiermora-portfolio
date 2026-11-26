import { useLayoutEffect, useRef, useState } from "react";
import type { Screen } from "../data/projects";

interface Props {
  screen: Screen;
  label: string;
  className?: string;
  /** Carga de inmediato (arriba del pliegue); si no, el navegador la carga al acercarse. */
  eager?: boolean;
}

/**
 * Pantalla simulada de una app: un documento estatico de public/screens dentro de un iframe
 * a su tamano natural, escalado al ancho disponible. Es decorativa (el texto de la tarjeta
 * ya describe el proyecto), asi que no recibe foco ni se lee con lector de pantalla.
 */
export function ScreenFrame({ screen, label, className = "", eager = false }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / screen.w);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [screen.w]);

  return (
    <div
      ref={box}
      className={`screen ${className}`.trim()}
      style={{ aspectRatio: `${screen.w} / ${screen.h}` }}
      aria-hidden="true"
    >
      {scale > 0 && (
        <iframe
          src={`/screens/${screen.file}`}
          title={label}
          width={screen.w}
          height={screen.h}
          loading={eager ? "eager" : "lazy"}
          sandbox=""
          tabIndex={-1}
          style={{ transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
