import type { Lang, Strings } from "../data/i18n";

export const SECTION_IDS = ["proyectos", "metodo", "contacto"] as const;

interface Props {
  lang: Lang;
  t: Strings;
  setLang: (l: Lang) => void;
  active: string | null;
  scrolled: boolean;
}

export function Nav({ lang, t, setLang, active, scrolled }: Props) {
  const links: [string, string][] = [
    ["proyectos", t.projTitle],
    ["metodo", t.howTitle],
    ["contacto", t.ctTitle],
  ];
  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="gut navin">
        <div className="wrap navrow">
          <a className="brand" href="#top" aria-label="Javier Mora">
            <span className="logo">JM</span>Javier Mora
          </a>
          <nav className="links" aria-label={t.navLabel}>
            {links.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <div className="lang" role="group" aria-label={t.langLabel}>
            <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")}>
              ES
            </button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
