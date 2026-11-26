// Genera los iconos y la imagen para compartir del sitio:
//   public/favicon-32.png, public/favicon.ico, public/apple-touch-icon.png, public/og-image.png
// Uso (necesita Playwright y la fuente Inter instalada en el sistema):
//   npm i --no-save playwright && node scripts/render-brand.mjs
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BLUE = "#177eb9";
const NAVY = "#1a335d";
const FONT = `Inter, "Helvetica Neue", Arial, sans-serif`;

const iconHtml = (size, radius) => `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;background:transparent}
  .i{width:${size}px;height:${size}px;border-radius:${radius}px;background:linear-gradient(135deg,${BLUE},${NAVY});
     display:grid;place-items:center;color:#fff;font:700 ${Math.round(size * 0.44)}px ${FONT};letter-spacing:-.02em}
</style><div class="i">JM</div>`;

const ogHtml = `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0}
  .c{width:1200px;height:627px;box-sizing:border-box;padding:72px 84px;position:relative;overflow:hidden;
     background:linear-gradient(160deg,#e6f2f9 0%,#f8f9fa 70%);font-family:${FONT};color:${NAVY}}
  .c::before{content:"";position:absolute;width:640px;height:640px;right:-180px;top:-260px;border-radius:50%;
     background:radial-gradient(circle,rgba(23,126,185,.28),transparent 65%)}
  .c::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(26,51,93,.10) 1.5px,transparent 1.5px);
     background-size:28px 28px;opacity:.55}
  .in{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;justify-content:space-between}
  .logo{width:132px;height:132px;border-radius:30px;background:linear-gradient(135deg,${BLUE},${NAVY});color:#fff;
     display:grid;place-items:center;font-weight:700;font-size:58px;letter-spacing:-.02em;box-shadow:0 18px 40px -16px rgba(26,51,93,.5)}
  h1{margin:0;font-size:132px;line-height:1;font-weight:800;letter-spacing:-.04em}
  .sub{margin:22px 0 0;font-size:46px;font-weight:600;color:${BLUE};letter-spacing:-.01em}
  .url{font-size:26px;font-weight:500;color:#5b6b82}
</style><div class="c"><div class="in">
  <div class="logo">JM</div>
  <div><h1>Javier Mora</h1><p class="sub">Product Owner · Fintech · +13 años</p></div>
  <div class="url">javiermora.pages.dev</div>
</div></div>`;

// Un ICO puede llevar PNG adentro: cabecera + una entrada por imagen.
function ico(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const dir = [];
  for (const { size, png } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    dir.push(e);
  }
  return Buffer.concat([head, ...dir, ...images.map((i) => i.png)]);
}

const browser = await chromium.launch();
async function shot(html, w, h, transparent = false) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, omitBackground: transparent });
  await page.close();
  return png;
}

const f32 = await shot(iconHtml(32, 8), 32, 32, true);
const f48 = await shot(iconHtml(48, 12), 48, 48, true);
const apple = await shot(iconHtml(180, 0), 180, 180);
const og = await shot(ogHtml, 1200, 627);
await browser.close();

writeFileSync("public/favicon-32.png", f32);
writeFileSync("public/favicon.ico", ico([{ size: 32, png: f32 }, { size: 48, png: f48 }]));
writeFileSync("public/apple-touch-icon.png", apple);
writeFileSync("public/og-image.png", og);
console.log("listo: favicon-32.png, favicon.ico, apple-touch-icon.png, og-image.png");
