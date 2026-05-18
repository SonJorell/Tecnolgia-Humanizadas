-- ═══════════════════════════════════
-- 003_fix_rls.sql — Arreglo Definitivo de RLS
-- ═══════════════════════════════════

-- 1. ELIMINAR TODAS LAS POLÍTICAS DE PERFILES DINÁMICAMENTE
-- Esto asegura que no quede ninguna política vieja causando el loop infinito.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'perfiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON perfiles', pol.policyname);
  END LOOP;
END $$;

-- 2. CREAR FUNCIÓN SEGURA PARA OBTENER ROL
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT rol FROM perfiles WHERE id = user_id;
$$;

-- 3. CREAR NUEVAS POLÍTICAS PARA PERFILES
-- Cualquiera autenticado puede leer perfiles (evita el loop de "Docente ve alumnos")
CREATE POLICY "perfiles_select_all" ON perfiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cada usuario actualiza solo su propio perfil
CREATE POLICY "perfiles_update_self" ON perfiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. ELIMINAR Y RECREAR LAS DE INSCRIPCIONES (para evitar conflictos)
DROP POLICY IF EXISTS "Alumno ve sus inscripciones" ON inscripciones;
DROP POLICY IF EXISTS "Docente ve inscripciones de sus cursos" ON inscripciones;
DROP POLICY IF EXISTS "Directivo ve todas las inscripciones" ON inscripciones;

CREATE POLICY "inscripciones_select_all" ON inscripciones
  FOR SELECT USING (auth.role() = 'authenticated');
