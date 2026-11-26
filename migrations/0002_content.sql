-- Contenido editable del sitio (borrador y publicado) e imagenes subidas desde el panel.
CREATE TABLE IF NOT EXISTS site_content (
  key          TEXT PRIMARY KEY,   -- siempre 'site'
  draft        TEXT,               -- JSON del borrador (NULL = igual al original del codigo)
  published    TEXT,               -- JSON publicado (NULL = el sitio usa los textos originales del codigo)
  updated_at   INTEGER,            -- segundos desde 1970
  published_at INTEGER
);

-- Las imagenes se guardan en base64 (ya comprimidas desde el navegador, maximo ~450 KB cada una).
CREATE TABLE IF NOT EXISTS images (
  id         TEXT PRIMARY KEY,     -- 24 caracteres hexadecimales al azar
  mime       TEXT NOT NULL,
  data       TEXT NOT NULL,        -- base64
  created_at INTEGER NOT NULL
);
