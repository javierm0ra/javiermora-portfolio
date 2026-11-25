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

## Despliegue en Cloudflare Pages

| Campo | Valor |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Variable de entorno | `NODE_VERSION=22` |
