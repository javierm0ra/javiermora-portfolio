import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CATEGORY_IDS, validateContent, type CategoryId, type Content, type ContentProject, type L2 } from "../../shared/content";
import { defaultContent } from "../data/content";
import { STRINGS } from "../data/i18n";
import { explain, getJson, sendJson, uploadImage } from "./api";
import { compressImage } from "./image";

interface Payload {
  draft: Content | null;
  published: Content | null;
  updatedAt: number | null;
  publishedAt: number | null;
  unpublished: boolean;
}

type Busy = "" | "save" | "publish" | "discard" | "image";
type Msg = { kind: "ok" | "err"; text: string } | null;

const SECTOR_LABEL = STRINGS.es.filters;
const when = (ts: number) => new Date(ts * 1000).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

/** Convierte el error tecnico de la validacion en una frase que se entienda. */
function friendly(error: string, c: Content | null): string {
  const names: Record<string, string> = {
    name: "nombre",
    url: "dirección web",
    desc: "descripción",
    role: "«lo que definí»",
    tags: "etiquetas",
    category: "sector",
    title: "título",
    text: "texto",
    lede: "texto de presentación",
    email: "correo",
    github: "enlace de GitHub",
    linkedin: "enlace de LinkedIn",
    intro: "introducción",
    years: "años de experiencia",
    description: "descripción",
    id: "identificador",
  };
  return error
    .replace(/projects\[(\d+)\]/g, (_, n) => `Proyecto ${Number(n) + 1}${c?.projects[Number(n)]?.name ? ` (${c.projects[Number(n)]!.name})` : ""}`)
    .replace(/steps\[(\d+)\]/g, (_, n) => `Paso ${Number(n) + 1}`)
    .replace(/\.(name|url|desc|role|tags|category|title|text|lede|email|github|linkedin|description|id|intro)\b/g, (_, k: string) => ` → ${names[k]}`)
    .replace(/\.es\b/g, " (español)")
    .replace(/\.en\b/g, " (inglés)");
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; max?: number; multiline?: boolean; rows?: number; hint?: string; type?: string }) {
  const id = useId();
  const { label, value, onChange, max, multiline, rows = 3, hint, type = "text" } = props;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} rows={rows} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type={type} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      )}
      {(hint || max) && (
        <small>
          {hint}
          {max ? `${hint ? " · " : ""}${value.length}/${max}` : ""}
        </small>
      )}
    </div>
  );
}

function L2Field(props: { label: string; value: L2; onChange: (v: L2) => void; max?: number; multiline?: boolean; rows?: number; hint?: string }) {
  const { label, value, onChange, ...rest } = props;
  return (
    <fieldset className="l2">
      <legend>{label}</legend>
      <Field label="Español" value={value.es} onChange={(es) => onChange({ ...value, es })} {...rest} />
      <Field label="English" value={value.en} onChange={(en) => onChange({ ...value, en })} {...rest} />
    </fieldset>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="panel ed-panel">
      <h2>{title}</h2>
      {note && <p className="ed-note">{note}</p>}
      <div className="ed-body">{children}</div>
    </section>
  );
}

function ConfirmButton(props: { label: string; confirmLabel: string; onConfirm: () => void; danger?: boolean; disabled?: boolean }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" className={`btn-s${props.danger ? " danger" : ""}`} disabled={props.disabled} onClick={() => setAsking(true)}>
        {props.label}
      </button>
    );
  return (
    <span className="confirm" role="group" aria-label="Confirmar">
      <button type="button" className="btn-s danger" onClick={() => { setAsking(false); props.onConfirm(); }}>
        {props.confirmLabel}
      </button>
      <button type="button" className="btn-s" onClick={() => setAsking(false)}>
        Cancelar
      </button>
    </span>
  );
}

interface ProjectProps {
  project: ContentProject;
  index: number;
  total: number;
  busy: boolean;
  onChange: (p: ContentProject) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onImage: (file: File) => void;
  onIcon: (file: File) => void;
}

function ProjectEditor({ project: p, index, total, busy, onChange, onMove, onDelete, onImage, onIcon }: ProjectProps) {
  const file = useRef<HTMLInputElement>(null);
  const iconFile = useRef<HTMLInputElement>(null);
  const sector = useId();
  return (
    <article className={`proj-ed${p.hidden ? " is-hidden" : ""}`}>
      <header>
        <h3>
          <span className="num">{index + 1}</span> {p.name || "Sin nombre"}
          {p.hidden && <em className="badge-off">Oculto</em>}
        </h3>
        <div className="row-actions">
          <button type="button" className="btn-s" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Subir ${p.name}`}>
            ↑
          </button>
          <button type="button" className="btn-s" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Bajar ${p.name}`}>
            ↓
          </button>
          <button type="button" className="btn-s" onClick={() => onChange({ ...p, hidden: !p.hidden })}>
            {p.hidden ? "Mostrar" : "Ocultar"}
          </button>
          <ConfirmButton label="Eliminar" confirmLabel="Sí, eliminar" danger onConfirm={onDelete} />
        </div>
      </header>

      <div className="grid2">
        <Field label="Nombre" value={p.name} max={60} onChange={(name) => onChange({ ...p, name })} />
        <Field label="Dirección web" value={p.url} max={300} hint="Debe empezar con https://" onChange={(url) => onChange({ ...p, url })} />
        <div className="field">
          <label htmlFor={sector}>Sector</label>
          <select id={sector} value={p.category} onChange={(e) => onChange({ ...p, category: e.target.value as CategoryId })}>
            {CATEGORY_IDS.map((c) => (
              <option key={c} value={c}>
                {SECTOR_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Etiquetas"
          value={p.tags.join(", ")}
          hint="Separadas por comas (máximo 12)"
          onChange={(v) => onChange({ ...p, tags: v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12) })}
        />
      </div>
      <L2Field label="Descripción" value={p.desc} max={700} multiline rows={6} onChange={(desc) => onChange({ ...p, desc })} />
      <L2Field label="Lo que definí" value={p.role} max={700} multiline rows={5} onChange={(role) => onChange({ ...p, role })} />

      <div className="img-ed">
        <strong>Ícono de la app</strong>
        <p className="ed-note">Aparece junto al nombre, con esquinas redondeadas. Sin ícono propio se usa el que ya trae el sitio, o la inicial.</p>
        {p.icon && <img className="icon-prev" src={p.icon} alt={`Ícono de ${p.name}`} />}
        <div className="row-actions">
          <input
            ref={iconFile}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onIcon(f);
              e.target.value = "";
            }}
          />
          <button type="button" className="btn-s" disabled={busy} onClick={() => iconFile.current?.click()}>
            {p.icon ? "Cambiar ícono" : "Subir ícono"}
          </button>
          {p.icon && (
            <button type="button" className="btn-s" onClick={() => onChange({ ...p, icon: null })}>
              Quitar ícono
            </button>
          )}
        </div>
      </div>

      <div className="img-ed">
        <strong>Imagen</strong>
        {p.image ? (
          <img src={p.image} alt={`Imagen de ${p.name}`} />
        ) : (
          <p className="ed-note">Sin imagen propia: se usan las pantallas simuladas de la app (si el proyecto las tiene) o un recuadro con la inicial.</p>
        )}
        <div className="row-actions">
          <input
            ref={file}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImage(f);
              e.target.value = "";
            }}
          />
          <button type="button" className="btn-s" disabled={busy} onClick={() => file.current?.click()}>
            {p.image ? "Cambiar imagen" : "Subir imagen"}
          </button>
          {p.image && (
            <button type="button" className="btn-s" onClick={() => onChange({ ...p, image: null })}>
              Quitar imagen
            </button>
          )}
        </div>
        <small>Se reduce y comprime sola antes de subirla. Usa capturas sin datos reales de clientes ni de pacientes.</small>
      </div>
    </article>
  );
}

export default function Editor() {
  const [meta, setMeta] = useState<Pick<Payload, "updatedAt" | "publishedAt" | "unpublished"> & { hasPublished: boolean; hasDraft: boolean } | null>(null);
  const [draft, setDraft] = useState<Content | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>("");
  const [msg, setMsg] = useState<Msg>(null);
  const [loadedNote, setLoadedNote] = useState<string | null>(null);

  const apply = useCallback((d: Payload, resetDraft: boolean) => {
    setMeta({ updatedAt: d.updatedAt, publishedAt: d.publishedAt, unpublished: d.unpublished, hasPublished: d.published !== null, hasDraft: d.draft !== null });
    if (resetDraft) {
      const raw = d.draft ?? d.published ?? defaultContent();
      // Un borrador guardado antes de existir alguna seccion (por ejemplo Sobre mi) no la trae: se completa con la de origen.
      const checked = validateContent(raw);
      const base = checked.ok ? checked.value : raw;
      setDraft(base);
      setSavedJson(JSON.stringify(base));
    }
  }, []);

  useEffect(() => {
    void getJson<Payload>("/api/admin/content").then((r) => {
      if (r.ok) apply(r.data, true);
      else setLoadError(explain(r.error, r.status));
    });
  }, [apply]);

  const dirty = draft !== null && JSON.stringify(draft) !== savedJson;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const check = useMemo(() => (draft ? validateContent(draft) : null), [draft]);
  const problem = check && !check.ok ? friendly(check.error, draft) : null;

  const edit = (fn: (c: Content) => void) =>
    setDraft((d) => {
      if (!d) return d;
      const next = structuredClone(d);
      fn(next);
      return next;
    });

  const refresh = useCallback(async () => {
    const r = await getJson<Payload>("/api/admin/content");
    if (r.ok) apply(r.data, false);
  }, [apply]);

  async function save(): Promise<boolean> {
    if (!draft) return false;
    const v = validateContent(draft);
    if (!v.ok) {
      setMsg({ kind: "err", text: friendly(v.error, draft) });
      return false;
    }
    setBusy("save");
    const r = await sendJson<{ ok: true }>("PUT", "/api/admin/content", { draft: v.value });
    setBusy("");
    if (!r.ok) {
      setMsg({ kind: "err", text: explain(r.error, r.status) });
      return false;
    }
    setDraft(v.value);
    setSavedJson(JSON.stringify(v.value));
    await refresh();
    setLoadedNote(null);
    setMsg({ kind: "ok", text: "Borrador guardado. Todavía no es público: usa «Publicar» cuando quieras." });
    return true;
  }

  async function publish() {
    if (dirty && !(await save())) return;
    setBusy("publish");
    const r = await sendJson<{ ok: true }>("POST", "/api/admin/publish");
    setBusy("");
    if (!r.ok) return setMsg({ kind: "err", text: explain(r.error, r.status) });
    await refresh();
    setMsg({ kind: "ok", text: "Publicado. El sitio los muestra en uno o dos minutos." });
  }

  async function discard() {
    setBusy("discard");
    const r = await sendJson<{ ok: true }>("POST", "/api/admin/discard");
    setBusy("");
    if (!r.ok) return setMsg({ kind: "err", text: explain(r.error, r.status) });
    const again = await getJson<Payload>("/api/admin/content");
    if (again.ok) apply(again.data, true);
    setMsg({ kind: "ok", text: "Cambios descartados: el borrador vuelve a ser igual a lo publicado." });
  }

  async function preview() {
    // La ventana se abre dentro del clic (si no, el navegador la bloquea) y luego se le pone la direccion.
    const w = window.open("about:blank", "_blank");
    if (dirty && !(await save())) {
      w?.close();
      return;
    }
    if (w) w.location.href = "/admin/vista-previa";
  }

  const photoFile = useRef<HTMLInputElement>(null);
  async function pickPhoto(file: File) {
    setBusy("image");
    setMsg(null);
    try {
      const blob = await compressImage(file, 200_000, 800);
      const r = await uploadImage(blob);
      if (!r.ok) throw new Error(explain(r.error, r.status));
      edit((c) => {
        c.about.photo = r.data.url;
      });
      setMsg({ kind: "ok", text: "Foto subida. Guarda el borrador para conservarla." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "No se pudo subir la foto." });
    } finally {
      setBusy("");
    }
  }

  async function pickImage(i: number, file: File, field: "image" | "icon" = "image") {
    setBusy("image");
    setMsg(null);
    try {
      const blob = await compressImage(file, field === "icon" ? 60_000 : undefined, field === "icon" ? 256 : undefined);
      const r = await uploadImage(blob);
      if (!r.ok) throw new Error(explain(r.error, r.status));
      edit((c) => {
        c.projects[i]![field] = r.data.url;
      });
      setMsg({ kind: "ok", text: `Imagen subida (${Math.round(blob.size / 1000)} KB). Guarda el borrador para conservarla.` });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "No se pudo subir la imagen." });
    } finally {
      setBusy("");
    }
  }

  if (loadError)
    return (
      <section className="panel">
        <h2>No se pudo abrir el editor</h2>
        <p>{loadError}</p>
        <p className="ed-note">Los pasos de configuración están en docs/admin-setup.md.</p>
      </section>
    );
  if (!draft || !meta) return <div className="skeleton" />;

  const status = dirty
    ? "Tienes cambios sin guardar."
    : meta.unpublished || (meta.hasDraft && !meta.hasPublished)
      ? "Borrador guardado, sin publicar."
      : meta.hasPublished && meta.publishedAt
        ? `Publicado el ${when(meta.publishedAt)}.`
        : "Sin cambios: el sitio usa los textos originales.";
  const canPublish = !busy && !problem && (dirty || meta.unpublished || (meta.hasDraft && !meta.hasPublished));

  return (
    <>
      <div className="ed-bar" role="region" aria-label="Acciones del editor">
        <p className={`ed-status${dirty || meta.unpublished ? " warn" : ""}`}>{status}</p>
        <div className="row-actions">
          <button type="button" className="btn-s" onClick={() => void preview()} disabled={!!busy || !!problem}>
            Vista previa
          </button>
          <button type="button" className="btn-s" onClick={() => void save()} disabled={!!busy || !dirty || !!problem}>
            {busy === "save" ? "Guardando…" : "Guardar borrador"}
          </button>
          <ConfirmButton label="Publicar" confirmLabel="Sí, publicar ahora" onConfirm={() => void publish()} disabled={!canPublish} />
          <ConfirmButton label="Descartar cambios" confirmLabel="Sí, descartar" danger onConfirm={() => void discard()} disabled={!!busy || (!dirty && !meta.unpublished)} />
        </div>
      </div>
      <div className="ed-msg" aria-live="polite">
        {problem && <p className="msg err">Antes de guardar: {problem}</p>}
        {!problem && msg && <p className={`msg ${msg.kind}`}>{msg.text}</p>}
      </div>

      <Panel title="Portada" note="Lo primero que se ve. El texto resaltado del titular sale en azul.">
        <L2Field label="Etiqueta superior" value={draft.hero.eyebrow} max={120} onChange={(v) => edit((c) => void (c.hero.eyebrow = v))} />
        <div className="grid3">
          <L2Field label="Titular: inicio" value={draft.hero.h1Before} max={120} onChange={(v) => edit((c) => void (c.hero.h1Before = v))} />
          <L2Field label="Titular: texto resaltado" value={draft.hero.h1Em} max={120} onChange={(v) => edit((c) => void (c.hero.h1Em = v))} />
          <L2Field label="Titular: final" value={draft.hero.h1After} max={120} onChange={(v) => edit((c) => void (c.hero.h1After = v))} />
        </div>
        <L2Field label="Texto de presentación" value={draft.hero.lede} max={400} multiline rows={3} onChange={(v) => edit((c) => void (c.hero.lede = v))} />
        <label className="check">
          <input type="checkbox" checked={draft.availability.enabled} onChange={(e) => edit((c) => void (c.availability.enabled = e.target.checked))} />
          <span>Mostrar la etiqueta de disponibilidad bajo los botones</span>
        </label>
        {draft.availability.enabled && <L2Field label="Texto de la etiqueta" value={draft.availability.text} max={80} onChange={(v) => edit((c) => void (c.availability.text = v))} />}
      </Panel>

      <Panel title="Trayectoria" note="Sección nueva antes de Proyectos, con su enlace en el menú. Los años de experiencia también salen en la tira de cifras de la portada.">
        <div className="grid2">
          <Field
            label="Años de experiencia"
            type="number"
            value={String(draft.years)}
            hint="Número entero. En español se muestra «+13» y en inglés «13+»."
            onChange={(v) => edit((c) => void (c.years = Math.max(0, Math.min(60, Math.round(Number(v) || 0)))))}
          />
        </div>
        <L2Field label="Título" value={draft.experience.title} max={80} onChange={(v) => edit((c) => void (c.experience.title = v))} />
        <L2Field label="Introducción" value={draft.experience.intro} max={600} multiline rows={5} onChange={(v) => edit((c) => void (c.experience.intro = v))} />
        {draft.experience.points.map((pt, i) => (
          <div className="step-ed" key={i}>
            <header>
              <h3>
                <span className="num">{i + 1}</span> Punto
              </h3>
              <div className="row-actions">
                <button type="button" className="btn-s" disabled={i === 0} aria-label={`Subir punto ${i + 1}`} onClick={() => edit((c) => void ([c.experience.points[i - 1], c.experience.points[i]] = [c.experience.points[i]!, c.experience.points[i - 1]!]))}>
                  ↑
                </button>
                <button type="button" className="btn-s" disabled={i === draft.experience.points.length - 1} aria-label={`Bajar punto ${i + 1}`} onClick={() => edit((c) => void ([c.experience.points[i + 1], c.experience.points[i]] = [c.experience.points[i]!, c.experience.points[i + 1]!]))}>
                  ↓
                </button>
                <ConfirmButton label="Eliminar" confirmLabel="Sí, eliminar" danger disabled={draft.experience.points.length <= 1} onConfirm={() => edit((c) => void c.experience.points.splice(i, 1))} />
              </div>
            </header>
            <L2Field label="Texto" value={pt} max={300} multiline rows={2} onChange={(v) => edit((c) => void (c.experience.points[i] = v))} />
          </div>
        ))}
        <button type="button" className="btn-s add" disabled={draft.experience.points.length >= 8} onClick={() => edit((c) => void c.experience.points.push({ es: "", en: "" }))}>
          + Agregar punto
        </button>
      </Panel>

      <Panel title="Proyectos" note="El orden de aquí es el orden del sitio. Los proyectos ocultos no se muestran pero se conservan.">
        {draft.projects.map((p, i) => (
          <ProjectEditor
            key={p.id}
            project={p}
            index={i}
            total={draft.projects.length}
            busy={busy === "image"}
            onChange={(np) => edit((c) => void (c.projects[i] = np))}
            onMove={(dir) =>
              edit((c) => {
                const j = i + dir;
                if (j < 0 || j >= c.projects.length) return;
                [c.projects[i], c.projects[j]] = [c.projects[j]!, c.projects[i]!];
              })
            }
            onDelete={() => edit((c) => void c.projects.splice(i, 1))}
            onImage={(f) => void pickImage(i, f)}
            onIcon={(f) => void pickImage(i, f, "icon")}
          />
        ))}
        <div className="row-actions">
          <ConfirmButton
            label="Cargar textos originales del sitio"
            confirmLabel="Sí, reemplazar textos"
            disabled={!!busy}
            onConfirm={() => {
              const base = defaultContent();
              let n = 0;
              setLoadedNote(null);
              edit((c) => {
                for (const p of c.projects) {
                  const o = base.projects.find((x) => x.id === p.id);
                  if (!o) continue;
                  p.desc = o.desc;
                  p.role = o.role;
                  p.tags = o.tags;
                  n++;
                }
                c.about.title = base.about.title;
                c.about.role = base.about.role;
                c.about.text = base.about.text;
                c.hero.eyebrow = base.hero.eyebrow;
                c.hero.lede = base.hero.lede;
                c.sections.ctText = base.sections.ctText;
                c.experience = base.experience;
                c.years = base.years;
                c.seo.description = base.seo.description;
              });
              setLoadedNote(`Listo: se cargaron en el borrador los textos de ${base.projects.length} proyectos, Sobre mí, portada, Trayectoria y Contacto (aún sin guardar). Ahora toca «Guardar borrador» y luego «Publicar».`);
              setMsg({ kind: "ok", text: `Se cargaron los textos y etiquetas de ${n} proyectos, Sobre mí, la portada, Trayectoria, el texto de Contacto y la descripción para buscadores. Tus imágenes e íconos no cambian. Guarda el borrador y publica para verlo en el sitio.` });
            }}
          />
        </div>
        {loadedNote && <p className="msg ok">{loadedNote}</p>}
        <p className="ed-note">Reemplaza por los que vienen con el sitio: descripción, «lo que definí» y etiquetas de los proyectos originales; título, rol y texto de Sobre mí; etiqueta y subtítulo de la portada; Trayectoria y años de experiencia; la frase de Contacto; y la descripción para buscadores. No toca imágenes, fotos, íconos, enlaces, orden ni lo que tengas oculto o apagado.</p>
        <button
          type="button"
          className="btn-s add"
          disabled={draft.projects.length >= 24}
          onClick={() =>
            edit((c) => {
              let n = c.projects.length + 1;
              while (c.projects.some((p) => p.id === `proyecto-${n}`)) n++;
              c.projects.push({
                id: `proyecto-${n}`,
                name: "Nuevo proyecto",
                url: "https://",
                category: "finance",
                hidden: false,
                tags: [],
                desc: { es: "", en: "" },
                role: { es: "", en: "" },
                image: null,
                icon: null,
              });
            })
          }
        >
          + Agregar proyecto
        </button>
      </Panel>

      <Panel title="Sobre mí" note="Una tarjeta con tu foto, un texto corto y tu LinkedIn, antes de Contacto. Está apagada hasta que la actives.">
        <label className="check">
          <input type="checkbox" checked={draft.about.enabled} onChange={(e) => edit((c) => void (c.about.enabled = e.target.checked))} />
          <span>Mostrar la sección «Sobre mí» en el sitio</span>
        </label>
        <L2Field label="Título" value={draft.about.title} max={80} onChange={(v) => edit((c) => void (c.about.title = v))} />
        <L2Field label="Rol y ciudad" value={draft.about.role} max={120} onChange={(v) => edit((c) => void (c.about.role = v))} />
        <L2Field label="Texto" value={draft.about.text} max={1500} multiline rows={12} onChange={(v) => edit((c) => void (c.about.text = v))} />
        <Field label="Enlace de LinkedIn" value={draft.about.linkedin} max={300} hint="Aparece aquí y también junto a tu correo en Contacto, aunque esta sección esté apagada. Debe empezar con https://www.linkedin.com/" onChange={(v) => edit((c) => void (c.about.linkedin = v))} />
        <div className="img-ed">
          <strong>Foto</strong>
          {draft.about.photo ? <img src={draft.about.photo} alt="Tu foto" /> : <p className="ed-note">Sin foto: se muestran tus iniciales (JM). Se recorta en cuadrado; usa una donde se vea bien tu cara.</p>}
          <div className="row-actions">
            <input
              ref={photoFile}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pickPhoto(f);
                e.target.value = "";
              }}
            />
            <button type="button" className="btn-s" disabled={busy === "image"} onClick={() => photoFile.current?.click()}>
              {draft.about.photo ? "Cambiar foto" : "Subir foto"}
            </button>
            {draft.about.photo && (
              <button type="button" className="btn-s" onClick={() => edit((c) => void (c.about.photo = null))}>
                Quitar foto
              </button>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Cómo trabajo">
        <L2Field label="Título de la sección" value={draft.sections.howTitle} max={80} onChange={(v) => edit((c) => void (c.sections.howTitle = v))} />
        <L2Field label="Frase de apoyo" value={draft.sections.howSub} max={300} multiline rows={2} onChange={(v) => edit((c) => void (c.sections.howSub = v))} />
        {draft.steps.map((s, i) => (
          <div className="step-ed" key={i}>
            <header>
              <h3>
                <span className="num">{i + 1}</span> Paso
              </h3>
              <div className="row-actions">
                <button type="button" className="btn-s" disabled={i === 0} aria-label={`Subir paso ${i + 1}`} onClick={() => edit((c) => void ([c.steps[i - 1], c.steps[i]] = [c.steps[i]!, c.steps[i - 1]!]))}>
                  ↑
                </button>
                <button type="button" className="btn-s" disabled={i === draft.steps.length - 1} aria-label={`Bajar paso ${i + 1}`} onClick={() => edit((c) => void ([c.steps[i + 1], c.steps[i]] = [c.steps[i]!, c.steps[i + 1]!]))}>
                  ↓
                </button>
                <ConfirmButton label="Eliminar" confirmLabel="Sí, eliminar" danger disabled={draft.steps.length <= 1} onConfirm={() => edit((c) => void c.steps.splice(i, 1))} />
              </div>
            </header>
            <L2Field label="Título" value={s.title} max={80} onChange={(v) => edit((c) => void (c.steps[i]!.title = v))} />
            <L2Field label="Texto" value={s.text} max={300} multiline rows={2} onChange={(v) => edit((c) => void (c.steps[i]!.text = v))} />
          </div>
        ))}
        <button type="button" className="btn-s add" disabled={draft.steps.length >= 8} onClick={() => edit((c) => void c.steps.push({ title: { es: "", en: "" }, text: { es: "", en: "" } }))}>
          + Agregar paso
        </button>
      </Panel>

      <Panel title="Contacto y títulos de sección">
        <div className="grid2">
          <Field label="Correo de contacto" type="email" value={draft.contact.email} max={120} onChange={(v) => edit((c) => void (c.contact.email = v))} />
          <Field label="Enlace de GitHub" value={draft.contact.github} max={300} hint="Debe empezar con https://" onChange={(v) => edit((c) => void (c.contact.github = v))} />
        </div>
        <L2Field label="Título de Proyectos" value={draft.sections.projTitle} max={80} onChange={(v) => edit((c) => void (c.sections.projTitle = v))} />
        <L2Field label="Frase de apoyo de Proyectos" value={draft.sections.projSub} max={300} multiline rows={2} onChange={(v) => edit((c) => void (c.sections.projSub = v))} />
        <L2Field label="Título de Contacto" value={draft.sections.ctTitle} max={80} onChange={(v) => edit((c) => void (c.sections.ctTitle = v))} />
        <L2Field label="Texto de Contacto" value={draft.sections.ctText} max={300} multiline rows={2} onChange={(v) => edit((c) => void (c.sections.ctText = v))} />
      </Panel>

      <Panel title="Buscadores" note="Lo que aparece en Google y en la pestaña del navegador.">
        <L2Field label="Título de la página" value={draft.seo.title} max={70} onChange={(v) => edit((c) => void (c.seo.title = v))} />
        <L2Field label="Descripción" value={draft.seo.description} max={200} multiline rows={3} onChange={(v) => edit((c) => void (c.seo.description = v))} />
      </Panel>
    </>
  );
}
