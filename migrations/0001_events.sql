-- Visitas y acciones del sitio. Sin cookies y sin guardar la IP:
-- `visitor` es un hash que cambia cada dia (IP + navegador + sal), asi que no sirve para seguir a nadie entre dias.
CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,   -- segundos desde 1970 (UTC)
  day     TEXT    NOT NULL,   -- AAAA-MM-DD en hora de Ciudad de Mexico
  type    TEXT    NOT NULL,   -- view | project_click | lang | contact_copy | contact_mail | github_click
  target  TEXT,               -- id del proyecto, idioma elegido, etc.
  visitor TEXT    NOT NULL,
  country TEXT,
  device  TEXT,               -- mobile | tablet | desktop
  ref     TEXT,               -- sitio de origen (solo el dominio) o 'directo'
  lang    TEXT                -- idioma del sitio en ese momento: es | en
);
CREATE INDEX IF NOT EXISTS events_day_type ON events (day, type);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
