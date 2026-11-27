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
  status: "prod" | "business";
  category: Category;
  tags: string[];
  screens: Screen[];
  /** Imagen propia (subida desde el panel); si existe, reemplaza las pantallas simuladas. */
  image: string | null;
  /** Icono de la app (subido o incluido en el sitio); null = inicial. */
  icon?: string | null;
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
    tags: ["React", "TypeScript", "Supabase", "Tailwind", "Stripe", "API de Banxico", "Web Push"],
    screens: SCREENS.stabily,
    image: null,
    copy: {
      es: {
        desc: "Finanzas personales para México: presupuesto por quincena, cuentas bancarias, tarjetas de crédito y créditos en un solo lugar. Incluye gastos compartidos con otras personas, estados financieros y balance, retos y logros que ayudan a crear el hábito, y un modo para micronegocios con punto de venta.",
        role: "Las reglas del presupuesto por quincena, cómo se concilian los movimientos bancarios y las transferencias entre cuentas, las categorías compartidas entre banco y tarjeta, qué módulos incluye cada plan y su precio, y qué cuenta como gasto, ingreso o transferencia para que los reportes siempre cuadren.",
      },
      en: {
        desc: "Personal finance built for Mexico: biweekly budgeting, bank accounts, credit cards and loans in one place. Includes shared expenses with other people, financial statements and a balance sheet, challenges and achievements that help build the habit, and a small-business mode with point of sale.",
        role: "The biweekly budget rules, how bank movements and transfers between accounts are reconciled, shared categories across bank and card, which modules each plan includes and its price, and what counts as an expense, income or transfer so reports always add up.",
      },
    },
  },
  {
    id: "kasanode",
    name: "KasaNode",
    url: "https://kasanode.app",
    status: "prod",
    category: "realestate",
    tags: ["React", "Supabase", "WhatsApp Business API", "EasyBroker", "Google Maps", "Google Calendar y Drive", "API de Banxico (INPC)", "Stripe y Conekta", "Resend"],
    screens: SCREENS.kasanode,
    image: null,
    copy: {
      es: {
        desc: "Plataforma multi-agencia para inmobiliarias mexicanas: propiedades, contratos de renta y venta con renovaciones, comisiones, apartados y documentos desde plantillas. Gestiona los leads en un tablero por estatus, con seguimientos y citas, y los recibe desde el portal público de cada agencia, con dominio propio, y desde EasyBroker. Se conecta también con WhatsApp Business.",
        role: "El ciclo de vida de los contratos (vigente, por vencer, vencido; una renovación es un contrato nuevo), el devengo de la renta, la custodia del depósito en garantía por el propietario, las comisiones de hasta dos agentes, que las paga el propietario, y el modelo multi-agencia con datos aislados por cliente.",
      },
      en: {
        desc: "Multi-tenant platform for Mexican real estate agencies: listings, rental and sale contracts with renewals, commissions, deposits and documents from templates. Manages leads on a status board, with follow-ups and appointments, and receives them from each agency's public portal, on its own domain, and from EasyBroker. Also connects to WhatsApp Business.",
        role: "The contract lifecycle (active, expiring, expired; a renewal is a new contract), rent accrual, owner custody of the security deposit, commissions for up to two agents paid by the owner, and the multi-agency model with data isolated per client.",
      },
    },
  },
  {
    id: "kondonode",
    name: "KondoNode",
    url: "https://kondonode.app",
    status: "prod",
    category: "realestate",
    tags: ["TanStack Start", "Supabase", "Tailwind", "Web Push", "Códigos QR", "Exportación a Excel"],
    screens: SCREENS.kondonode,
    image: null,
    copy: {
      es: {
        desc: "Administración de cotos y condominios basada en la transparencia: cuotas automáticas con recargos, gastos con aprobación del consejo, fondos y cuentas que cuadran, cierre de mes con reporte, votación de proyectos y comunicados con acuse. La caseta suma pases con QR, visitas avisadas al residente y paquetería con firma.",
        role: "Los principios del producto: nada se borra, se cancela con motivo; bitácora de solo inserción; privacidad entre vecinos, porque nadie ve adeudos ajenos. También quién aprueba qué (presidente, secretario, tesorero), cómo se votan los proyectos y cómo se cierra el mes, y que la vigilancia nunca vea datos personales de los residentes.",
      },
      en: {
        desc: "Transparency-first management for gated communities and condos: automatic dues with late charges, board-approved expenses, funds and accounts that reconcile, month-end close with a report, project voting and announcements with read receipts. The guard booth adds QR passes, visitors announced to residents and parcel tracking with signature.",
        role: "The product principles: nothing is deleted, it is cancelled with a reason; an insert-only audit log; privacy between neighbors, since nobody sees another home's debts. Also who approves what (president, secretary, treasurer), how projects are voted and how the month is closed, and that guards never see residents' personal data.",
      },
    },
  },
  {
    id: "parilink",
    name: "Parilink",
    url: "https://parilink.app",
    status: "prod",
    category: "events",
    tags: ["TanStack Start", "Stripe", "Supabase", "Cloudflare", "Google Maps", "Códigos QR"],
    screens: SCREENS.parilink,
    image: null,
    copy: {
      es: {
        desc: "Invitaciones digitales para bodas, XV años, cumpleaños, bautizos y más: eliges un diseño del catálogo, lo personalizas en un asistente de 7 pasos con tus textos, fechas y avisos, pagas en línea con Stripe y compartes tu invitación con un enlace propio.",
        role: "El catálogo de diseños y cómo se arman sus imágenes, el asistente de creación de 7 pasos, tres planes de pago con Stripe, el acceso solo por invitación y la activación sin pago cuando un código promocional cubre el 100 %.",
      },
      en: {
        desc: "Digital invitations for weddings, quinceañeras, birthdays, baptisms and more: pick a design from the catalog, customize it in a 7-step wizard with your text, dates and notices, pay online with Stripe and share your invitation with its own link.",
        role: "The design catalog and how its images are assembled, the 7-step creation wizard, three paid plans via Stripe, invite-only access, and free activation when a promo code covers 100%.",
      },
    },
  },
  {
    id: "medicatio",
    name: "Medicatio",
    url: "https://medicatio.app",
    status: "prod",
    category: "health",
    tags: ["React", "Supabase", "Tailwind", "shadcn/ui", "WhatsApp Business API", "Stripe", "Google Calendar y Outlook", "Mifiel y DocuSign", "Resend", "Web Push"],
    screens: SCREENS.medicatio,
    image: null,
    copy: {
      es: {
        desc: "Gestión de clínicas con varias marcas y sucursales: agenda sincronizada con Google Calendar y Outlook, expedientes y consultas, recetas, consentimientos con firma, cobros y corte de caja, inventario y mensajes por WhatsApp Business. El equipo se organiza por roles, con soporte por tickets.",
        role: "El flujo de alta de una clínica (marca, sucursal y primer médico), los roles por organización, las reglas para asignar médicos a sucursales, cómo se capturan consentimientos y recetas, y el sistema de soporte con tickets y adjuntos privados.",
      },
      en: {
        desc: "Management for multi-brand, multi-branch clinics: scheduling synced with Google Calendar and Outlook, records and consultations, prescriptions, signed consents, payments and cash close, inventory and WhatsApp Business messaging. The team is organized by roles, with ticket-based support.",
        role: "The clinic onboarding flow (brand, branch and first doctor), organization roles, the rules for assigning doctors to branches, how consents and prescriptions are captured, and the ticket-based support system with private attachments.",
      },
    },
  },
  {
    id: "ahinosvemos",
    name: "Ahí Nos Vemos",
    url: "https://ahinosvemos.pages.dev",
    status: "prod",
    category: "events",
    tags: ["React", "Supabase", "Leaflet", "Cloudflare", "OpenRouteService", "OpenStreetMap (Overpass)", "Cloudflare Turnstile"],
    screens: SCREENS.ahinosvemos,
    image: null,
    copy: {
      es: {
        desc: "PWA que encuentra el punto de reunión más justo para 2 a 10 personas, sin registro ni instalación. Cada quien comparte su ubicación y la app sugiere lugares cercanos (bares, cafés, plazas, parques, cines), ordenados por qué tan parejo queda el traslado para todos. Incluye un modo compraventa con puntos seguros.",
        role: "El flujo completo sin registro ni instalación y las reglas de privacidad: la ubicación se borra al vencer la reunión, en modo compraventa no se muestran las ubicaciones de los demás y el punto de encuentro se difumina unos 500 m para que no se deduzca dónde está la otra persona.",
      },
      en: {
        desc: "A PWA that finds the fairest meeting point for 2 to 10 people, with no sign-up or install. Everyone shares their location and the app suggests nearby places (bars, cafés, malls, parks, cinemas), ranked by how evenly the trip splits. Includes a buy-and-sell mode with safe meeting spots.",
        role: "The full flow with no sign-up or install, and the privacy rules: location is deleted when the meeting expires, in buy-and-sell mode others' locations are never shown, and the meeting point is blurred by about 500 m so nobody can work out where the other person is.",
      },
    },
  },
  {
    id: "kupina",
    name: "Kupina",
    url: "https://kupina.com.mx",
    status: "business",
    category: "marketing",
    tags: ["Video", "Podcast", "Newsletter"],
    screens: [],
    image: null,
    copy: {
      es: {
        desc: "Pequeña agencia de marketing digital que fundé y opero hasta hoy. He atendido a cerca de 20 clientes y mantengo relaciones de más de 10 años. Genero contenido de todo tipo: imágenes, video, boletines informativos y, desde hace poco, podcast.",
        role: "El nombre y la marca (una mora, por mi apellido), el servicio de contenido y la relación a largo plazo con cada cliente.",
      },
      en: {
        desc: "A small digital marketing agency I founded and still run. I have served about 20 clients and keep relationships going for more than 10 years. I produce content of all kinds: images, video, newsletters and, more recently, podcasts.",
        role: "The name and brand (a blackberry, after my surname), the content service and the long-term relationship with each client.",
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
