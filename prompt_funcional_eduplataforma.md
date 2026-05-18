# 🧠 PROMPT FUNCIONAL — EduPlataforma v2.0
## Cómo debe funcionar esta aplicación | J2N Software

---

## CONTEXTO GENERAL

Construye **EduPlataforma v2.0**, una **Progressive Web App (PWA)** educativa completa para colegios, con funcionamiento **dual**: modo LAN offline-first (primario) y sincronización con **Supabase Cloud** (respaldo automático).

---

## CREDENCIALES SUPABASE (PRODUCCIÓN)

```env
VITE_SUPABASE_URL=https://slmbeartbgkihoznylly.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14
VITE_SUPABASE_REST_URL=https://slmbeartbgkihoznylly.supabase.co/rest/v1/
```

### Configuración del cliente Supabase (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://slmbeartbgkihoznylly.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export const SUPABASE_REST = 'https://slmbeartbgkihoznylly.supabase.co/rest/v1/'
```

---

## STACK TÉCNICO

```
Frontend:     React 18 + TypeScript + Vite 5
Estilos:      Tailwind CSS v3 (con colores custom)
Tipografías:  Syne (títulos) + DM Sans (cuerpo) — Google Fonts
Íconos:       Lucide React
Estado:       Zustand
Routing:      React Router v6
PWA:          Vite PWA Plugin + Workbox
Offline DB:   IndexedDB (idb library)
Backend:      Supabase (Auth + PostgreSQL + Storage + Realtime)
Servidor LAN: Node.js + Express
```

---

## ARQUITECTURA DEL SISTEMA

```
Dispositivos del colegio (smartphone, PC, tablet)
          │
          ├── Sin internet → IndexedDB local (Service Worker)
          │
          └── Con internet → Supabase Cloud
                              ├── Auth (usuarios y roles)
                              ├── Storage (archivos PDF, docs)
                              └── PostgreSQL
                                    ├── perfiles
                                    ├── cursos
                                    ├── inscripciones
                                    ├── materiales
                                    ├── entregas
                                    ├── logros / logros_alumno
                                    ├── premios / canjes
                                    └── feedback
```

**Flujo dual:**
- **Solo LAN**: Service Worker sirve la app desde caché. Datos en IndexedDB. Sin internet.
- **Con internet**: Sincronización automática de IndexedDB hacia Supabase al recuperar conexión.

---

## BASE DE DATOS — ESQUEMA SQL COMPLETO

Ejecutar en Supabase SQL Editor:

```sql
-- TABLA: perfiles (extiende auth.users)
CREATE TABLE perfiles (
  id          UUID REFERENCES auth.users PRIMARY KEY,
  nombre      TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('alumno','docente','directivo')),
  curso_id    UUID,
  avatar_url  TEXT,
  xp          INTEGER DEFAULT 0,
  monedas     INTEGER DEFAULT 0,
  nivel       INTEGER DEFAULT 1,
  creado_en   TIMESTAMPTZ DEFAULT NOW(),
  actualizado TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: cursos
CREATE TABLE cursos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  docente_id  UUID REFERENCES perfiles(id),
  nivel       TEXT,
  icono       TEXT,
  color       TEXT,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- FK diferida (perfiles → cursos se crea después de cursos)
ALTER TABLE perfiles ADD CONSTRAINT perfiles_curso_id_fkey
  FOREIGN KEY (curso_id) REFERENCES cursos(id);

-- TABLA: inscripciones
CREATE TABLE inscripciones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id   UUID REFERENCES perfiles(id),
  curso_id    UUID REFERENCES cursos(id),
  progreso    INTEGER DEFAULT 0,
  inscrito_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, curso_id)
);

-- TABLA: materiales
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

-- TABLA: entregas
CREATE TABLE entregas (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id   UUID REFERENCES materiales(id),
  alumno_id     UUID REFERENCES perfiles(id),
  contenido     TEXT,
  archivo_url   TEXT,
  calificacion  NUMERIC(4,1),
  comentario    TEXT,
  estado        TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','entregado','revisado','tardio')),
  sincronizado  BOOLEAN DEFAULT FALSE,
  entregado_en  TIMESTAMPTZ DEFAULT NOW(),
  revisado_en   TIMESTAMPTZ
);

-- TABLA: logros
CREATE TABLE logros (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  icono       TEXT,
  xp_premio   INTEGER DEFAULT 50,
  categoria   TEXT
);

-- TABLA: logros_alumno
CREATE TABLE logros_alumno (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id    UUID REFERENCES perfiles(id),
  logro_id     UUID REFERENCES logros(id),
  desbloqueado TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, logro_id)
);

-- TABLA: premios (tienda de canjes)
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

-- TABLA: canjes
CREATE TABLE canjes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id        UUID REFERENCES perfiles(id),
  premio_id        UUID REFERENCES premios(id),
  monedas_gastadas INTEGER,
  estado           TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
  canjeado_en      TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: feedback
CREATE TABLE feedback (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  autor_id    UUID REFERENCES perfiles(id),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  categorias  TEXT[],
  comentario  TEXT,
  resuelto    BOOLEAN DEFAULT FALSE,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ROW LEVEL SECURITY (RLS)

```sql
-- Habilitar RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE canjes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logros_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve el propio
CREATE POLICY "Ver propio perfil"
  ON perfiles FOR SELECT USING (auth.uid() = id);

-- Docentes ven alumnos
CREATE POLICY "Docente ve sus alumnos"
  ON perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p WHERE p.id = auth.uid() AND p.rol = 'docente'
    )
  );

-- Materiales: alumno ve los de sus cursos
CREATE POLICY "Alumno ve materiales de sus cursos"
  ON materiales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inscripciones i
      WHERE i.alumno_id = auth.uid()
      AND i.curso_id = materiales.curso_id
      AND materiales.publicado = TRUE
    )
  );

-- Docente gestiona sus materiales
CREATE POLICY "Docente gestiona sus materiales"
  ON materiales FOR ALL USING (docente_id = auth.uid());

-- Entregas
CREATE POLICY "Alumno gestiona sus entregas"
  ON entregas FOR ALL USING (alumno_id = auth.uid());

CREATE POLICY "Docente ve entregas de su curso"
  ON entregas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM materiales m
      JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = entregas.material_id
      AND c.docente_id = auth.uid()
    )
  );
```

---

## SUPABASE STORAGE — BUCKETS

```
Bucket: materiales-docentes
  Acceso: private
  Max por archivo: 50 MB
  Tipos: application/pdf, image/*, video/mp4, .docx, .pptx
  Ruta: /cursos/{curso_id}/{material_id}/{filename}

Bucket: entregas-alumnos
  Acceso: private
  Max: 20 MB
  Ruta: /entregas/{entrega_id}/{filename}

Bucket: avatares
  Acceso: public
  Max: 2 MB
  Tipos: image/jpeg, image/png, image/webp
```

---

## AUTENTICACIÓN

```typescript
// src/stores/authStore.ts — Zustand
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loadPerfil: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  perfil: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ user: data.user })
    await get().loadPerfil()
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, perfil: null })
  },

  loadPerfil: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()
    set({ user, perfil: data, loading: false })
  }
}))

// Inicializar sesión al cargar
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    useAuthStore.getState().loadPerfil()
  }
})
```

**Flujo de autenticación:**
1. Login con email/password → Supabase Auth
2. JWT guardado en localStorage → sesión persiste
3. Sin internet → JWT existente permite uso offline
4. Al reconectar → token se valida automáticamente

**Credenciales de prueba (seed.sql):**
```
Alumno:    sofia.mendez@escuela.cl     / alumno123
Docente:   carmen.garcia@escuela.cl   / docente123
Directivo: roberto.vasquez@escuela.cl / directivo123
```

---

## DETECCIÓN DE CONECTIVIDAD (3 ESTADOS)

```typescript
// src/lib/connectivity.ts
export type EstadoConexion = 'ONLINE_SUPABASE' | 'ONLINE_LAN_ONLY' | 'OFFLINE_TOTAL'

export async function detectarConexion(): Promise<EstadoConexion> {
  if (!navigator.onLine) return 'OFFLINE_TOTAL'

  try {
    // Ping a Supabase REST API (con credenciales reales)
    const res = await fetch(
      'https://slmbeartbgkihoznylly.supabase.co/rest/v1/',
      {
        headers: {
          'apikey': 'sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14',
          'Authorization': 'Bearer sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14'
        },
        signal: AbortSignal.timeout(3000)
      }
    )
    if (res.ok || res.status === 200) return 'ONLINE_SUPABASE'
  } catch (_) {}

  // Verificar LAN local
  try {
    await fetch('http://192.168.1.50/ping', { signal: AbortSignal.timeout(1000) })
    return 'ONLINE_LAN_ONLY'
  } catch (_) {}

  return 'OFFLINE_TOTAL'
}

// Polling cada 10 segundos
export function iniciarMonitoreoConexion(callback: (estado: EstadoConexion) => void) {
  const check = async () => callback(await detectarConexion())
  check()
  const interval = setInterval(check, 10_000)
  window.addEventListener('online', check)
  window.addEventListener('offline', check)
  return () => {
    clearInterval(interval)
    window.removeEventListener('online', check)
    window.removeEventListener('offline', check)
  }
}
```

---

## SINCRONIZACIÓN OFFLINE ↔ SUPABASE

```typescript
// src/lib/sync.ts
import { supabase } from './supabase'
import { idb } from './indexeddb'

interface SyncItem {
  id: string
  tipo: 'entrega' | 'progreso' | 'feedback' | 'monedas'
  payload: Record<string, unknown>
  creadoEn: Date
  intentos: number
}

export async function procesarColaSync() {
  const items: SyncItem[] = await idb.getAll('sync_queue')
  const pendientes = items.filter(i => i.intentos < 3)

  for (const item of pendientes) {
    try {
      switch (item.tipo) {
        case 'entrega':
          await supabase.from('entregas').upsert(item.payload)
          break
        case 'progreso':
          await supabase.from('inscripciones')
            .update({ progreso: item.payload.progreso })
            .eq('alumno_id', item.payload.alumno_id)
            .eq('curso_id', item.payload.curso_id)
          break
        case 'feedback':
          await supabase.from('feedback').insert(item.payload)
          break
        case 'monedas':
          await supabase.from('perfiles')
            .update({ monedas: item.payload.monedas, xp: item.payload.xp })
            .eq('id', item.payload.user_id)
          break
      }
      await idb.delete('sync_queue', item.id)
    } catch (err) {
      await idb.put('sync_queue', { ...item, intentos: item.intentos + 1 })
    }
  }
}

// Auto-sync al recuperar conexión
window.addEventListener('online', async () => {
  await procesarColaSync()
  // mostrar toast con cantidad de items sincronizados
})
```

---

## FUNCIONALIDADES POR ROL

### 🎒 ALUMNO (7 vistas)

| Vista | Funcionalidad |
|-------|---------------|
| **Inicio** | Stats: cursos activos, tareas pendientes, logros, monedas. Alertas de sync pendiente. |
| **Cursos** | Grid de cursos inscritos. Ver materiales por curso. Visor inline de PDF. |
| **Tareas** | Lista con fechas de entrega. Completar con texto + archivo. Guardar offline → auto-sync. |
| **Logros** | Grid 4×3 de medallas. Bloqueadas en grayscale. Confetti al desbloquear. |
| **Buscador** | Búsqueda instantánea en IndexedDB. Filtros por asignatura y tipo. |
| **Feedback** | Rating con emojis (😞→🤩). Multi-selección de categorías. +5 monedas al enviar. |
| **Tienda** | Saldo de monedas en tiempo real. Filtros por categoría. Modal confirmación + confetti. |

### 👩‍🏫 DOCENTE (5 vistas)

| Vista | Funcionalidad |
|-------|---------------|
| **Panel** | Stats alumnos activos, tareas por revisar, promedio progreso. |
| **Alumnos** | Tabla con barra de progreso inline. Detalle por alumno: cursos, notas. |
| **Materiales** | Drag & drop → Supabase Storage. Progreso de upload real. Publicar/borrador. |
| **Dashboard** | Gráficos de progreso por asignatura. Distribución de notas. Activos vs inactivos. |
| **Reportes** | Feedbacks con rating. Filtros. Marcar como resuelto. |

### 🏫 DIRECTIVO (4 vistas)

| Vista | Funcionalidad |
|-------|---------------|
| **Resumen** | KPIs globales. Tabla de cursos con progreso. Métricas de uso. |
| **Rendimiento** | Evolución mensual de promedios. Top cursos. Cursos con alerta. |
| **Infraestructura** | Estado servidor LAN. Uso Supabase free tier. Dispositivos activos. |
| **Alertas** | Sistema categorizado: info/warning/success/error. Historial. |

---

## GAMIFICACIÓN (XP + MONEDAS)

```typescript
// src/lib/gamification.ts
export async function otorgarXP(userId: string, cantidad: number) {
  const monedas = Math.floor(cantidad / 5)

  // 1. Actualizar IndexedDB inmediatamente (offline-first)
  await idb.update('perfil:' + userId, (perfil) => ({
    ...perfil,
    xp: perfil.xp + cantidad,
    monedas: perfil.monedas + monedas,
  }))

  // 2. Agregar a cola de sync
  await syncQueue.agregar({
    tipo: 'monedas',
    payload: { user_id: userId, xp: cantidad, monedas }
  })

  // 3. Mostrar animación flotante "+XP ✨"
  mostrarFloatXP(cantidad)

  // 4. Verificar logros desbloqueados
  await verificarLogros(userId)

  // 5. Sincronizar si hay internet
  if (navigator.onLine) await procesarColaSync()
}

// XP por actividad:
// Entregar tarea a tiempo: +50 XP → +10 monedas
// Entregar tarea tarde:    +20 XP → +4 monedas
// Desbloquear logro:       +logro.xp_premio XP
// Enviar feedback:         +5 monedas
```

---

## UPLOAD DE MATERIALES (DOCENTE)

```typescript
// src/pages/docente/Materiales.tsx
async function subirMaterial(file: File, metadata: MaterialMeta) {
  // 1. Comprimir imagen si aplica (canvas API, max 800px)
  const fileOptimizado = file.type.startsWith('image/') 
    ? await comprimirImagen(file, 800) 
    : file

  // 2. Upload a Supabase Storage con progreso
  const path = `cursos/${metadata.cursoId}/${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage
    .from('materiales-docentes')
    .upload(path, fileOptimizado, {
      onUploadProgress: (progress) => {
        const pct = Math.round((progress.loaded / progress.total) * 100)
        setUploadProgress(pct)
      }
    })

  if (error) throw error

  // 3. Guardar metadata en tabla materiales
  const { error: dbError } = await supabase.from('materiales').insert({
    ...metadata,
    archivo_url: data.path,
    archivo_nombre: file.name,
    archivo_size: file.size,
  })

  if (dbError) throw dbError

  // 4. Notificar via Realtime a alumnos conectados
  await supabase.channel('nuevos-materiales').send({
    type: 'broadcast',
    event: 'nuevo-material',
    payload: { cursoId: metadata.cursoId, titulo: metadata.titulo }
  })
}
```

---

## SERVICE WORKER (PWA)

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/slmbeartbgkihoznylly\.supabase\.co\/rest\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-data',
          networkTimeoutSeconds: 5,
          expiration: { maxAgeSeconds: 86400 } // 1 día
        }
      },
      {
        urlPattern: /^https:\/\/slmbeartbgkihoznylly\.supabase\.co\/storage\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'materiales-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 604800 } // 7 días
        }
      }
    ]
  }
})
```

---

## SERVIDOR LAN LOCAL

```javascript
// server/index.js
const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, '../dist')))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  next()
})
app.get('/ping', (req, res) => res.json({ status: 'ok' }))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(80, '0.0.0.0', () => {
  console.log('EduPlataforma en http://192.168.1.50')
})
```

---

## VARIABLES DE ENTORNO (.env.local)

```env
VITE_SUPABASE_URL=https://slmbeartbgkihoznylly.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14
VITE_LAN_SERVER_URL=http://192.168.1.50
VITE_APP_NAME=EduPlataforma v2.0
VITE_APP_SHORT_NAME=EduPlata
```

---

## COMANDOS DE INSTALACIÓN

```bash
npm create vite@latest eduplataforma-v2 -- --template react-ts
cd eduplataforma-v2
npm install @supabase/supabase-js idb zustand react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
npm run dev    # → http://localhost:5173
npm run build  # → /dist
node server/index.js  # → http://192.168.1.50
```

---

*J2N Software — Jorell Inostroza · Nicolás Ponce · Juan David Churata*
*EduPlataforma v2.0 · Santo Tomás Arica 2026*
