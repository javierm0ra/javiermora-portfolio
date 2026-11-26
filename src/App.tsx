import { useEffect, useRef, useState } from "react";
import { ScreenFrame } from "./components/ScreenFrame";
import { desktopScreen } from "./data/projects";
import { useSite } from "./data/SiteContext";
import { Method } from "./components/Method";
import { Nav, SECTION_IDS } from "./components/Nav";
import { ProjectsSection } from "./components/ProjectsSection";
import { Reveal } from "./components/Reveal";
import { Stats } from "./components/Stats";
import { useActiveSection } from "./hooks/useActiveSection";
import { useHeroParallax } from "./hooks/useHeroParallax";
import { useLang } from "./hooks/useLang";
import { useScrollChrome } from "./hooks/useScrollChrome";
import { track, trackView } from "./lib/track";

export default function App() {
  const { lang, t, setLang } = useLang();
  const { content } = useSite();
  const EMAIL = content.contact.email;
  const GITHUB = content.contact.github;
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const scrolled = useScrollChrome(barRef);
  const active = useActiveSection(SECTION_IDS);
  useHeroParallax(heroRef);
  useEffect(() => trackView(), []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      track("contact_copy");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles: el correo sigue visible y con enlace mailto.
    }
  }

  return (
    <>
      <div className="progress" aria-hidden="true">
        <span ref={barRef} />
      </div>
      <Nav lang={lang} t={t} setLang={setLang} active={active} scrolled={scrolled} />

      <div className="heroBand gut" id="top" ref={heroRef}>
        <div className="wrap">
          <div className="hero">
            <div>
              <p className="eyebrow rise" style={{ "--d": "0ms" } as React.CSSProperties}>
                {t.eyebrow}
              </p>
              <h1 className="rise" style={{ "--d": "90ms" } as React.CSSProperties}>
                {t.h1.before}
                {t.h1.em && (
                  <>
                    {" "}
                    <em>{t.h1.em}</em>
                  </>
                )}
                {t.h1.after}
              </h1>
              <p className="lede rise" style={{ "--d": "180ms" } as React.CSSProperties}>
                {t.lede}
              </p>
              <div className="cta rise" style={{ "--d": "270ms" } as React.CSSProperties}>
                <a className="btn primary" href="#proyectos">
                  {t.cta1}
                </a>
                <a className="btn" href="#contacto">
                  {t.cta2}
                </a>
              </div>
              {content.availability.enabled && (
                <p className="avail rise" style={{ "--d": "340ms" } as React.CSSProperties}>
                  <i aria-hidden="true" />
                  {content.availability.text[lang]}
                </p>
              )}
            </div>
            <div className="stack" aria-hidden="true">
              <div className="win w1" style={{ "--d": "250ms" } as React.CSSProperties}>
                <ScreenFrame screen={desktopScreen("kasanode")} label="KasaNode" eager />
              </div>
              <div className="win w2" style={{ "--d": "380ms" } as React.CSSProperties}>
                <ScreenFrame screen={desktopScreen("stabily")} label="Stabily" eager />
              </div>
              <div className="win w3" style={{ "--d": "510ms" } as React.CSSProperties}>
                <ScreenFrame screen={desktopScreen("kondonode")} label="KondoNode" eager />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="gut">
          <div className="wrap">
            <Stats t={t} />
            <ProjectsSection lang={lang} t={t} />
          </div>
        </div>

        <Method t={t} />

        {content.about.enabled && (
          <div className="gut">
            <div className="wrap">
              <Reveal className="about-wrap">
                <section className="about" id="sobre-mi">
                  <div className="photo" aria-hidden={content.about.photo ? undefined : true}>
                    {content.about.photo ? <img src={content.about.photo} alt={`Javier Mora`} decoding="async" /> : "JM"}
                  </div>
                  <div>
                    <h2>{content.about.title[lang]}</h2>
                    {content.about.role[lang] && <p className="arole">{content.about.role[lang]}</p>}
                    <p className="atext">{content.about.text[lang]}</p>
                    {content.about.linkedin && (
                      <a className="alink" href={content.about.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => track("linkedin_click")}>
                        LinkedIn ↗
                      </a>
                    )}
                  </div>
                </section>
              </Reveal>
            </div>
          </div>
        )}

        <div className="gut">
          <div className="wrap">
            <Reveal className="contact-wrap">
              <section className="contact" id="contacto">
                <div>
                  <h2>{t.ctTitle}</h2>
                  <p>{t.ctText}</p>
                </div>
                <div className="contact-links">
                  <a className="mail" href={`mailto:${EMAIL}`} onClick={() => track("contact_mail")}>
                    {EMAIL}
                  </a>
                  <div className="contact-actions">
                    <button type="button" className="copy" onClick={copyEmail}>
                      {copied ? t.copied : t.copy}
                    </button>
                    <a className="link" href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={() => track("github_click")}>
                      {GITHUB.replace(/^https:\/\//, "")} ↗
                    </a>
                  </div>
                </div>
              </section>
            </Reveal>
            <footer>
              © {new Date().getFullYear()} {t.foot}
              <span className="privacy">{t.privacy}</span>
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}
