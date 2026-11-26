// Convierte las pantallas simuladas de las apps (screens-src/*.html) en documentos estaticos
// que el sitio muestra dentro de iframes (public/screens/*.html) y escribe sus medidas en
// src/data/screens.json.
//
// Cada documento sale sin scripts: los iconos (lucide) y lo que dibujaba JavaScript ya viene
// resuelto, asi que no depende de ninguna libreria externa (solo de la fuente de Google Fonts).
//
// Uso (no agrega dependencias al proyecto):
//   npm i --no-save playwright lucide@0.469.0
//   npx playwright install chromium        # solo si no tienes el navegador
//   node scripts/render-screens.mjs
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const lucideFile = require.resolve("lucide/dist/umd/lucide.min.js");

const SRC = "screens-src";
const OUT = "public/screens";
const MANIFEST = "src/data/screens.json";

// Se aplica al medir y dentro de cada documento: dispositivo a tamano natural, sin escala ni sombra.
const OVERRIDES = `
html, body { margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: hidden; }
.laptop { width: 1102px !important; box-shadow: none !important; }
.phone { box-shadow: none !important; }
.fit-outer { height: auto !important; }
.fit-inner { transform: none !important; }
`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const manifest = {};

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".html")).sort()) {
  const app = basename(file, ".html");
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto("file://" + process.cwd() + "/" + SRC + "/" + file);
  await page.addScriptTag({ path: lucideFile });
  await page.evaluate(() => window.lucide.createIcons());
  await page.addStyleTag({ content: OVERRIDES });
  await page.waitForTimeout(300);

  const head = await page.evaluate(() => {
    const links = [...document.querySelectorAll('head link[rel="stylesheet"]')].map((l) => l.outerHTML);
    const styles = [...document.querySelectorAll("head style")].map((s) => s.textContent);
    return { links, styles };
  });

  const devices = await page.evaluate(() =>
    [...document.querySelectorAll(".laptop, .phone")].map((el) => {
      const r = el.getBoundingClientRect();
      return { kind: el.classList.contains("laptop") ? "desktop" : "phone", html: el.outerHTML, w: Math.ceil(r.width), h: Math.ceil(r.height) };
    }),
  );

  const count = {};
  devices.forEach((d) => (count[d.kind] = (count[d.kind] ?? 0) + 1));
  const seen = {};
  manifest[app] = devices.map((d) => {
    seen[d.kind] = (seen[d.kind] ?? 0) + 1;
    const name = count[d.kind] > 1 ? `${d.kind}-${seen[d.kind]}` : d.kind;
    const fileName = `${app}-${name}.html`;
    const doc = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${d.w}">
<title>${app} (${name})</title>
${head.links.join("\n")}
<style>${head.styles.join("\n")}</style>
<style>${OVERRIDES}</style>
</head>
<body>
${d.html}
</body>
</html>
`;
    writeFileSync(`${OUT}/${fileName}`, doc);
    return { file: fileName, kind: d.kind, w: d.w, h: d.h };
  });
  await page.close();
}

await browser.close();
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
