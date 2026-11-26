# Panel de administracion: configuracion en Cloudflare

El sitio ya trae el codigo del panel (`/admin`) y del registro de visitas (`/api/t`). Para que funcionen faltan
tres cosas en Cloudflare. Hasta que esten hechas, el sitio se ve igual y el panel permanece **cerrado**.

## 1. Crear la base de datos (D1)

1. Cloudflare -> **Storage & databases** -> **D1 SQL database** -> **Create database**.
2. Nombre: `javiermora`. Ubicacion: la que sugiera (automatica).
3. Entra a la base -> pestana **Console** -> pega **todo** el contenido de `migrations/0001_events.sql` -> **Execute**.
   Debe responder que se crearon la tabla `events` y dos indices.
4. Repite con `migrations/0002_content.sql` (tablas `site_content` e `images`, para el editor de contenido).
   Se pegan y ejecutan **una a la vez**, en orden.

## 2. Conectar la base al proyecto de Pages

1. **Workers & Pages** -> proyecto `javiermora` -> **Settings** -> **Bindings** -> **Add** -> **D1 database**.
2. Variable name: `DB` (en mayusculas, exacto). Database: `javiermora`.
3. Guardar. (Si te deja elegir entorno: Production; opcionalmente tambien Preview.)

## 3. Proteger `/admin` con Cloudflare Access

1. Cloudflare -> **Zero Trust**. Si es la primera vez, te pide un nombre de equipo (por ejemplo `javiermora`)
   y elegir el plan **Free** (hasta 50 usuarios). Apunta el dominio que te muestra: `<equipo>.cloudflareaccess.com`.
2. **Access** -> **Applications** -> **Add an application** -> **Self-hosted**.
   - Application name: `Panel javiermora`.
   - Session duration: 24 horas (o la que prefieras).
   - Destinos publicos (dominio `javiermora.pages.dev`): usa **"Switch to custom input"** y escribe, cada uno en su
     propio renglon y sin punto ni espacio al final: `javiermora.pages.dev/admin*` y `javiermora.pages.dev/api/admin*`.
     El asterisco al final protege tambien todo lo que cuelga de esa ruta.
3. Politica: **Allow**, regla **Include -> Emails** -> tu correo.
   Metodo de acceso: **One-time PIN** (te manda un codigo por correo; no hay contrasenas).
4. Guarda y copia el **Application Audience (AUD) Tag** (en la pagina de la aplicacion).

## 4. Variables en Pages

En el proyecto `javiermora` -> **Settings** -> **Variables and secrets** -> **Add** (entorno Production):

| Nombre | Valor |
|---|---|
| `ACCESS_TEAM_DOMAIN` | `<equipo>.cloudflareaccess.com` (sin `https://`) |
| `ACCESS_AUD` | el AUD Tag del paso 3 |
| `ADMIN_EMAIL` | tu correo (la funcion tambien verifica que sea el mismo) |

Opcional: `ANALYTICS_SALT` con cualquier texto largo y secreto (mejora la privacidad del hash diario).

Las variables nuevas aplican al **siguiente deploy**: en **Deployments**, en el ultimo deploy -> **...** -> **Retry deployment**.

## 5. Comprobar

1. Abre `https://javiermora.pages.dev/admin`: Cloudflare te pide tu correo y un codigo.
2. Entras al panel. Si dice "acceso no configurado" o "falta la base", revisa los pasos 4 y 2.
3. Abre el sitio normal, navega, y en el panel recarga: aparece tu visita (activa en el panel la casilla
   "No contar mis visitas" cuando termines de probar).

## Usar el editor de contenido

`https://javiermora.pages.dev/admin/contenido`. Se edita un **borrador**; el sitio publico no cambia hasta que pulsas **Publicar**.

- **Guardar borrador**: guarda sin publicar. **Vista previa**: abre el sitio real con tu borrador (las visitas ahi no se cuentan).
- **Publicar**: lo que hay en el borrador pasa a verse en el sitio (tarda uno o dos minutos por la cache).
- **Descartar cambios**: el borrador vuelve a ser igual a lo publicado.
- Cada texto tiene su version en espanol y en ingles. Los proyectos se pueden ordenar, ocultar, agregar y eliminar.
- Las imagenes se reducen y comprimen solas antes de subirse (maximo ~420 KB). Usa capturas sin datos reales de clientes ni de pacientes.
- Si nunca publicas nada, el sitio usa los textos originales del codigo (`src/data`).
- Los enlaces solo aceptan `https://`.

## Privacidad de las visitas

Sin cookies y sin guardar la IP. Cada visita guarda: hora, dia (hora de Ciudad de Mexico), tipo de accion, pais
(lo da Cloudflare), tipo de dispositivo, dominio de origen e idioma, y un identificador que es un hash de
IP + navegador + sal que **cambia cada dia**. No se cuentan visitas de bots, ni de navegadores con "No rastrear"
activado, ni de quien marco la casilla del panel.

## Desarrollo local

```bash
npm run build
echo 'ADMIN_DEV_BYPASS=1' > .dev.vars          # salta Access, solo en local (ya esta en .gitignore)
npx wrangler pages dev dist --d1=DB --persist-to .wrangler/state
```

Para crear la tabla en la base local, ejecuta `migrations/0001_events.sql` con `wrangler d1 execute` apuntando
a un `wrangler.toml` temporal con `database_id = "DB"` y `--persist-to .wrangler/state`.
No agregues un `wrangler.toml` al repo: con Pages haria que el panel de Cloudflare deje de manejar los bindings.

Pruebas de la verificacion de Access: `npm test`.
