import { useState } from "react";

/** Boton de dos pasos: el primero pide confirmar y el segundo ejecuta. */
export function ConfirmButton(props: { label: string; confirmLabel: string; onConfirm: () => void; danger?: boolean; disabled?: boolean }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" className={`btn-s${props.danger ? " danger" : ""}`} disabled={props.disabled} onClick={() => setAsking(true)}>
        {props.label}
      </button>
    );
  return (
    <span className="confirm" role="group" aria-label="Confirmar">
      <button
        type="button"
        className="btn-s danger"
        onClick={() => {
          setAsking(false);
          props.onConfirm();
        }}
      >
        {props.confirmLabel}
      </button>
      <button type="button" className="btn-s" onClick={() => setAsking(false)}>
        Cancelar
      </button>
    </span>
  );
}
