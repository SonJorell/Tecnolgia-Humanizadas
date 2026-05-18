-- ═══════════════════════════════════
-- seed.sql — Datos de prueba
-- EduPlataforma v2.0 | J2N Software
-- ═══════════════════════════════════

-- Usuarios creados en Supabase Auth:
-- jorell@escuela.cl    / alumno123    → alumno
-- profesor@escuela.cl  / docente123   → docente
-- director@escuela.cl  / directivo123 → directivo

-- ═══════════════════════════════════
-- PERFILES (vinculados a auth.users)
-- ═══════════════════════════════════
INSERT INTO perfiles (id, nombre, rol, xp, monedas, nivel) VALUES
  ('4fc32de6-da28-488b-a941-d64581482d0a', 'Jorell Inostroza',   'alumno',    150, 25, 3),
  ('3f9a494e-0b90-4f84-898b-66efae34413b', 'Profesor García',    'docente',   0,   0,  1),
  ('e2367fdf-782c-4a1a-ac8e-3cd48addac16', 'Director Vásquez',   'directivo', 0,   0,  1);

-- ═══════════════════════════════════
-- CURSOS (asignados al docente)
-- ═══════════════════════════════════
INSERT INTO cursos (nombre, descripcion, nivel, icono, color, docente_id) VALUES
  ('Matemáticas', 'Álgebra y geometría',  '2°B', '📐', '#1a6fa8', '3f9a494e-0b90-4f84-898b-66efae34413b'),
  ('Lenguaje',    'Comprensión lectora',  '2°B', '📖', '#6c5ce7', '3f9a494e-0b90-4f84-898b-66efae34413b'),
  ('Ciencias',    'Biología y física',    '2°B', '🔬', '#2db88a', '3f9a494e-0b90-4f84-898b-66efae34413b'),
  ('Historia',    'Chile y el mundo',     '2°B', '🌍', '#e8a020', '3f9a494e-0b90-4f84-898b-66efae34413b');

-- ═══════════════════════════════════
-- INSCRIPCIONES (alumno en todos los cursos)
-- ═══════════════════════════════════
INSERT INTO inscripciones (alumno_id, curso_id, progreso)
SELECT
  '4fc32de6-da28-488b-a941-d64581482d0a',
  id,
  CASE nombre
    WHEN 'Matemáticas' THEN 45
    WHEN 'Lenguaje'    THEN 30
    WHEN 'Ciencias'    THEN 60
    WHEN 'Historia'    THEN 15
  END
FROM cursos;

-- ═══════════════════════════════════
-- LOGROS
-- ═══════════════════════════════════
INSERT INTO logros (nombre, descripcion, icono, xp_premio, categoria) VALUES
  ('Primera entrega', 'Entrega tu primera tarea',        '🎯', 50,  'inicio'),
  ('Dedicado',        'Entrega 5 tareas consecutivas',   '📚', 100, 'constancia'),
  ('Veloz',           'Entrega antes del plazo 3 veces', '⚡', 75,  'puntualidad'),
  ('Explorador',      'Descarga 10 materiales offline',  '🗺️', 60, 'offline'),
  ('Social',          'Envía 3 feedbacks',               '💬', 40,  'participacion');

-- ═══════════════════════════════════
-- PREMIOS (tienda de canjes)
-- ═══════════════════════════════════
INSERT INTO premios (nombre, descripcion, icono, categoria, precio_monedas) VALUES
  ('Cuaderno extra',      'Cuaderno universitario',    '📓', 'escolar',    15),
  ('Recreo libre 10min',  'Un recreo libre adicional', '⏰', 'recreativo', 30),
  ('Exención de tarea',   'Una tarea a elección',      '✅', 'educativo',  50),
  ('Sticker digital',     'Pack de stickers',          '🎨', 'digital',    5);

-- ═══════════════════════════════════
-- MATERIALES DE PRUEBA
-- ═══════════════════════════════════
INSERT INTO materiales (curso_id, docente_id, titulo, descripcion, tipo, publicado, xp_premio, fecha_entrega)
SELECT
  c.id,
  '3f9a494e-0b90-4f84-898b-66efae34413b',
  'Guía de ' || c.nombre || ' - Unidad 1',
  'Material introductorio de ' || c.nombre,
  'guia',
  TRUE,
  25,
  NULL
FROM cursos c;

INSERT INTO materiales (curso_id, docente_id, titulo, descripcion, tipo, publicado, xp_premio, fecha_entrega)
SELECT
  c.id,
  '3f9a494e-0b90-4f84-898b-66efae34413b',
  'Tarea 1 - ' || c.nombre,
  'Primera evaluación de ' || c.nombre,
  'tarea',
  TRUE,
  50,
  NOW() + INTERVAL '7 days'
FROM cursos c;
