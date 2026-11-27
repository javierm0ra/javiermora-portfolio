// Ejecutar: npm test
import assert from "node:assert/strict";
import test from "node:test";
import { isDegreeKind, sniffImage, validateContent, type Content } from "./content.ts";

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
      tags: ["React"], desc: l("Finanzas"), role: l("Reglas"), image: null, icon: null,
    },
  ],
  about: { enabled: true, title: l("Yo"), role: l("PO"), text: l("Texto"), photo: null, linkedin: "https://www.linkedin.com/in/yo" },
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

test("un documento viejo sin seccion Sobre mi se acepta con la de origen apagada", () => {
  const c = base() as unknown as Record<string, unknown>;
  delete c.about;
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.about.enabled, false);
});

test("Sobre mi: solo LinkedIn con https y fotos propias del sitio", () => {
  const a = base();
  a.about.linkedin = "https://evil.com/in/yo";
  assert.equal(validateContent(a).ok, false);
  const b = base();
  b.about.linkedin = "http://www.linkedin.com/in/yo";
  assert.equal(validateContent(b).ok, false);
  const c = base();
  c.about.photo = "https://evil.com/x.png";
  assert.equal(validateContent(c).ok, false);
  const d = base();
  d.about.linkedin = "";
  d.about.photo = "/api/img/0123456789abcdef01234567";
  d.projects[0]!.icon = "/api/img/0123456789abcdef01234567";
  assert.equal(validateContent(d).ok, true);
});

test("un documento viejo sin Trayectoria ni anos se acepta con los de origen", () => {
  const c = base() as unknown as Record<string, unknown>;
  delete c.experience;
  delete c.years;
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.years, 13);
    assert.equal(r.value.experience.points.length, 5);
  }
});

test("Trayectoria y anos: limites y formato", () => {
  const a = base() as unknown as Record<string, unknown>;
  a.years = 12.5;
  assert.equal(validateContent(a).ok, false);
  const b = base() as unknown as Record<string, unknown>;
  b.years = 61;
  assert.equal(validateContent(b).ok, false);
  const c = base() as unknown as Record<string, unknown>;
  c.experience = { title: l("T"), intro: l("I"), points: [] };
  assert.equal(validateContent(c).ok, false);
  const d = base() as unknown as Record<string, unknown>;
  d.years = 15;
  d.experience = { title: l("T"), intro: l("I"), points: [l("Uno"), l("Dos")] };
  const r = validateContent(d);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.experience.points.length, 2);
});

test("GitHub es opcional: vacio se acepta y se deja vacio; con valor debe ser https", () => {
  const a = base();
  a.contact.github = "";
  const r = validateContent(a);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.contact.github, "");
  const b = base();
  b.contact.github = "   ";
  const rb = validateContent(b);
  assert.equal(rb.ok, true);
  if (rb.ok) assert.equal(rb.value.contact.github, "");
  const c = base();
  c.contact.github = "http://github.com/yo";
  assert.equal(validateContent(c).ok, false);
  const d = base() as unknown as Record<string, unknown>;
  delete (d.contact as Record<string, unknown>).github;
  assert.equal(validateContent(d).ok, true);
});

test("orden de secciones: un documento viejo usa el de origen y Sobre mi sigue a la casilla vieja", () => {
  const c = base() as unknown as Record<string, unknown>;
  delete c.layout;
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.deepEqual(r.value.layout.map((e) => e.id), ["trayectoria", "proyectos", "expertise", "formacion", "como", "sobre", "contacto"]);
    assert.equal(r.value.layout.find((e) => e.id === "sobre")!.show, true); // base() tiene about.enabled = true
    assert.equal(r.value.layout.find((e) => e.id === "como")!.menu, false);
  }
});

test("orden de secciones: se respeta el orden guardado, se completa lo que falte y se ignora lo desconocido", () => {
  const c = base() as unknown as Record<string, unknown>;
  c.layout = [
    { id: "contacto", show: true, menu: true },
    { id: "inventada", show: true, menu: true },
    { id: "proyectos", show: false, menu: false },
  ];
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) {
    // Lo que falta se inserta despues de su vecina en el orden de origen (Trayectoria, al principio).
    assert.deepEqual(r.value.layout.map((e) => e.id), ["trayectoria", "contacto", "proyectos", "expertise", "formacion", "como", "sobre"]);
    assert.equal(r.value.layout.find((e) => e.id === "proyectos")!.show, false);
  }
});

test("orden de secciones: repetidas y valores que no son booleanos se rechazan", () => {
  const a = base() as unknown as Record<string, unknown>;
  a.layout = [{ id: "proyectos", show: true, menu: true }, { id: "proyectos", show: true, menu: true }];
  assert.equal(validateContent(a).ok, false);
  const b = base() as unknown as Record<string, unknown>;
  b.layout = [{ id: "proyectos", show: "si", menu: true }];
  assert.equal(validateContent(b).ok, false);
  const d = base() as unknown as Record<string, unknown>;
  d.layout = "no es lista";
  assert.equal(validateContent(d).ok, false);
});

test("orden de secciones: about.enabled queda igual al interruptor de Sobre mi en el orden", () => {
  const c = base() as unknown as Record<string, unknown>;
  c.layout = [{ id: "sobre", show: false, menu: true }];
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.about.enabled, false);
  const d = base() as unknown as Record<string, unknown>;
  (d.about as Record<string, unknown>).enabled = false;
  d.layout = [{ id: "sobre", show: true, menu: true }];
  const rd = validateContent(d);
  assert.equal(rd.ok, true);
  if (rd.ok) assert.equal(rd.value.about.enabled, true);
});

test("un orden guardado antes de Expertise y Formacion las recibe despues de Proyectos", () => {
  const c = base() as unknown as Record<string, unknown>;
  c.layout = [
    { id: "trayectoria", show: true, menu: true },
    { id: "proyectos", show: true, menu: true },
    { id: "como", show: true, menu: false },
    { id: "sobre", show: true, menu: true },
    { id: "contacto", show: true, menu: true },
  ];
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.deepEqual(r.value.layout.map((e) => e.id), ["trayectoria", "proyectos", "expertise", "formacion", "como", "sobre", "contacto"]);
    assert.equal(r.value.layout.find((e) => e.id === "formacion")!.show, true);
  }
});

test("formacion: un documento viejo trae los diez registros de origen", () => {
  const c = base() as unknown as Record<string, unknown>;
  delete c.education;
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.education.items.length, 10);
    const grados = r.value.education.items.filter((i) => isDegreeKind(i.kind)).length;
    assert.equal(grados, 3);
    assert.equal(r.value.education.items.length - grados, 7);
  }
});

test("formacion: se valida tipo, peso, ano, logo, ids repetidos y limite", () => {
  const item = (o: Record<string, unknown> = {}) => ({ id: "uno", name: l("Maestria"), institution: "ITESO", logo: null, year: 2014, kind: "mae", weight: "alto", ...o });
  const mk = (items: unknown[]) => {
    const c = base() as unknown as Record<string, unknown>;
    c.education = { title: l("Formacion"), intro: l(""), items };
    return validateContent(c);
  };
  assert.equal(mk([item()]).ok, true);
  assert.equal(mk([]).ok, true);
  assert.equal(mk([item({ kind: "doctorado" })]).ok, false);
  assert.equal(mk([item({ weight: "enorme" })]).ok, false);
  assert.equal(mk([item({ year: 1900 })]).ok, false);
  assert.equal(mk([item({ year: 2014.5 })]).ok, false);
  assert.equal(mk([item({ logo: "https://evil.com/x.png" })]).ok, false);
  assert.equal(mk([item({ logo: "/api/img/0123456789abcdef01234567" })]).ok, true);
  assert.equal(mk([item(), item()]).ok, false);
  assert.equal(mk([item({ id: "Mayusculas!" })]).ok, false);
  assert.equal(mk(Array.from({ length: 41 }, (_, i) => item({ id: `r-${i}` }))).ok, false);
});

test("isDegreeKind: licenciatura, maestria y posgrado son grados; diplomado y curso no", () => {
  assert.equal(isDegreeKind("lic"), true);
  assert.equal(isDegreeKind("mae"), true);
  assert.equal(isDegreeKind("pos"), true);
  assert.equal(isDegreeKind("dip"), false);
  assert.equal(isDegreeKind("cur"), false);
});

test("negocio propio: los documentos viejos son productos y la categoria de marketing es valida", () => {
  const a = validateContent(base());
  assert.equal(a.ok, true);
  if (a.ok) assert.equal(a.value.projects[0]!.business, false);
  const b = base();
  (b.projects[0] as { category: string; business?: boolean }).category = "marketing";
  (b.projects[0] as { business?: boolean }).business = true;
  const r = validateContent(b);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.projects[0]!.business, true);
  const c = base();
  (c.projects[0] as { business?: unknown }).business = "si";
  assert.equal(validateContent(c).ok, false);
});

test("expertise: un documento viejo usa el de origen y uno nuevo se valida y se limpia", () => {
  const a = validateContent(base());
  assert.equal(a.ok, true);
  if (a.ok) {
    assert.equal(a.value.expertise.areas.length, 5);
    assert.equal(a.value.expertise.shape, "neuron");
    assert.equal(a.value.layout.find((e) => e.id === "expertise")!.show, true);
  }
  const c = base() as unknown as Record<string, unknown>;
  c.expertise = {
    title: l("Expertise"), intro: l(""), shape: "chip",
    areas: [{ id: "a-1", name: l("Credito"), color: "#ABCDEF", extra: 1, subs: [
      { name: l("Simple"), level: "d" },
      { name: l("Grupo"), level: "s", children: [{ name: l("HTML"), level: "s" }] },
    ] }],
  };
  const r = validateContent(c);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.expertise.areas[0]!.color, "#abcdef");
    assert.equal("extra" in r.value.expertise.areas[0]!, false);
    assert.equal(r.value.expertise.areas[0]!.subs[1]!.children!.length, 1);
  }
});

test("expertise: rechaza colores, niveles, formas, ids repetidos y grupos vacios invalidos", () => {
  const mk = (patch: (x: Record<string, unknown>) => void) => {
    const c = base() as unknown as Record<string, unknown>;
    const x = { title: l("E"), intro: l(""), shape: "neuron", areas: [{ id: "a-1", name: l("A"), color: "#112233", subs: [{ name: l("S"), level: "d" }] }] } as Record<string, unknown>;
    patch(x);
    c.expertise = x;
    return validateContent(c).ok;
  };
  const area = (x: Record<string, unknown>) => (x.areas as Record<string, unknown>[])[0]!;
  assert.equal(mk(() => undefined), true);
  assert.equal(mk((x) => void (area(x).color = "rojo")), false);
  assert.equal(mk((x) => void (x.shape = "cubo")), false);
  assert.equal(mk((x) => void ((area(x).subs as Record<string, unknown>[])[0]!.level = "z")), false);
  assert.equal(mk((x) => void ((area(x).subs as Record<string, unknown>[])[0]!.children = [])), false);
  assert.equal(mk((x) => void (x.areas = [area(x), area(x)])), false);
  assert.equal(mk((x) => void (area(x).id = "Con Espacios")), false);
});
