# 📚 EduPlataforma v2.0

> **Tu escuela, sin límites** — Plataforma educativa PWA para colegios con funcionamiento offline-first y sincronización automática en la nube.






***

## 🚀 ¿Qué es EduPlataforma?

EduPlataforma v2.0 es una **Progressive Web App (PWA)** educativa diseñada para colegios que operan en entornos con conectividad limitada. Funciona en dos modos simultáneos:

- **Modo LAN offline-first (primario):** Todo el contenido —guías, tareas, archivos— se sirve desde caché local usando Service Workers e IndexedDB. No requiere internet. Los alumnos acceden desde su smartphone o PC conectados solo al Wi-Fi del colegio.
- **Modo Supabase Cloud (respaldo/sync):** Cuando hay internet disponible, la app sincroniza automáticamente usuarios, archivos, tareas y calificaciones hacia Supabase (PostgreSQL en la nube).

***

## ✨ Funcionalidades principales

### 🎒 Alumno
- Dashboard con estadísticas de cursos, tareas, logros y monedas
- Visualización y descarga offline de materiales (PDFs, guías, recursos)
- Entrega de tareas con texto y archivo adjunto (funciona sin internet)
- Sistema de **logros desbloqueables** con confetti y animaciones
- **Buscador offline** sobre materiales descargados en IndexedDB
- Formulario de feedback con rating y +5 monedas de recompensa
- **Tienda de canjes** con premios educativos y recreativos

### 👩‍🏫 Docente
- Panel de control con alumnos activos y tareas pendientes de revisión
- Carga de materiales con **drag & drop** y subida real a Supabase Storage
- Tabla de alumnos con progreso inline y detalle individual
- Dashboard de rendimiento con Chart.js (progreso por asignatura, distribución de notas)
- Gestión de feedbacks y reportes

### 🏫 Directivo
- KPIs globales del colegio en tiempo real
- Análisis de rendimiento con evolución mensual
- Estado de infraestructura (servidor LAN, Supabase, dispositivos en red)
- Sistema de alertas categorizadas (info / warning / success / error)

***

## 🛠️ Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilos | Tailwind CSS v3 (paleta custom) |
| Tipografías | Syne + DM Sans (Google Fonts) |
| Íconos | Lucide React |
| Estado global | Zustand |
| Routing | React Router v6 |
| PWA | vite-plugin-pwa + Workbox |
| Offline DB | IndexedDB via `idb` |
| Backend | Supabase (Auth + PostgreSQL + Storage + Realtime) |
| Servidor LAN | Node.js + Express |

***

## ⚡ Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/j2n-software/eduplataforma-v2.git
cd eduplataforma-v2
npm install
```

### 2. Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://slmbeartbgkihoznylly.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TKXdtfKSmH12SYNZAOBjRg_dqwCfa14
VITE_LAN_SERVER_URL=http://192.168.1.50
VITE_APP_NAME=EduPlataforma v2.0
VITE_APP_SHORT_NAME=EduPlata
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

### 4. Build para producción / LAN

```bash
npm run build          # genera /dist
node server/index.js   # sirve en http://192.168.1.50
```

***

## 🗄️ Base de datos

El esquema completo está en `supabase/migrations/`. Para aplicarlo:

1. Accede al **SQL Editor** de tu proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `001_init.sql` (tablas)
3. Ejecuta `002_rls.sql` (políticas Row Level Security)
4. Ejecuta `seed.sql` (datos de prueba)

### Tablas del sistema

```
perfiles         → Usuarios (alumno / docente / directivo)
cursos           → Asignaturas y cursos del colegio
inscripciones    → Relación alumno ↔ curso con progreso
materiales       → Archivos subidos por docentes
entregas         → Tareas entregadas por alumnos
logros           → Definición de logros desbloqueables
logros_alumno    → Logros desbloqueados por alumno
premios          → Catálogo de la tienda de canjes
canjes           → Historial de canjes realizados
feedback         → Retroalimentación de alumnos
```

### Storage buckets (crear en Supabase Dashboard → Storage)

| Bucket | Acceso | Max archivo |
|--------|--------|-------------|
| `materiales-docentes` | Privado | 50 MB |
| `entregas-alumnos` | Privado | 20 MB |
| `avatares` | Público | 2 MB |

***

## 👥 Usuarios de prueba

Crear en Supabase Auth y luego insertar `seed.sql`:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Alumno | nombre.apellido@escuela.cl | 1234 |
| Docente | profesor@escuela.cl | 1234 |
| Directivo | director@escuela.cl | 1234 |

***

## 📡 Modos de conexión

La app detecta automáticamente el estado de red cada 10 segundos:

```
🟢 ONLINE_SUPABASE  → Conectado a internet y Supabase activo
🟡 ONLINE_LAN_ONLY  → Solo Wi-Fi local, sin internet (modo offline)
🔴 OFFLINE_TOTAL    → Sin ninguna conexión (caché del SW)
```

El **ConnBanner** (banda de 36px en la parte superior) cambia de color automáticamente para que el usuario siempre sepa en qué modo está.

***

## 🔄 Sincronización offline

Cuando el alumno trabaja sin internet, las acciones se guardan en **IndexedDB** en una cola de sincronización. Al detectar conexión a internet:

1. La cola se procesa automáticamente en background
2. Las entregas, progresos, feedback y monedas se suben a Supabase
3. Se muestra un toast verde: *"✅ 3 tareas y 2 materiales sincronizados"*

***

## 🎮 Sistema de Gamificación

| Acción | XP | Monedas |
|--------|----|---------|
| Entregar tarea a tiempo | +50 XP | +10 🪙 |
| Entregar tarea tarde | +20 XP | +4 🪙 |
| Desbloquear logro | +50-100 XP | — |
| Enviar feedback | — | +5 🪙 |
| Descargar material offline | +5 XP | — |

Los logros se desbloquean automáticamente al cumplir condiciones (5 tareas consecutivas, 3 entregas antes del plazo, etc.) y muestran una animación de confetti.

***

## 🏫 Despliegue en el colegio (Servidor LAN)

```bash
# 1. En la PC del laboratorio (Windows/Linux/macOS)
npm run build
node server/index.js

# 2. En cada dispositivo del colegio (misma red Wi-Fi)
# Abrir en Chrome/Safari: http://192.168.1.50

# 3. Instalar como PWA
# → Chrome: menú ⋮ → "Instalar EduPlata"
# → Safari: compartir → "Agregar a pantalla de inicio"
```

**Requisitos del servidor LAN:**
- Cualquier PC con 2 GB de RAM
- Windows, Linux o macOS
- Conectado al Wi-Fi del colegio
- Puerto 80 disponible

***

## 📱 PWA — Requisitos técnicos

- ✅ Service Worker con Workbox (CacheFirst + NetworkFirst)
- ✅ `manifest.json` completo (nombre, íconos, theme_color)
- ✅ Funciona 100% offline una vez instalada
- ✅ Instalable en Android y iOS
- ✅ Lighthouse PWA score ≥ 90

***

## 🎨 Diseño Visual

**Paleta de colores:**

| Color | Hex | Uso |
|-------|-----|-----|
| Primary (Azul) | `#1a6fa8` | Rol alumno, botones principales, links |
| Mint (Verde) | `#2db88a` | Rol docente, progreso, éxito |
| Amber (Ámbar) | `#e8a020` | Monedas, advertencias, XP |
| Violet (Violeta) | `#6c5ce7` | Rol directivo, logros, gamificación |
| Danger (Rojo) | `#e05050` | Errores, alertas críticas |

**Tipografías:**
- **Syne** (600/700/800) → Títulos, números, labels de nivel
- **DM Sans** (300/400/500/600) → Todo el cuerpo de texto

**Responsive:** Mobile-first. Breakpoints en 640px / 900px / 1200px.

***

## 📁 Estructura del proyecto

```
eduplataforma-v2/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── lib/           # supabase.ts · indexeddb.ts · sync.ts · connectivity.ts
│   ├── stores/        # authStore.ts · appStore.ts · syncStore.ts (Zustand)
│   ├── hooks/         # useAuth · useOffline · useSync · useRealtime
│   ├── components/
│   │   ├── layout/    # ConnBanner · Topbar · Sidebar · BottomNav
│   │   ├── ui/        # Card · Button · Badge · Toast · Modal · StatCard
│   │   └── gamification/ # XPBar · LogroCard · CanjeCard · XPFloat
│   ├── pages/
│   │   ├── alumno/    # Inicio · Cursos · Tareas · Logros · Buscador · Feedback · Tienda
│   │   ├── docente/   # Panel · Alumnos · Materiales · Dashboard · Reportes
│   │   └── directivo/ # Resumen · Rendimiento · Infraestructura · Alertas
│   └── types/
├── supabase/
│   └── migrations/    # 001_init.sql · 002_rls.sql · seed.sql
├── server/
│   └── index.js       # Servidor Express para LAN
├── .env.local
├── vite.config.ts
└── tailwind.config.ts
```

***

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas de Supabase
- Cada rol solo accede a los datos que le corresponden
- JWT persiste en `localStorage` para sesiones offline
- Rutas de React protegidas por guards de rol
- Archivos de Storage en buckets privados (excepto avatares)

***

## 🤝 Equipo

**J2N Software — Tecnologías Humanizadas**

| Nombre | Rol |
|--------|-----|
| Jorell Inostroza | Desarrollo Full Stack · Arquitectura |
| Nicolás Ponce | Frontend · Diseño UI/UX |
| Juan David Churata | Backend · Base de Datos |

*Proyecto académico — Santo Tomás Arica · 2026*

***

## 📄 Licencia

MIT © 2026 J2N Software

***

> 💡 **¿Dudas o sugerencias?** Abre un [Issue](https://github.com/j2n-software/eduplataforma-v2/issues) o contáctanos directamente.
