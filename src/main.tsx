import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loadPublished, SiteProvider } from "./data/SiteContext";
import "./styles.css";

// El panel va en su propio bloque de codigo: quien visita el sitio no lo descarga.
const Admin = lazy(() => import("./admin/Admin"));
const path = location.pathname;
const isAdmin = path === "/admin" || path.startsWith("/admin/");

const root = createRoot(document.getElementById("root")!);

if (isAdmin) {
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    </StrictMode>,
  );
} else {
  // Se espera un instante el contenido publicado para no mostrar primero el original y luego cambiarlo.
  const { first, whenever } = loadPublished(450);
  void first.then((initial) =>
    root.render(
      <StrictMode>
        <SiteProvider initial={initial} late={whenever}>
          <App />
        </SiteProvider>
      </StrictMode>,
    ),
  );
}
