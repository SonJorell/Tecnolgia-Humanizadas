-- ═══════════════════════════════════
-- 002_rls.sql — Row Level Security (CORREGIDO)
-- EduPlataforma v2.0
-- ═══════════════════════════════════

-- LIMPIAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Ver propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Docente ve alumnos" ON perfiles;
DROP POLICY IF EXISTS "Directivo ve todo" ON perfiles;
DROP POLICY IF EXISTS "Actualizar propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Todos ven cursos" ON cursos;
DROP POLICY IF EXISTS "Docente gestiona sus cursos" ON cursos;
DROP POLICY IF EXISTS "Alumno ve sus inscripciones" ON inscripciones;
DROP POLICY IF EXISTS "Docente ve inscripciones de sus cursos" ON inscripciones;
DROP POLICY IF EXISTS "Directivo ve todas las inscripciones" ON inscripciones;
DROP POLICY IF EXISTS "Alumno ve materiales" ON materiales;
DROP POLICY IF EXISTS "Alumno ve materiales publicados de sus cursos" ON materiales;
DROP POLICY IF EXISTS "Docente gestiona materiales" ON materiales;
DROP POLICY IF EXISTS "Docente gestiona sus materiales" ON materiales;
DROP POLICY IF EXISTS "Directivo ve todos los materiales" ON materiales;
DROP POLICY IF EXISTS "Alumno gestiona entregas" ON entregas;
DROP POLICY IF EXISTS "Alumno gestiona sus entregas" ON entregas;
DROP POLICY IF EXISTS "Docente ve entregas" ON entregas;
DROP POLICY IF EXISTS "Docente ve entregas de sus cursos" ON entregas;
DROP POLICY IF EXISTS "Docente califica" ON entregas;
DROP POLICY IF EXISTS "Docente califica entregas" ON entregas;
DROP POLICY IF EXISTS "Directivo ve todas las entregas" ON entregas;
DROP POLICY IF EXISTS "Todos ven logros" ON logros;
DROP POLICY IF EXISTS "Alumno ve sus logros" ON logros_alumno;
DROP POLICY IF EXISTS "Directivo ve todos los logros" ON logros_alumno;
DROP POLICY IF EXISTS "Todos ven premios" ON premios;
DROP POLICY IF EXISTS "Alumno gestiona sus canjes" ON canjes;
DROP POLICY IF EXISTS "Directivo ve todos los canjes" ON canjes;
DROP POLICY IF EXISTS "Alumno crea su feedback" ON feedback;
DROP POLICY IF EXISTS "Alumno ve su feedback" ON feedback;
DROP POLICY IF EXISTS "Docente ve todo el feedback" ON feedback;
DROP POLICY IF EXISTS "Docente actualiza feedback" ON feedback;
DROP POLICY IF EXISTS "Directivo ve todo el feedback" ON feedback;

DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Función auxiliar para obtener el rol sin recursión RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT rol FROM perfiles WHERE id = user_id;
$$;

-- ═══════════════════════════════════
-- Habilitar RLS en todas las tablas
-- ═══════════════════════════════════
ALTER TABLE perfiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales    ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE canjes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE logros        ENABLE ROW LEVEL SECURITY;
ALTER TABLE logros_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE premios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback      ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════
-- PERFILES
-- ═══════════════════════════════════
-- Cualquier autenticado puede ver su propio perfil
CREATE POLICY "Ver propio perfil" ON perfiles
  FOR SELECT USING (auth.uid() = id);

-- Docente puede ver todos los perfiles de alumnos
CREATE POLICY "Docente ve alumnos" ON perfiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'docente');

-- Directivo puede ver todos los perfiles
CREATE POLICY "Directivo ve todo" ON perfiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Actualizar propio perfil" ON perfiles
  FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════
-- CURSOS (lectura pública para autenticados)
-- ═══════════════════════════════════
CREATE POLICY "Todos ven cursos" ON cursos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Docente gestiona sus cursos" ON cursos
  FOR ALL USING (docente_id = auth.uid());

-- ═══════════════════════════════════
-- INSCRIPCIONES
-- ═══════════════════════════════════
CREATE POLICY "Alumno ve sus inscripciones" ON inscripciones
  FOR SELECT USING (alumno_id = auth.uid());

CREATE POLICY "Docente ve inscripciones de sus cursos" ON inscripciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cursos c WHERE c.id = inscripciones.curso_id AND c.docente_id = auth.uid()
    )
  );

CREATE POLICY "Directivo ve todas las inscripciones" ON inscripciones
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');

-- ═══════════════════════════════════
-- MATERIALES
-- ═══════════════════════════════════
CREATE POLICY "Alumno ve materiales publicados de sus cursos" ON materiales
  FOR SELECT USING (
    publicado = TRUE AND EXISTS (
      SELECT 1 FROM inscripciones i
      WHERE i.alumno_id = auth.uid() AND i.curso_id = materiales.curso_id
    )
  );

CREATE POLICY "Docente gestiona sus materiales" ON materiales
  FOR ALL USING (docente_id = auth.uid());

CREATE POLICY "Directivo ve todos los materiales" ON materiales
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');

-- ═══════════════════════════════════
-- ENTREGAS
-- ═══════════════════════════════════
CREATE POLICY "Alumno gestiona sus entregas" ON entregas
  FOR ALL USING (alumno_id = auth.uid());

CREATE POLICY "Docente ve entregas de sus cursos" ON entregas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM materiales m
      JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = entregas.material_id AND c.docente_id = auth.uid()
    )
  );

CREATE POLICY "Docente califica entregas" ON entregas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM materiales m
      JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = entregas.material_id AND c.docente_id = auth.uid()
    )
  );

CREATE POLICY "Directivo ve todas las entregas" ON entregas
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');

-- ═══════════════════════════════════
-- LOGROS (lectura pública)
-- ═══════════════════════════════════
CREATE POLICY "Todos ven logros" ON logros
  FOR SELECT USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════
-- LOGROS_ALUMNO
-- ═══════════════════════════════════
CREATE POLICY "Alumno ve sus logros" ON logros_alumno
  FOR SELECT USING (alumno_id = auth.uid());

CREATE POLICY "Directivo ve todos los logros" ON logros_alumno
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');

-- ═══════════════════════════════════
-- PREMIOS (lectura pública)
-- ═══════════════════════════════════
CREATE POLICY "Todos ven premios" ON premios
  FOR SELECT USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════
-- CANJES
-- ═══════════════════════════════════
CREATE POLICY "Alumno gestiona sus canjes" ON canjes
  FOR ALL USING (alumno_id = auth.uid());

CREATE POLICY "Directivo ve todos los canjes" ON canjes
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');

-- ═══════════════════════════════════
-- FEEDBACK
-- ═══════════════════════════════════
CREATE POLICY "Alumno crea su feedback" ON feedback
  FOR INSERT WITH CHECK (autor_id = auth.uid());

CREATE POLICY "Alumno ve su feedback" ON feedback
  FOR SELECT USING (autor_id = auth.uid());

CREATE POLICY "Docente ve todo el feedback" ON feedback
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'docente');

CREATE POLICY "Docente actualiza feedback" ON feedback
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'docente');

CREATE POLICY "Directivo ve todo el feedback" ON feedback
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'directivo');
