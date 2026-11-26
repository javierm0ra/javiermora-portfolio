export type Lang = "es" | "en";
export type Category = "finance" | "realestate" | "health" | "events";
export type Filter = "all" | Category;

export interface Strings {
  docTitle: string;
  eyebrow: string;
  h1: { before: string; em: string; after: string };
  lede: string;
  cta1: string;
  cta2: string;
  projTitle: string;
  projSub: string;
  role: string;
  visit: string;
  status: { prod: string };
  howTitle: string;
  howSub: string;
  steps: { title: string; text: string }[];
  ctTitle: string;
  ctText: string;
  copy: string;
  copied: string;
  foot: string;
  langLabel: string;
  fictional: string;
  privacy: string;
  navLabel: string;
  filterLabel: string;
  filters: Record<Filter, string>;
  stats: { years: string; products: string; sectors: string };
}

export const STRINGS: Record<Lang, Strings> = {
  es: {
    docTitle: "Javier Mora · Product owner",
    eyebrow: "Product owner · Fintech · Guadalajara, México",
    h1: { before: "Product owner que construye productos de ", em: "software con IA", after: "." },
    lede: "Más de 13 años en plataformas de crédito para SOFOMES y fintechs. Defino el producto y las reglas de negocio, construyo con herramientas de IA y audito cada cambio.",
    cta1: "Ver proyectos",
    cta2: "Contacto",
    projTitle: "Proyectos",
    projSub: "Seis productos para México, desde finanzas personales hasta administración de clínicas e inmuebles.",
    role: "Lo que definí",
    visit: "Ver proyecto ↗",
    status: { prod: "En producción" },
    howTitle: "Cómo trabajo",
    howSub: "Un flujo corto y repetible, para que la IA acelere sin perder el control del producto.",
    steps: [
      { title: "Definir el producto", text: "Entiendo el problema y defino el alcance y las reglas de negocio antes de construir." },
      { title: "Planear y aprobar", text: "Armo el plan, comparo alternativas y lo apruebo. Nada se construye sin mi visto bueno." },
      { title: "Construir con IA", text: "Dirijo a la IA con instrucciones precisas, en cambios pequeños y de uno en uno." },
      { title: "Verificar", text: "Reviso el diff completo, corro build y pruebas, y limpio los datos afectados." },
    ],
    ctTitle: "Hablemos",
    ctText: "¿Quieres platicar de producto, crédito o IA aplicada? Escríbeme.",
    copy: "Copiar correo",
    copied: "Copiado",
    foot: "Javier Mora. Todos los derechos reservados.",
    langLabel: "Idioma",
    fictional: "Datos ficticios",
    privacy: "Este sitio cuenta visitas sin cookies ni datos personales.",
    navLabel: "Secciones",
    filterLabel: "Filtrar proyectos por sector",
    filters: { all: "Todos", finance: "Finanzas", realestate: "Inmuebles", health: "Salud", events: "Eventos" },
    stats: { years: "Años de experiencia", products: "Productos propios", sectors: "Sectores" },
  },
  en: {
    docTitle: "Javier Mora · Product owner",
    eyebrow: "Product owner · Fintech · Guadalajara, Mexico",
    h1: { before: "Product owner who ships ", em: "software with AI", after: "." },
    lede: "13+ years in lending platforms for Mexican non-bank lenders (SOFOMES) and fintechs. I define the product and its business rules, build with AI tools and audit every change.",
    cta1: "See projects",
    cta2: "Contact",
    projTitle: "Projects",
    projSub: "Six products for Mexico, from personal finance to clinic and real estate management.",
    role: "What I defined",
    visit: "View project ↗",
    status: { prod: "Live" },
    howTitle: "How I work",
    howSub: "A short, repeatable flow so AI speeds things up without losing control of the product.",
    steps: [
      { title: "Define the product", text: "I understand the problem and define scope and business rules before anything gets built." },
      { title: "Plan and approve", text: "I draft the plan, weigh alternatives and approve it. Nothing gets built without my sign-off." },
      { title: "Build with AI", text: "I direct the AI with precise instructions, in small changes, one at a time." },
      { title: "Verify", text: "I review the full diff, run build and tests, and clean up affected data." },
    ],
    ctTitle: "Let's talk",
    ctText: "Want to talk product, lending or applied AI? Drop me a line.",
    copy: "Copy email",
    copied: "Copied",
    foot: "Javier Mora. All rights reserved.",
    langLabel: "Language",
    fictional: "Sample data",
    privacy: "This site counts visits without cookies or personal data.",
    navLabel: "Sections",
    filterLabel: "Filter projects by sector",
    filters: { all: "All", finance: "Finance", realestate: "Real estate", health: "Health", events: "Events" },
    stats: { years: "Years of experience", products: "Products built", sectors: "Industries" },
  },
};
