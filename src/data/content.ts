import { DEFAULT_ABOUT, DEFAULT_EDUCATION, DEFAULT_EXPERIENCE, DEFAULT_EXPERTISE, DEFAULT_LAYOUT, DEFAULT_YEARS, type Content, type ContentProject } from "../../shared/content";
import { STRINGS, type Lang, type Strings } from "./i18n";
import { PROJECTS, type Project, type Screen } from "./projects";
import screensManifest from "./screens.json";

const BUNDLED_SCREENS = screensManifest as Record<string, Screen[]>;

export const DEFAULT_EMAIL = "javiermoramx@gmail.com";
export const DEFAULT_GITHUB = "https://github.com/javierm0ra";

const DESCRIPTION: Record<Lang, string> = {
  es: "Product owner fintech con más de 13 años en plataformas de crédito. Seis productos construidos con IA para México.",
  en: "Fintech product owner with 13+ years in lending platforms. Six products built with AI for Mexico.",
};

/** Iconos que ya vienen con el sitio (public/icons). */
const BUNDLED_ICONS = new Set(["stabily", "kasanode", "kondonode", "parilink", "medicatio", "ahinosvemos"]);

const both = (pick: (s: Strings) => string) => ({ es: pick(STRINGS.es), en: pick(STRINGS.en) });

/** El contenido original del codigo, con la misma forma que el que se edita en el panel. */
export function defaultContent(): Content {
  return {
    v: 1,
    hero: {
      eyebrow: both((s) => s.eyebrow),
      // El espacio entre el inicio y el texto resaltado lo pone el sitio, por eso aqui va sin espacios al final.
      h1Before: both((s) => s.h1.before.trim()),
      h1Em: both((s) => s.h1.em),
      h1After: both((s) => s.h1.after),
      lede: both((s) => s.lede),
    },
    availability: { enabled: false, text: { es: "Disponible para proyectos", en: "Available for projects" } },
    sections: {
      projTitle: both((s) => s.projTitle),
      projSub: both((s) => s.projSub),
      howTitle: both((s) => s.howTitle),
      howSub: both((s) => s.howSub),
      ctTitle: both((s) => s.ctTitle),
      ctText: both((s) => s.ctText),
    },
    steps: STRINGS.es.steps.map((step, i) => ({
      title: { es: step.title, en: STRINGS.en.steps[i]?.title ?? step.title },
      text: { es: step.text, en: STRINGS.en.steps[i]?.text ?? step.text },
    })),
    projects: PROJECTS.map(
      (p): ContentProject => ({
        id: p.id,
        name: p.name,
        url: p.url,
        category: p.category,
        hidden: false,
        business: p.status === "business",
        badge: { text: { es: "", en: "" }, tone: "auto" },
        tags: [...p.tags],
        desc: { es: p.copy.es.desc, en: p.copy.en.desc },
        role: { es: p.copy.es.role, en: p.copy.en.role },
        image: null,
        icon: null,
      }),
    ),
    about: structuredClone(DEFAULT_ABOUT),
    layout: DEFAULT_LAYOUT.map((e) => ({ ...e })),
    education: structuredClone(DEFAULT_EDUCATION),
    expertise: structuredClone(DEFAULT_EXPERTISE),
    experience: structuredClone(DEFAULT_EXPERIENCE),
    years: DEFAULT_YEARS,
    contact: { email: DEFAULT_EMAIL, github: DEFAULT_GITHUB },
    seo: { title: both((s) => s.docTitle), description: DESCRIPTION },
  };
}

/** Textos del sitio en un idioma: los originales, con lo editado encima. */
export function buildStrings(content: Content, lang: Lang): Strings {
  return {
    ...STRINGS[lang],
    docTitle: content.seo.title[lang],
    eyebrow: content.hero.eyebrow[lang],
    h1: { before: content.hero.h1Before[lang], em: content.hero.h1Em[lang], after: content.hero.h1After[lang] },
    lede: content.hero.lede[lang],
    projTitle: content.sections.projTitle[lang],
    projSub: content.sections.projSub[lang],
    howTitle: content.sections.howTitle[lang],
    howSub: content.sections.howSub[lang],
    ctTitle: content.sections.ctTitle[lang],
    ctText: content.sections.ctText[lang],
    steps: content.steps.map((s) => ({ title: s.title[lang], text: s.text[lang] })),
  };
}

/** Proyectos visibles. Los que ya existian en el codigo conservan sus pantallas simuladas. */
export function buildProjects(content: Content): Project[] {
  return content.projects
    .filter((p) => !p.hidden)
    .map((p) => ({
      id: p.id,
      name: p.name,
      url: p.url,
      status: p.business ? ("business" as const) : ("prod" as const),
      badge: p.badge,
      category: p.category,
      tags: p.tags,
      screens: BUNDLED_SCREENS[p.id] ?? [],
      image: p.image,
      icon: p.icon ?? (BUNDLED_ICONS.has(p.id) ? `/icons/${p.id}.png` : null),
      copy: { es: { desc: p.desc.es, role: p.role.es }, en: { desc: p.desc.en, role: p.role.en } },
    }));
}
