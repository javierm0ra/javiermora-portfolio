import { useRef, useState, type ReactNode } from "react";
import { ConfirmButton } from "./ui";

/** Una fila de la lista: titulo plegado y, al abrirla, su contenido. */
export interface Row {
  title: string;
  /** Texto pequeno a la derecha del titulo (por ejemplo el sector o el paso). */
  meta?: string;
  /** Fila apagada (por ejemplo, un proyecto oculto). */
  dim?: boolean;
  /** Contenido de la fila al abrirla. */
  body?: ReactNode;
  /** Fila «plana»: sin flecha de abrir; en su lugar va este contenido en la cabecera (por ejemplo interruptores). */
  flat?: ReactNode;
  /** Si existe, al final del contenido sale el boton «Eliminar» (con confirmacion) que llama a esto. */
  onRemove?: () => void;
  removeDisabled?: boolean;
}

interface Props {
  rows: Row[];
  /** Se llama al soltar una fila en otro lugar o al usar las flechas ↑ ↓. */
  onMove: (from: number, to: number) => void;
  /** Boton para agregar al final; la fila nueva se abre sola. */
  addLabel?: string;
  onAdd?: () => void;
  addDisabled?: boolean;
  label: string;
}

let counter = 0;
const newKey = () => `r${++counter}`;

/**
 * Lista de registros plegados que se pueden reordenar arrastrando el asa o con las flechas.
 * Las filas llevan una llave interna estable para que, al reordenar, cada una conserve si estaba abierta.
 */
export function SortableList({ rows, onMove, addLabel, onAdd, addDisabled, label }: Props) {
  const keys = useRef<string[]>([]);
  while (keys.current.length < rows.length) keys.current.push(newKey());
  if (keys.current.length > rows.length) keys.current.length = rows.length;
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [drag, setDrag] = useState<{ from: number; before: number } | null>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  function add() {
    onAdd?.();
    // La fila nueva va al final: se le da su llave y se abre para empezar a escribir.
    const k = newKey();
    keys.current.push(k);
    setOpen((o) => new Set(o).add(k));
  }

  function remove(i: number, fn: () => void) {
    keys.current.splice(i, 1);
    fn();
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= rows.length) return;
    const [k] = keys.current.splice(from, 1);
    keys.current.splice(to, 0, k!);
    onMove(from, to);
  }

  function toggle(k: string) {
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }

  /** Arrastre con raton o dedo: la fila sigue al puntero y una linea marca donde va a caer. */
  function startDrag(e: React.PointerEvent<HTMLButtonElement>, from: number) {
    const li = refs.current[from];
    if (!li) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const startY = e.pageY;
    const natural = li.getBoundingClientRect();
    const naturalMid = natural.top + window.scrollY + natural.height / 2;
    li.style.zIndex = "5";
    li.style.position = "relative";
    li.classList.add("is-dragging");
    let before = from;
    const target = (pageY: number) => {
      const mid = naturalMid + (pageY - startY);
      let b = rows.length;
      for (let i = 0; i < rows.length; i++) {
        if (i === from) continue;
        const r = refs.current[i]!.getBoundingClientRect();
        if (mid < r.top + window.scrollY + r.height / 2) {
          b = i;
          break;
        }
      }
      return b;
    };
    const onMoveEv = (ev: PointerEvent) => {
      li.style.transform = `translateY(${ev.pageY - startY}px)`;
      if (ev.clientY < 70) window.scrollBy(0, -14);
      else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
      before = target(ev.pageY);
      setDrag({ from, before });
    };
    const finish = () => {
      handle.removeEventListener("pointermove", onMoveEv);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", cancel);
      li.style.transform = "";
      li.style.zIndex = "";
      li.style.position = "";
      li.classList.remove("is-dragging");
      setDrag(null);
      // «before» es la posicion antes de la que cae; el destino final descuenta la fila que sale.
      const to = before > from ? before - 1 : before;
      move(from, to);
    };
    const cancel = () => {
      handle.removeEventListener("pointermove", onMoveEv);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", cancel);
      li.style.transform = "";
      li.style.zIndex = "";
      li.style.position = "";
      li.classList.remove("is-dragging");
      setDrag(null);
    };
    handle.addEventListener("pointermove", onMoveEv);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", cancel);
  }

  return (
    <div className="sl">
      <ul className="sl-list" aria-label={label}>
        {rows.map((r, i) => {
          const k = keys.current[i]!;
          const isOpen = open.has(k);
          const dropBefore = drag && drag.before === i && drag.before !== drag.from && drag.before !== drag.from + 1;
          const dropEnd = drag && i === rows.length - 1 && drag.before === rows.length && drag.from !== rows.length - 1;
          return (
            <li
              key={k}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`sl-row${isOpen ? " open" : ""}${r.dim ? " dim" : ""}${dropBefore ? " drop-before" : ""}${dropEnd ? " drop-end" : ""}`}
            >
              <div className="sl-h">
                <button type="button" className="sl-grip" aria-label={`Arrastrar para reordenar: ${r.title}`} onPointerDown={(e) => startDrag(e, i)}>
                  ⋮⋮
                </button>
                {r.flat ? (
                  <div className="sl-flat">
                    <span className="sl-tt">{r.title}</span>
                    {r.flat}
                  </div>
                ) : (
                  <button type="button" className="sl-t" aria-expanded={isOpen} onClick={() => toggle(k)}>
                    <span className="sl-chev" aria-hidden="true">
                      ›
                    </span>
                    <span className="sl-tt">{r.title}</span>
                    {r.meta && <span className="sl-mt">{r.meta}</span>}
                  </button>
                )}
                <span className="sl-mv">
                  <button type="button" disabled={i === 0} aria-label={`Subir ${r.title}`} onClick={() => move(i, i - 1)}>
                    ↑
                  </button>
                  <button type="button" disabled={i === rows.length - 1} aria-label={`Bajar ${r.title}`} onClick={() => move(i, i + 1)}>
                    ↓
                  </button>
                </span>
              </div>
              {!r.flat && isOpen && (
                <div className="sl-b">
                  {r.body}
                  {r.onRemove && (
                    <div className="sl-del">
                      <ConfirmButton label="Eliminar" confirmLabel="Sí, eliminar" danger disabled={r.removeDisabled} onConfirm={() => remove(i, r.onRemove!)} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {onAdd && addLabel && (
        <button type="button" className="btn-s add" disabled={addDisabled} onClick={add}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}
