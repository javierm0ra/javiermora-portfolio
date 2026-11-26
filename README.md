# Portafolio de Javier Mora

Sitio de portafolio bilingue (ES/EN) con los proyectos: Stabily, KasaNode, KondoNode, Parilink, Medicatio y Ahi Nos Vemos.

## Stack

Vite + React + TypeScript. Estilos en CSS plano (`src/styles.css`) con la paleta de Stabily. Hosting: Cloudflare Pages.

## Desarrollo

```bash
npm install
npm run dev
npm run build   # tsc + vite build, salida en dist/
```

## Agregar o editar un proyecto

1. Agrega o edita el objeto en `src/data/projects.ts` (textos en espanol e ingles).
2. Si es nuevo, agrega su ilustracion en `src/components/Illustration.tsx` y registrala en el mapa `ART`.

Los textos generales (titular, pasos de "Como trabajo", contacto) viven en `src/data/i18n.ts`.

## Panel de visitas (/admin)

Panel protegido con Cloudflare Access que muestra visitas, procedencia, proyectos mas abiertos y mas, sin cookies.
Configuracion paso a paso: [docs/admin-setup.md](docs/admin-setup.md). Codigo: `functions/` (API en Cloudflare Pages Functions
y base D1, esquema en `migrations/`) y `src/admin/` (panel).

## Pantallas simuladas de las apps

Las tarjetas y el encabezado muestran pantallas de las apps reconstruidas con sus colores, tipografia y textos reales, pero con **datos ficticios** (nunca capturas de produccion).

- Fuentes: `screens-src/<app>.html` (una pagina por app con sus dispositivos).
- Resultado: `public/screens/*.html` (documentos estaticos, sin scripts) y `src/data/screens.json` (medidas).
- Se regeneran con `node scripts/render-screens.mjs` (instrucciones al inicio del script; no agrega dependencias al proyecto).
- El sitio las muestra con `src/components/ScreenFrame.tsx` y `Mock.tsx`.

## Despliegue en Cloudflare Pages

| Campo | Valor |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Variable de entorno | `NODE_VERSION=22` |
