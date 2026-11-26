import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { validateContent, type Content } from "../../shared/content";
import { buildProjects, buildStrings, defaultContent } from "./content";
import type { Lang, Strings } from "./i18n";
import type { Project } from "./projects";

interface Site {
  content: Content;
  projects: Project[];
  strings: (lang: Lang) => Strings;
}

const Ctx = createContext<Site | null>(null);

/** Contenido publicado (null si aun no hay, o si fallo). Se espera un instante para evitar un cambio visible al cargar. */
export function loadPublished(timeoutMs: number): { first: Promise<Content | null>; whenever: Promise<Content | null> } {
  const whenever: Promise<Content | null> = fetch("/api/content", { headers: { accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : null))
    .then((body: { content?: unknown } | null) => {
      if (!body || body.content == null) return null;
      const v = validateContent(body.content);
      return v.ok ? v.value : null;
    })
    .catch(() => null);
  const first = Promise.race([whenever, new Promise<null>((res) => window.setTimeout(() => res(null), timeoutMs))]);
  return { first, whenever };
}

export function SiteProvider({ initial, late, children }: { initial: Content | null; late?: Promise<Content | null>; children: ReactNode }) {
  const [content, setContent] = useState<Content>(() => initial ?? defaultContent());

  useEffect(() => {
    if (initial || !late) return;
    let alive = true;
    void late.then((c) => alive && c && setContent(c));
    return () => {
      alive = false;
    };
  }, [initial, late]);

  const value = useMemo<Site>(
    () => ({ content, projects: buildProjects(content), strings: (lang) => buildStrings(content, lang) }),
    [content],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite(): Site {
  const site = useContext(Ctx);
  if (!site) throw new Error("useSite debe usarse dentro de SiteProvider");
  return site;
}
