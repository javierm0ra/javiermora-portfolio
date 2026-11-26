import type { Category, Lang } from "./i18n";
import screensManifest from "./screens.json";

export type ProjectId = "stabily" | "kasanode" | "kondonode" | "parilink" | "medicatio" | "ahinosvemos";

/** Pantalla simulada (documento estatico en public/screens, generado por scripts/render-screens.mjs). */
export interface Screen {
  file: string;
  kind: "desktop" | "phone";
  w: number;
  h: number;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  status: "prod";
  category: Category;
  tags: string[];
  screens: Screen[];
  /** Imagen propia (subida desde el panel); si existe, reemplaza las pantallas simuladas. */
  image: string | null;
  copy: Record<Lang, { desc: string; role: string }>;
}

const SCREENS = screensManifest as Record<ProjectId, Screen[]>;

// Para agregar un proyecto: suma un objeto aqui y su ilustracion en components/Illustration.tsx.
export const PROJECTS: Project[] = [
  {
    id: "stabily",
    name: "Stabily",
    url: "https://stabily.app",
    status: "prod",
    category: "finance",
    tags: ["React", "TypeScript", "Supabase", "Tailwind"],
    screens: SCREENS.stabily,
    image: null,
    copy: {
      es: {
        desc: "Finanzas personales hechas en México: presupuesto quincenal, tarjetas, cuentas, créditos y gastos compartidos.",
        role: "Reglas de presupuesto por quincena, conciliación bancaria y los planes de precio.",
      },
      en: {
        desc: "Personal finance built for Mexico: biweekly budget, cards, accounts, loans and shared expenses.",
        role: "Biweekly budget rules, bank reconciliation and the pricing plans.",
      },
    },
  },
  {
    id: "kasanode",
    name: "KasaNode",
    url: "https://kasanode.app",
    status: "prod",
    category: "realestate",
    tags: ["React", "Supabase", "WhatsApp API", "EasyBroker"],
    screens: SCREENS.kasanode,
    image: null,
    copy: {
      es: {
        desc: "Administración inmobiliaria para agencias: propiedades, contratos, comisiones y portal público con dominio propio.",
        role: "Ciclo de contratos de renta y venta, reglas de comisiones y el modelo multi-agencia.",
      },
      en: {
        desc: "Real estate management for agencies: properties, contracts, commissions and a public portal on the agency's own domain.",
        role: "Rent and sale contract lifecycle, commission rules and the multi-agency model.",
      },
    },
  },
  {
    id: "kondonode",
    name: "KondoNode",
    url: "https://kondonode.app",
    status: "prod",
    category: "realestate",
    tags: ["TanStack Start", "Supabase", "Tailwind"],
    screens: SCREENS.kondonode,
    image: null,
    copy: {
      es: {
        desc: "Cotos y condominios con transparencia total: cuotas, gastos con comprobante, caseta de vigilancia y paquetería.",
        role: "Principios de transparencia, bitácora inmutable y privacidad entre vecinos.",
      },
      en: {
        desc: "Gated communities and condos with full transparency: fees, receipted expenses, gatehouse and package handling.",
        role: "Transparency principles, an immutable log and privacy between neighbors.",
      },
    },
  },
  {
    id: "parilink",
    name: "Parilink",
    url: "https://parilink.app",
    status: "prod",
    category: "events",
    tags: ["TanStack Start", "Stripe", "Supabase", "Cloudflare"],
    screens: SCREENS.parilink,
    image: null,
    copy: {
      es: {
        desc: "Invitaciones digitales para bodas, XV años, bautizos y más, con pago en línea.",
        role: "Catálogo de diseños, asistente de creación de 7 pasos y planes desde $149 MXN.",
      },
      en: {
        desc: "Digital invitations for weddings, quinceañeras, baptisms and more, with online payment.",
        role: "Design catalog, a 7-step creation wizard and plans from $149 MXN.",
      },
    },
  },
  {
    id: "medicatio",
    name: "Medicatio",
    url: "https://medicatio.app",
    status: "prod",
    category: "health",
    tags: ["React", "Supabase", "Tailwind", "shadcn/ui"],
    screens: SCREENS.medicatio,
    image: null,
    copy: {
      es: {
        desc: "Gestión de clínicas médicas: agenda, expedientes, cobros, facturación y WhatsApp en una sola plataforma.",
        role: "Flujo de alta de clínica, roles por organización y sistema de soporte con tickets.",
      },
      en: {
        desc: "Medical clinic management: scheduling, records, payments, invoicing and WhatsApp in one platform.",
        role: "Clinic onboarding flow, organization roles and a ticket-based support system.",
      },
    },
  },
  {
    id: "ahinosvemos",
    name: "Ahí Nos Vemos",
    url: "https://ahinosvemos.pages.dev",
    status: "prod",
    category: "events",
    tags: ["React", "Supabase", "Leaflet", "Cloudflare"],
    screens: SCREENS.ahinosvemos,
    image: null,
    copy: {
      es: {
        desc: "PWA que calcula el punto de reunión más justo entre 2 y 10 personas y sugiere lugares cercanos.",
        role: "Flujo sin instalar nada: crear, compartir por WhatsApp, cada quien comparte su ubicación.",
      },
      en: {
        desc: "PWA that finds the fairest meeting point for 2 to 10 people and suggests nearby places.",
        role: "A no-install flow: create, share on WhatsApp, everyone shares their location.",
      },
    },
  },
];

/** Primera pantalla de escritorio de un proyecto (la usa el hero). */
export function desktopScreen(id: ProjectId): Screen {
  const found = PROJECTS.find((p) => p.id === id)?.screens.find((x) => x.kind === "desktop");
  if (!found) throw new Error(`El proyecto ${id} no tiene pantalla de escritorio`);
  return found;
}
