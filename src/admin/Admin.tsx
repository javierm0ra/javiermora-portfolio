import { useEffect } from "react";
import Editor from "./Editor";
import Preview from "./Preview";
import Visitas from "./Visitas";
import "./admin.css";

type View = "visitas" | "contenido" | "preview";

function currentView(): View {
  const path = location.pathname.replace(/\/+$/, "");
  if (path === "/admin/contenido") return "contenido";
  if (path === "/admin/vista-previa") return "preview";
  return "visitas";
}

export default function Admin() {
  const view = currentView();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    if (view !== "preview") document.title = "Panel · Javier Mora";
    return () => meta.remove();
  }, [view]);

  if (view === "preview") return <Preview />;

  return (
    <div className="admin gut">
      <div className="admin-wrap">
        <header className="admin-head">
          <div>
            <a className="back" href="/">
              ← Volver al sitio
            </a>
            <h1>Panel</h1>
          </div>
          <nav className="tabs" aria-label="Secciones del panel">
            <a className={`tab${view === "visitas" ? " on" : ""}`} href="/admin" aria-current={view === "visitas" ? "page" : undefined}>
              Visitas
            </a>
            <a className={`tab${view === "contenido" ? " on" : ""}`} href="/admin/contenido" aria-current={view === "contenido" ? "page" : undefined}>
              Contenido
            </a>
          </nav>
        </header>
        {view === "contenido" ? <Editor /> : <Visitas />}
      </div>
    </div>
  );
}
