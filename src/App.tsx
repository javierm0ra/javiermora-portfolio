import { useState } from "react";
import { Illustration } from "./components/Illustration";
import { ProjectCard } from "./components/ProjectCard";
import { PROJECTS } from "./data/projects";
import { useLang } from "./hooks/useLang";

const EMAIL = "javiermoramx@gmail.com";
const GITHUB = "https://github.com/javierm0ra";

export default function App() {
  const { lang, t, setLang } = useLang();
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles: el correo sigue visible y con enlace mailto.
    }
  }

  return (
    <>
      <div className="heroBand gut">
        <div className="wrap">
          <nav className="top">
            <span className="brand">
              <span className="logo">JM</span>Javier Mora
            </span>
            <div className="lang" role="group" aria-label={t.langLabel}>
              <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")}>
                ES
              </button>
              <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
            </div>
          </nav>
          <div className="hero">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>
                {t.h1.before}
                <em>{t.h1.em}</em>
                {t.h1.after}
              </h1>
              <p className="lede">{t.lede}</p>
              <div className="cta">
                <a className="btn primary" href="#proyectos">
                  {t.cta1}
                </a>
                <a className="btn" href="#contacto">
                  {t.cta2}
                </a>
              </div>
            </div>
            <div className="stack" aria-hidden="true">
              <div className="win w1">
                <Illustration id="kasanode" />
              </div>
              <div className="win w2">
                <Illustration id="stabily" />
              </div>
              <div className="win w3">
                <Illustration id="ahinosvemos" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="gut">
          <div className="wrap">
            <section className="sec" id="proyectos">
              <h2>{t.projTitle}</h2>
              <p className="sec-sub">{t.projSub}</p>
              <div className="grid">
                {PROJECTS.map((p) => (
                  <ProjectCard key={p.id} project={p} lang={lang} t={t} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="band gut" id="metodo">
          <div className="wrap">
            <h2>{t.howTitle}</h2>
            <p className="sec-sub">{t.howSub}</p>
            <ol className="steps">
              {t.steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="gut">
          <div className="wrap">
            <section className="contact" id="contacto">
              <div>
                <h2>{t.ctTitle}</h2>
                <p>{t.ctText}</p>
              </div>
              <div className="contact-links">
                <a className="mail" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
                <div className="contact-actions">
                  <button type="button" className="copy" onClick={copyEmail}>
                    {copied ? t.copied : t.copy}
                  </button>
                  <a className="link" href={GITHUB} target="_blank" rel="noopener noreferrer">
                    github.com/javierm0ra ↗
                  </a>
                </div>
              </div>
            </section>
            <footer>
              © {new Date().getFullYear()} {t.foot}
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}
