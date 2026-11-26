// Ejecutar: npm test
import assert from "node:assert/strict";
import test from "node:test";
import { sniffImage, validateContent, type Content } from "./content.ts";

const l = (s: string) => ({ es: s, en: s });
const base = (): Content => ({
  v: 1,
  hero: { eyebrow: l("Hola"), h1Before: l("Antes "), h1Em: l("resaltado"), h1After: l("."), lede: l("Texto") },
  availability: { enabled: true, text: l("Disponible") },
  sections: { projTitle: l("P"), projSub: l(""), howTitle: l("H"), howSub: l(""), ctTitle: l("C"), ctText: l("") },
  steps: [{ title: l("Uno"), text: l("Paso uno") }],
  projects: [
    {
      id: "stabily", name: "Stabily", url: "https://stabily.app", category: "finance", hidden: false,
      tags: ["React"], desc: l("Finanzas"), role: l("Reglas"), image: null,
    },
  ],
  contact: { email: "yo@correo.com", github: "https://github.com/yo" },
  seo: { title: l("Titulo"), description: l("Descripcion") },
});

test("un documento correcto se acepta y se limpia", () => {
  const c = base();
  (c.projects[0] as unknown as Record<string, unknown>).extra = "no debe pasar";
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal("extra" in r.value.projects[0]!, false);
});

test("rechaza enlaces que no son https, ids repetidos y categorias inventadas", () => {
  const a = base();
  a.projects[0]!.url = "javascript:alert(1)";
  assert.equal(validateContent(a).ok, false);
  const b = base();
  b.projects[0]!.url = "http://sitio.com";
  assert.equal(validateContent(b).ok, false);
  const c = base();
  c.projects.push({ ...c.projects[0]! });
  assert.match((validateContent(c) as { error: string }).error, /repetido/);
  const d = base();
  (d.projects[0] as { category: string }).category = "hackeo";
  assert.equal(validateContent(d).ok, false);
});

test("rechaza imagenes que no vienen de /api/img, textos vacios o demasiado largos y correos invalidos", () => {
  const a = base();
  a.projects[0]!.image = "https://malo.com/x.png";
  assert.equal(validateContent(a).ok, false);
  const ok = base();
  ok.projects[0]!.image = "/api/img/0123456789abcdef01234567";
  assert.equal(validateContent(ok).ok, true);
  const b = base();
  b.projects[0]!.name = "";
  assert.equal(validateContent(b).ok, false);
  const c = base();
  c.hero.lede.es = "x".repeat(401);
  assert.equal(validateContent(c).ok, false);
  const d = base();
  d.contact.email = "no-es-correo";
  assert.equal(validateContent(d).ok, false);
});

test("rechaza version distinta y entradas que no son objeto", () => {
  assert.equal(validateContent(null).ok, false);
  assert.equal(validateContent([]).ok, false);
  assert.equal(validateContent({ ...base(), v: 2 }).ok, false);
});

test("sniffImage reconoce PNG, JPEG y WEBP por su cabecera", () => {
  assert.equal(sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0])), "image/png");
  assert.equal(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(sniffImage(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0])), "image/webp");
  assert.equal(sniffImage(Uint8Array.from([0x3c, 0x73, 0x76, 0x67, 0, 0, 0, 0, 0, 0, 0, 0, 0])), null);
});
