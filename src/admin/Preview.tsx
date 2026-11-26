import { useEffect, useState } from "react";
import type { Content } from "../../shared/content";
import App from "../App";
import { defaultContent } from "../data/content";
import { SiteProvider } from "../data/SiteContext";
import { explain, getJson } from "./api";

interface Payload {
  draft: Content | null;
  published: Content | null;
}

/** Muestra el sitio real con el borrador guardado (no es publico: solo se abre con sesion). */
export default function Preview() {
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string } | { status: "ok"; content: Content }>({ status: "loading" });

  useEffect(() => {
    document.title = "Vista previa · Javier Mora";
    void getJson<Payload>("/api/admin/content").then((r) => {
      if (!r.ok) return setState({ status: "error", message: explain(r.error, r.status) });
      setState({ status: "ok", content: r.data.draft ?? r.data.published ?? defaultContent() });
    });
  }, []);

  if (state.status === "loading") return <p className="preview-note">Cargando el borrador…</p>;
  if (state.status === "error")
    return (
      <p className="preview-note">
        {state.message} <a href="/admin/contenido">Volver al panel</a>
      </p>
    );

  return (
    <>
      <SiteProvider initial={state.content}>
        <App />
      </SiteProvider>
      <div className="preview-bar" role="status">
        <strong>Vista previa del borrador.</strong> Aquí las visitas y los clics no se cuentan.
        <a href="/admin/contenido">Volver al editor</a>
      </div>
    </>
  );
}
