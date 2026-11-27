/**
 * Contenido editable del sitio. Lo usan el sitio publico, el panel y las funciones de Cloudflare,
 * asi que las reglas de validacion viven aqui, en un solo lugar.
 */

export const CATEGORY_IDS = ["finance", "realestate", "health", "events"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface L2 {
  es: string;
  en: string;
}

export interface ContentProject {
  id: string;
  name: string;
  url: string;
  category: CategoryId;
  hidden: boolean;
  tags: string[];
  desc: L2;
  role: L2;
  /** Imagen propia (subida desde el panel). Reemplaza las pantallas simuladas. */
  image: string | null;
  /** Icono de la app (subido desde el panel). Si es null se usa el del sitio, o la inicial. */
  icon: string | null;
}

export interface ContentAbout {
  enabled: boolean;
  title: L2;
  role: L2;
  text: L2;
  /** Foto subida desde el panel. */
  photo: string | null;
  /** Direccion de LinkedIn (https) o vacio. */
  linkedin: string;
}

export const DEFAULT_ABOUT: ContentAbout = {
  enabled: false,
  title: { es: "Sobre mí", en: "About me" },
  role: { es: "Product Owner · Guadalajara, México", en: "Product Owner · Guadalajara, Mexico" },
  text: {
    es: "Soy Product Owner en Guadalajara, México, con más de 13 años en plataformas de crédito para SOFOMES y fintechs. Mi trabajo empieza con el problema, no con la solución: lo entiendo a fondo, lo convierto en reglas de negocio claras, planeo el alcance y lo apruebo. Después dirijo la construcción con herramientas de IA y verifico cada entrega: reviso los cambios, pido pruebas, confirmo que todo compile y que los datos queden bien antes de publicar.\n\nAsí he llevado a producción seis productos de software: Stabily (finanzas personales), KasaNode (administración inmobiliaria), KondoNode (condominios), Parilink (invitaciones digitales), Medicatio (clínicas médicas) y Ahí Nos Vemos (puntos de reunión). Cada uno tiene sus propias reglas, como contratos y comisiones, cuotas y fondos, presupuestos por quincena o consentimientos médicos, y mi tarea es dejarlas escritas, coherentes y comprobables.\n\nMe importa que cada producto sea claro para quien lo usa, que cuide la privacidad de sus datos y que cada decisión de negocio quede documentada. Trabajo en español de México y mis productos también hablan así.",
    en: "I'm a Product Owner based in Guadalajara, Mexico, with 13+ years in lending platforms for SOFOMES and fintechs. My work starts with the problem, not the solution: I understand it in depth, turn it into clear business rules, plan the scope and approve it. Then I direct the build with AI tools and verify every delivery: I review the changes, require tests, confirm everything builds and that the data is right before shipping.\n\nThat is how I've taken six software products to production: Stabily (personal finance), KasaNode (real estate management), KondoNode (condominiums), Parilink (digital invitations), Medicatio (medical clinics) and Ahí Nos Vemos (meeting points). Each has its own rules, such as contracts and commissions, fees and funds, biweekly budgets or medical consents, and my job is to keep them written down, consistent and verifiable.\n\nI care that each product is clear to the people using it, respects their data privacy, and that every business decision is documented. I work in Mexican Spanish and my products speak it too.",
  },
  photo: null,
  linkedin: "https://www.linkedin.com/in/javiermoramx/",
};

export interface ContentStep {
  title: L2;
  text: L2;
}

export interface ContentExperience {
  title: L2;
  intro: L2;
  points: L2[];
}

export const DEFAULT_EXPERIENCE: ContentExperience = {
  title: { es: "Trayectoria", en: "Experience" },
  intro: {
    es: "En Zell llevo más de 13 años construyendo y llevando a producción plataformas de crédito para SOFOMES y fintechs en México. Mi trabajo une a desarrollo, operaciones, contabilidad y cumplimiento alrededor de un mismo producto, desde definir los requerimientos de cada cliente hasta verlo operando en producción.",
    en: "At Zell, I've spent 13+ years building and shipping lending platforms for Mexican non-bank lenders (SOFOMES) and fintechs. My work brings development, operations, accounting and compliance together around a single product, from defining each client's requirements to seeing it run in production.",
  },
  points: [
    { es: "Crédito simple, líneas estructuradas, arrendamiento, factoraje y créditos de segundo piso.", en: "Term loans, structured credit lines, leasing, factoring and second-tier lending." },
    { es: "Implementación de la plataforma en cerca de 12 SOFOMES, desde el levantamiento de requerimientos hasta la salida a producción.", en: "Platform rollouts at about 12 SOFOMES, from requirements gathering to go-live." },
    { es: "Acompañamiento en al menos 6 auditorías de PLD/FT.", en: "Supported at least 6 AML/CFT (PLD/FT) audits." },
    { es: "Integraciones con SPEI/STP, servicios web SOAP y Buró de Crédito.", en: "SPEI/STP, SOAP web services and credit bureau (Buró de Crédito) integrations." },
    { es: "Backlog, user stories y cotizaciones técnicas; coordinación entre desarrollo, operaciones, contabilidad y cumplimiento.", en: "Backlog, user stories and technical estimates; coordinating development, operations, accounting and compliance teams." },
  ],
};

export const DEFAULT_YEARS = 13;

/** Secciones que se pueden ordenar. La portada (con las cifras) va siempre arriba y no forma parte de la lista. */
export const LAYOUT_IDS = ["trayectoria", "proyectos", "como", "sobre", "contacto"] as const;
export type LayoutId = (typeof LAYOUT_IDS)[number];

export interface LayoutEntry {
  id: LayoutId;
  /** Si la seccion se muestra en el sitio. */
  show: boolean;
  /** Si tiene enlace en el menu de arriba. */
  menu: boolean;
}

/** Orden de origen. «Sobre mi» sale apagada hasta que se active. */
export const DEFAULT_LAYOUT: LayoutEntry[] = [
  { id: "trayectoria", show: true, menu: true },
  { id: "proyectos", show: true, menu: true },
  { id: "como", show: true, menu: false },
  { id: "sobre", show: false, menu: true },
  { id: "contacto", show: true, menu: true },
];

export interface Content {
  v: 1;
  hero: { eyebrow: L2; h1Before: L2; h1Em: L2; h1After: L2; lede: L2 };
  availability: { enabled: boolean; text: L2 };
  sections: { projTitle: L2; projSub: L2; howTitle: L2; howSub: L2; ctTitle: L2; ctText: L2 };
  steps: ContentStep[];
  projects: ContentProject[];
  about: ContentAbout;
  /** Orden de las secciones y si se muestran / aparecen en el menu. */
  layout: LayoutEntry[];
  experience: ContentExperience;
  /** Anos de experiencia que muestra la tira de cifras. */
  years: number;
  contact: { email: string; github: string };
  seo: { title: L2; description: L2 };
}

export const LIMITS = {
  /** Tamano maximo del documento (JSON) en caracteres. */
  maxDoc: 120_000,
  maxImageBytes: 450_000,
  maxProjects: 24,
  maxSteps: 8,
  maxPoints: 8,
  maxTags: 12,
} as const;

export const IMAGE_URL = /^\/api\/img\/[a-f0-9]{24}$/;

export type Validation = { ok: true; value: Content } | { ok: false; error: string };

type Obj = Record<string, unknown>;

class Invalid extends Error {}

function fail(path: string, why: string): never {
  throw new Invalid(`${path}: ${why}`);
}

function obj(v: unknown, path: string): Obj {
  if (typeof v !== "object" || v === null || Array.isArray(v)) fail(path, "debe ser un objeto");
  return v as Obj;
}

function str(v: unknown, path: string, max: number, min = 0): string {
  if (typeof v !== "string") fail(path, "debe ser texto");
  const s = v.trim();
  if (s.length < min) fail(path, min === 1 ? "no puede quedar vacio" : `minimo ${min} caracteres`);
  if (s.length > max) fail(path, `maximo ${max} caracteres`);
  return s;
}

function l2(v: unknown, path: string, max: number, min = 0): L2 {
  const o = obj(v, path);
  return { es: str(o.es, `${path}.es`, max, min), en: str(o.en, `${path}.en`, max, min) };
}

function bool(v: unknown, path: string): boolean {
  if (typeof v !== "boolean") fail(path, "debe ser verdadero o falso");
  return v;
}

function httpsUrl(v: unknown, path: string): string {
  const s = str(v, path, 300, 1);
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return fail(path, "no es una direccion valida");
  }
  if (u.protocol !== "https:") fail(path, "debe empezar con https://");
  return u.toString().replace(/\/$/, s.endsWith("/") ? "/" : "");
}

/** Valida un documento completo. Devuelve una copia limpia (sin campos de mas) o el primer error. */
export function validateContent(input: unknown): Validation {
  try {
    if (JSON.stringify(input).length > LIMITS.maxDoc) fail("contenido", "es demasiado grande");
    const c = obj(input, "contenido");
    if (c.v !== 1) fail("v", "version no soportada");

    const hero = obj(c.hero, "hero");
    const av = obj(c.availability, "availability");
    const sec = obj(c.sections, "sections");
    const contact = obj(c.contact, "contact");
    const seo = obj(c.seo, "seo");

    if (!Array.isArray(c.steps) || c.steps.length < 1 || c.steps.length > LIMITS.maxSteps)
      fail("steps", `debe tener de 1 a ${LIMITS.maxSteps} pasos`);
    if (!Array.isArray(c.projects) || c.projects.length < 1 || c.projects.length > LIMITS.maxProjects)
      fail("projects", `debe tener de 1 a ${LIMITS.maxProjects} proyectos`);

    const seen = new Set<string>();
    const projects: ContentProject[] = c.projects.map((raw, i) => {
      const p = obj(raw, `projects[${i}]`);
      const id = str(p.id, `projects[${i}].id`, 30, 2);
      if (!/^[a-z0-9-]+$/.test(id)) fail(`projects[${i}].id`, "solo minusculas, numeros y guiones");
      if (seen.has(id)) fail(`projects[${i}].id`, `repetido (${id})`);
      seen.add(id);
      const category = p.category;
      if (typeof category !== "string" || !(CATEGORY_IDS as readonly string[]).includes(category))
        fail(`projects[${i}].category`, "categoria no valida");
      if (!Array.isArray(p.tags) || p.tags.length > LIMITS.maxTags) fail(`projects[${i}].tags`, `maximo ${LIMITS.maxTags} etiquetas`);
      const image = p.image === null || p.image === undefined ? null : str(p.image, `projects[${i}].image`, 60, 1);
      if (image !== null && !IMAGE_URL.test(image)) fail(`projects[${i}].image`, "imagen no valida");
      const icon = p.icon === null || p.icon === undefined ? null : str(p.icon, `projects[${i}].icon`, 60, 1);
      if (icon !== null && !IMAGE_URL.test(icon)) fail(`projects[${i}].icon`, "icono no valido");
      return {
        id,
        name: str(p.name, `projects[${i}].name`, 60, 1),
        url: httpsUrl(p.url, `projects[${i}].url`),
        category: category as CategoryId,
        hidden: bool(p.hidden, `projects[${i}].hidden`),
        tags: (p.tags as unknown[]).map((t, k) => str(t, `projects[${i}].tags[${k}]`, 30, 1)),
        desc: l2(p.desc, `projects[${i}].desc`, 700, 1),
        role: l2(p.role, `projects[${i}].role`, 700, 1),
        image,
        icon,
      };
    });

    // Los documentos guardados antes de existir esta seccion no la traen: se usa la de origen (apagada).
    const ab = c.about === undefined ? null : obj(c.about, "about");
    const photo = ab && ab.photo !== null && ab.photo !== undefined ? str(ab.photo, "about.photo", 60, 1) : null;
    if (photo !== null && !IMAGE_URL.test(photo)) fail("about.photo", "foto no valida");
    const linkedin = ab && typeof ab.linkedin === "string" && ab.linkedin.trim() !== "" ? httpsUrl(ab.linkedin, "about.linkedin") : "";
    if (linkedin && !/^https:\/\/([a-z0-9-]+\.)?linkedin\.com\//i.test(linkedin)) fail("about.linkedin", "debe ser una direccion de linkedin.com");
    const about: ContentAbout = ab
      ? {
          enabled: bool(ab.enabled, "about.enabled"),
          title: l2(ab.title, "about.title", 80, 1),
          role: l2(ab.role, "about.role", 120),
          text: l2(ab.text, "about.text", 1500, 1),
          photo,
          linkedin,
        }
      : DEFAULT_ABOUT;

    // Orden de secciones: los documentos viejos no lo traen y usan el de origen. Una seccion que falte se agrega al final;
    // una que no se conozca se ignora. «Sobre mi» sigue a la casilla vieja `about.enabled` mientras no haya orden guardado.
    const layout: LayoutEntry[] = [];
    if (c.layout === undefined) {
      for (const d of DEFAULT_LAYOUT) layout.push({ ...d, show: d.id === "sobre" ? about.enabled : d.show });
    } else {
      if (!Array.isArray(c.layout)) fail("layout", "debe ser una lista");
      const seenL = new Set<string>();
      c.layout.forEach((raw, i) => {
        const o = obj(raw, `layout[${i}]`);
        if (typeof o.id !== "string" || !(LAYOUT_IDS as readonly string[]).includes(o.id)) return;
        if (seenL.has(o.id)) fail(`layout[${i}].id`, `repetida (${o.id})`);
        seenL.add(o.id);
        layout.push({ id: o.id as LayoutId, show: bool(o.show, `layout[${i}].show`), menu: bool(o.menu, `layout[${i}].menu`) });
      });
      for (const d of DEFAULT_LAYOUT) if (!seenL.has(d.id)) layout.push({ ...d });
    }
    const aboutFinal: ContentAbout = { ...about, enabled: layout.find((e) => e.id === "sobre")!.show };

    const ex = c.experience === undefined ? null : obj(c.experience, "experience");
    let experience: ContentExperience = DEFAULT_EXPERIENCE;
    if (ex) {
      if (!Array.isArray(ex.points) || ex.points.length < 1 || ex.points.length > LIMITS.maxPoints)
        fail("experience.points", `debe tener de 1 a ${LIMITS.maxPoints} puntos`);
      experience = {
        title: l2(ex.title, "experience.title", 80, 1),
        intro: l2(ex.intro, "experience.intro", 600, 1),
        points: ex.points.map((raw, i) => l2(raw, `experience.points[${i}]`, 300, 1)),
      };
    }
    let years = DEFAULT_YEARS;
    if (c.years !== undefined) {
      if (typeof c.years !== "number" || !Number.isInteger(c.years) || c.years < 0 || c.years > 60) fail("years", "debe ser un numero entero de 0 a 60");
      years = c.years;
    }

    const email = str(contact.email, "contact.email", 120, 3);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("contact.email", "no es un correo valido");

    const value: Content = {
      v: 1,
      hero: {
        eyebrow: l2(hero.eyebrow, "hero.eyebrow", 120, 1),
        h1Before: l2(hero.h1Before, "hero.h1Before", 120),
        h1Em: l2(hero.h1Em, "hero.h1Em", 120),
        h1After: l2(hero.h1After, "hero.h1After", 120),
        lede: l2(hero.lede, "hero.lede", 400, 1),
      },
      availability: { enabled: bool(av.enabled, "availability.enabled"), text: l2(av.text, "availability.text", 80, 1) },
      sections: {
        projTitle: l2(sec.projTitle, "sections.projTitle", 80, 1),
        projSub: l2(sec.projSub, "sections.projSub", 300),
        howTitle: l2(sec.howTitle, "sections.howTitle", 80, 1),
        howSub: l2(sec.howSub, "sections.howSub", 300),
        ctTitle: l2(sec.ctTitle, "sections.ctTitle", 80, 1),
        ctText: l2(sec.ctText, "sections.ctText", 300),
      },
      steps: c.steps.map((raw, i) => {
        const s = obj(raw, `steps[${i}]`);
        return { title: l2(s.title, `steps[${i}].title`, 80, 1), text: l2(s.text, `steps[${i}].text`, 300, 1) };
      }),
      projects,
      about: aboutFinal,
      layout,
      experience,
      years,
      // GitHub es opcional: vacio = no se muestra el enlace (por ejemplo, si los repositorios son privados).
      contact: { email, github: typeof contact.github === "string" && contact.github.trim() !== "" ? httpsUrl(contact.github, "contact.github") : "" },
      seo: { title: l2(seo.title, "seo.title", 70, 1), description: l2(seo.description, "seo.description", 200, 1) },
    };
    return { ok: true, value };
  } catch (e) {
    if (e instanceof Invalid) return { ok: false, error: e.message };
    return { ok: false, error: "contenido no valido" };
  }
}

/** Cabecera de una imagen: devuelve su tipo si es PNG, JPEG o WEBP. */
export function sniffImage(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length > 12 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
    return "image/webp";
  return null;
}
