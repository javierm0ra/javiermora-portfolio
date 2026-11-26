import { PROJECTS } from "../data/projects";

export interface Item {
  key: string;
  count: number;
}

export interface Stats {
  admin: string;
  range: { days: number; from: string; to: string };
  realtime: number;
  totals: { views: number; visitors: number; projectClicks: number; contacts: number };
  daily: { day: string; views: number; visitors: number }[];
  projects: Item[];
  sources: Item[];
  countries: Item[];
  devices: Item[];
  languages: Item[];
  funnel: Item[];
}

const nf = new Intl.NumberFormat("es-MX");
export const num = (n: number) => nf.format(n);

export function pct(part: number, whole: number): string {
  if (whole <= 0) return "0 %";
  const v = (part / whole) * 100;
  return `${v >= 10 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)} %`;
}

/** Tope "redondo" para el eje: 1, 2, 5 x 10^k. */
export function niceMax(max: number): number {
  if (max <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  for (const m of [1, 2, 4, 5, 10]) if (m * pow >= max) return m * pow;
  return 10 * pow;
}

export function shortDay(day: string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`)).replace(".", "");
}

const DEVICES: Record<string, string> = { mobile: "Celular", tablet: "Tableta", desktop: "Computadora" };
const LANGS: Record<string, string> = { es: "Español", en: "Inglés" };

export const labelDevice = (k: string) => DEVICES[k] ?? k;
export const labelLang = (k: string) => LANGS[k] ?? k;
export const labelProject = (k: string) => PROJECTS.find((p) => p.id === k)?.name ?? k;

export function labelSource(k: string): string {
  if (k === "directo") return "Directo (sin sitio de origen)";
  if (k.startsWith("utm:")) return `${k.slice(4)} (enlace marcado)`;
  return k;
}

let regions: Intl.DisplayNames | null = null;
export function labelCountry(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return code === "desconocido" ? "Desconocido" : code;
  try {
    regions ??= new Intl.DisplayNames(["es"], { type: "region" });
    return regions.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
