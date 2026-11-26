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
        desc: "Finanzas personales hechas para México. Planeas tu presupuesto por quincena y llevas en un solo lugar tus cuentas bancarias, tarjetas de crédito y créditos personales. Divides gastos compartidos con otras personas y revisas tus estados financieros y tu balance. Incluye un modo para micronegocios con punto de venta, retos y logros que ayudan a crear el hábito, e importación y exportación de tus datos.",
        role: "Las reglas del presupuesto por quincena, cómo se concilian los movimientos bancarios y las transferencias entre cuentas, las categorías compartidas entre banco y tarjeta, qué módulos incluye cada plan y su precio, y qué cuenta como gasto, ingreso o transferencia para que los reportes siempre cuadren.",
      },
      en: {
        desc: "Personal finance built for Mexico. Plan your budget by pay period and keep bank accounts, credit cards and personal loans in one place. Split shared expenses with other people and review your financial statements and balance sheet. Includes a micro-business mode with point of sale, challenges and achievements that build the habit, and data import and export.",
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
        desc: "Plataforma para agencias inmobiliarias mexicanas en la que cada agencia trabaja con sus datos aislados. Administra propiedades, personas y prospectos, contratos de renta y venta con folio, renovaciones, rentas devengadas, apartados y comisiones, y genera documentos desde plantillas. Incluye portal público con el dominio de la agencia, pantalla de recepción, WhatsApp Business, notificaciones push e integración con EasyBroker.",
        role: "El ciclo de vida de los contratos (vigente, por vencer, vencido; una renovación es un contrato nuevo), el devengo de la renta, la custodia del depósito en garantía por el propietario, las comisiones de hasta dos agentes, que las paga el propietario, y el modelo multi-agencia con datos aislados por cliente.",
      },
      en: {
        desc: "Platform for Mexican real estate agencies where each agency works with its own isolated data. It manages properties, people and leads, rent and sale contracts with folio numbers, renewals, accrued rent, deposits and commissions, and generates documents from templates. It includes a public portal on the agency's own domain, a reception screen, WhatsApp Business, push notifications and EasyBroker integration.",
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
        desc: "Plataforma para cotos y condominios en México basada en la transparencia: cada peso que entra o sale se ve con su comprobante. Cuotas con generación automática y recargos, gastos con aprobación del consejo, fondos y cuentas que deben cuadrar, cierre de mes con reporte, proyectos con cotizaciones y votación, comunicados con acuse, agenda de reservas y reuniones. La caseta tiene pases con QR, visitas avisadas al residente, paquetería con firma y turnos de guardias.",
        role: "Los principios del producto: nada se borra, se cancela con motivo; bitácora de solo inserción; privacidad entre vecinos, porque nadie ve adeudos ajenos. También quién aprueba qué (presidente, secretario, tesorero), cómo se votan los proyectos y cómo se cierra el mes, y que la vigilancia nunca vea datos personales de los residentes.",
      },
      en: {
        desc: "Platform for gated communities and condominiums in Mexico built on transparency: every peso in or out is visible with its receipt. Fees with automatic generation and late charges, expenses approved by the board, funds and accounts that must reconcile, month-end close with a report, projects with quotes and voting, announcements with read receipts, reservations and meetings. The gatehouse has QR passes, visitors announced to residents, package handling with signature and guard shifts.",
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
        desc: "Plataforma para crear invitaciones digitales de eventos en México: boda, XV años, cumpleaños infantil y de adulto, comunión, bautizo y baby shower. Eliges un diseño del catálogo, personalizas textos y fechas en un asistente de 7 pasos y compartes tu invitación con un enlace propio. Pagas en línea con Stripe, con soporte para códigos promocionales, y un panel de administración gestiona clientes, pagos y diseños.",
        role: "El catálogo de diseños y cómo se arman sus imágenes, el asistente de creación de 7 pasos, los dos planes (Básico $149 y Plus $249 MXN), el acceso solo por invitación y la activación sin pago cuando un código promocional cubre el 100 %.",
      },
      en: {
        desc: "Platform for creating digital invitations for events in Mexico: weddings, quinceañeras, kids' and adult birthdays, communions, baptisms and baby showers. Pick a design from the catalog, customize text and dates in a 7-step wizard and share your invitation with its own link. Pay online with Stripe, with promo code support, and an admin panel manages customers, payments and designs.",
        role: "The design catalog and how its images are built, the 7-step creation wizard, the two plans (Basic $149 and Plus $249 MXN), invitation-only access, and free activation when a promo code covers 100%.",
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
        desc: "Plataforma para clínicas médicas con varias marcas y sucursales. Reúne agenda, expedientes y consultas, recetas, consentimientos con firma, preconsulta y encuestas, seguimientos de pacientes, cobros y corte de caja, finanzas, inventario, productos y promociones, facturación y WhatsApp. Permite importar pacientes, da un portal al paciente, organiza al equipo por roles y ofrece soporte con tickets.",
        role: "El flujo de alta de una clínica (marca, sucursal y primer médico), los roles por organización, las reglas para asignar médicos a sucursales, cómo se capturan consentimientos y recetas, y el sistema de soporte con tickets y adjuntos privados.",
      },
      en: {
        desc: "Platform for medical clinics with multiple brands and branches. It brings together scheduling, records and consultations, prescriptions, signed consents, pre-consultation and surveys, patient follow-ups, payments and cash close, finances, inventory, products and promotions, invoicing and WhatsApp. It supports patient import, offers a patient portal, organizes the team by roles and provides ticket-based support.",
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
        desc: "PWA para encontrar el punto de reunión más justo entre 2 y 10 personas, sin instalar nada. Alguien crea la reunión y comparte un enlace por WhatsApp; cada quien comparte su ubicación y la app sugiere lugares cercanos (bares, restaurantes, cafés, plazas, parques, cines) ordenados por qué tan parejo le queda el traslado a todos, con el tiempo de cada persona. Un modo compraventa propone puntos seguros: tiendas 24 h, gasolineras, bancos y supermercados.",
        role: "El flujo completo sin registro ni instalación y las reglas de privacidad: la ubicación se borra al vencer la reunión, en modo compraventa no se muestran las ubicaciones de los demás y el punto de encuentro se difumina unos 500 m para que no se deduzca dónde está la otra persona.",
      },
      en: {
        desc: "PWA that finds the fairest meeting point for 2 to 10 people, with nothing to install. Someone creates the meeting and shares a link on WhatsApp; everyone shares their location and the app suggests nearby places (bars, restaurants, cafés, malls, parks, cinemas) ranked by how evenly the trip works for everyone, with each person's travel time. A buy-and-sell mode suggests safe spots: 24-hour stores, gas stations, banks and supermarkets.",
        role: "The full flow with no sign-up or install, and the privacy rules: location is deleted when the meeting expires, in buy-and-sell mode others' locations are never shown, and the meeting point is blurred by about 500 m so nobody can work out where the other person is.",
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
