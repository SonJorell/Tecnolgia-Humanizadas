-- ═══════════════════════════════════
-- 001_init.sql — EduPlataforma v2.0
-- ═══════════════════════════════════

CREATE TABLE cursos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  docente_id  UUID,
  nivel       TEXT,
  icono       TEXT,
  color       TEXT,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE perfiles (
  id          UUID REFERENCES auth.users PRIMARY KEY,
  nombre      TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('alumno','docente','directivo')),
  curso_id    UUID REFERENCES cursos(id),
  avatar_url  TEXT,
  xp          INTEGER DEFAULT 0,
  monedas     INTEGER DEFAULT 0,
  nivel       INTEGER DEFAULT 1,
  creado_en   TIMESTAMPTZ DEFAULT NOW(),
  actualizado TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cursos ADD CONSTRAINT cursos_docente_fkey
  FOREIGN KEY (docente_id) REFERENCES perfiles(id);

CREATE TABLE inscripciones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id   UUID REFERENCES perfiles(id),
  curso_id    UUID REFERENCES cursos(id),
  progreso    INTEGER DEFAULT 0,
  inscrito_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, curso_id)
);

CREATE TABLE materiales (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id           UUID REFERENCES cursos(id),
  docente_id         UUID REFERENCES perfiles(id),
  titulo             TEXT NOT NULL,
  descripcion        TEXT,
  tipo               TEXT CHECK (tipo IN ('guia','tarea','evaluacion','recurso')),
  archivo_url        TEXT,
  archivo_nombre     TEXT,
  archivo_size       INTEGER,
  disponible_offline BOOLEAN DEFAULT TRUE,
  publicado          BOOLEAN DEFAULT FALSE,
  fecha_entrega      TIMESTAMPTZ,
  xp_premio          INTEGER DEFAULT 0,
  creado_en          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE entregas (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id   UUID REFERENCES materiales(id),
  alumno_id     UUID REFERENCES perfiles(id),
  contenido     TEXT,
  archivo_url   TEXT,
  calificacion  NUMERIC(4,1),
  comentario    TEXT,
  estado        TEXT DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','entregado','revisado','tardio')),
  sincronizado  BOOLEAN DEFAULT FALSE,
  entregado_en  TIMESTAMPTZ DEFAULT NOW(),
  revisado_en   TIMESTAMPTZ
);

CREATE TABLE logros (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  icono       TEXT,
  xp_premio   INTEGER DEFAULT 50,
  categoria   TEXT
);

CREATE TABLE logros_alumno (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id    UUID REFERENCES perfiles(id),
  logro_id     UUID REFERENCES logros(id),
  desbloqueado TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, logro_id)
);

CREATE TABLE premios (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre         TEXT NOT NULL,
  descripcion    TEXT,
  icono          TEXT,
  categoria      TEXT,
  precio_monedas INTEGER NOT NULL,
  stock          INTEGER DEFAULT -1,
  activo         BOOLEAN DEFAULT TRUE,
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE canjes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id        UUID REFERENCES perfiles(id),
  premio_id        UUID REFERENCES premios(id),
  monedas_gastadas INTEGER,
  estado           TEXT DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','aprobado','rechazado')),
  canjeado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  autor_id    UUID REFERENCES perfiles(id),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  categorias  TEXT[],
  comentario  TEXT,
  resuelto    BOOLEAN DEFAULT FALSE,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);
