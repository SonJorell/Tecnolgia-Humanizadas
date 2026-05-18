# 🎨 PROMPT VISUAL — EduPlataforma v2.0
## Cómo debe verse esta aplicación | J2N Software

---

## IDENTIDAD VISUAL

**Nombre de la app:** EduPlataforma v2.0
**Eslogan:** "Tu escuela, sin límites"
**Tono visual:** Moderno, limpio, confiable y juvenil. No infantil, sino tecnológico y accesible.
**Referencia de estilo:** Notion + Linear + Duolingo. Minimalismo funcional con detalles de color que dan vida.

---

## PALETA DE COLORES

### Colores principales (Tailwind custom)
```javascript
// tailwind.config.ts
colors: {
  primary:   { DEFAULT: '#1a6fa8', light: '#3b9ed9', bg: '#e8f4fd' },  // Azul educativo
  mint:      { DEFAULT: '#2db88a', light: '#a8e6d4', bg: '#e4f7f1' },  // Verde éxito / progreso
  amber:     { DEFAULT: '#e8a020', light: '#fde8a0', bg: '#fff8e6' },  // Monedas / advertencias
  violet:    { DEFAULT: '#6c5ce7', light: '#9b8ef0', bg: '#f0edff' },  // Logros / gamificación
  danger:    { DEFAULT: '#e05050', bg: '#fff0f0' },                    // Errores / alertas
  surface:   '#f2f6fb',   // Fondo de la app
  card:      '#ffffff',   // Fondo de cards
  text: {
    DEFAULT: '#0d1b2a',   // Texto principal
    muted:   '#3d4f62',   // Texto secundario
    light:   '#718096',   // Texto terciario
  },
  border:    'rgba(0,0,0,0.08)',
}
```

### Modo oscuro
```css
.dark {
  --bg-surface: #131c28;
  --bg-card:    #1e2a3a;
  --bg-card2:   #1a2535;
  --text:       #e2eaf4;
  --text-muted: #94a8bc;
  --border:     rgba(255,255,255,0.09);
}
```

### Color por rol
```
Alumno:    --color-primary  (#1a6fa8) → azul
Docente:   --color-mint     (#2db88a) → verde
Directivo: --color-violet   (#6c5ce7) → violeta
```

---

## TIPOGRAFÍAS

```html
<!-- En index.html, dentro de <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet">
```

```css
:root {
  --font-display: 'Syne', sans-serif;    /* Títulos, números grandes, labels de nivel */
  --font-body:    'DM Sans', sans-serif; /* Todo el cuerpo de texto */
}
```

**Reglas tipográficas:**
- Títulos de página: Syne 800, 26px desktop / 22px móvil
- Títulos de sección: Syne 700, 18px
- Texto de botones y nav: DM Sans 500, 14px
- Cuerpo de texto: DM Sans 400, 15px
- Labels y badges: DM Sans 600, 12px uppercase con letter-spacing: 0.04em
- Números estadísticos: Syne 800, 32px desktop / 26px móvil

---

## ESPACIADO Y FORMA

```
Border Radius:
  sm:   8px   → botones, inputs, chips pequeños
  md:   12px  → cards medianas, tags, badges
  lg:   16px  → cards grandes, paneles
  xl:   20px  → modales, drawers
  full: 9999px → pills, avatares, indicadores

Sombras:
  card:    0 2px 16px rgba(0,0,0,0.06)
  hover:   0 6px 32px rgba(0,0,0,0.10)
  modal:   0 24px 80px rgba(0,0,0,0.25)
  topbar:  0 1px 12px rgba(0,0,0,0.06)

Padding de cards:
  desktop: 20px 22px
  tablet:  16px 18px
  móvil:   14px 15px
```

---

## LAYOUT GENERAL

```
┌─────────────────────────────────────────────┐
│  ConnBanner (36px) — estado de conexión      │ ← Fixed top, z-100
├─────────────────────────────────────────────┤
│  Topbar (60px desktop / 54px móvil)          │ ← Sticky, debajo del banner
├──────────────┬──────────────────────────────┤
│              │                              │
│  Sidebar     │      Contenido principal     │
│  (240px fijo │      (scroll independiente)  │
│  solo ≥900px)│                              │
│              │                              │
├──────────────┴──────────────────────────────┤
│  Bottom Nav (56px — solo <900px)             │ ← Fixed bottom, solo móvil
└─────────────────────────────────────────────┘
```

**Solo un scroll region:** el contenido principal. Sidebar y Topbar son fijos.

---

## COMPONENTE: ConnBanner

```
Posición: fixed top-0, full width, z-index 100
Altura: 36px
Font: DM Sans 500, 12px, color blanco
Padding: 0 16px
Transición de color: 0.5s ease

Estados:
┌─────────────────────────────────────────────────────┐
│ ✅ Verde #2db88a  │ "● Conectado · LAN activo · Supabase OK"  │
│ ⚠️ Ámbar #e8a020 │ "◐ Solo LAN · Guardando offline"          │
│ 🔴 Rojo  #e05050 │ "○ Sin conexión · Modo offline activo"    │
└─────────────────────────────────────────────────────┘
```

---

## COMPONENTE: Topbar

```
Altura: 60px desktop / 54px móvil
Fondo: var(--bg-card) con backdrop-filter: blur(12px)
Sombra: 0 1px 12px rgba(0,0,0,0.06)
Sticky: top: 36px (debajo del ConnBanner)
Padding: 0 20px desktop / 0 12px móvil

Izquierda:
  [Logo SVG 📚] [EduPlataforma] [Badge rol = "Alumno" / "Docente" / "Directivo"]
  
Derecha (desktop):
  [Chip LAN verde/rojo] [Sync ↑] [Toggle 🌙] [Avatar 32px] [Salir]

Derecha (móvil):
  [Estado punto de color] [Avatar 32px]
```

---

## COMPONENTE: Sidebar (≥900px)

```
Ancho: 240px, fijo, altura 100vh - 96px (topbar + banner)
Fondo: var(--bg-card)
Border right: 1px solid var(--border)
Overflow: hidden, no scroll propio

Secciones de arriba a abajo:
┌─────────────────────────────┐
│  [Avatar 44px] Nombre       │ ← Card con fondo surface
│  Rol: Alumno · Nivel 3      │
├─────────────────────────────┤
│  ○ Inicio                   │ ← Nav links
│  ○ Mis Cursos               │   Activo: fondo primary-bg, texto primary
│  ○ Tareas          [3]      │   Badge numérico ámbar
│  ○ Logros                   │
│  ○ Buscador                 │
│  ○ Feedback                 │
│  ○ Tienda        🪙 25      │
├─────────────────────────────┤
│  ━━ XP Bar (solo alumno) ━━ │ ← Gradiente azul→azul claro
│  🌟 Nivel 3 — Aprendiz      │   Texto blanco
│  150 / 300 XP               │   Barra ámbar sobre fondo blanco/20
│  🪙 25 monedas               │
├─────────────────────────────┤
│  Estado del sistema:        │ ← Card pequeña al fondo
│  📶 LAN: ✅  Wi-Fi: ✅      │
│  💾 Caché: 12 MB            │
│  🌐 Supabase: ✅            │
└─────────────────────────────┘
```

---

## COMPONENTE: XP Bar

```jsx
<div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl p-4">
  <p className="text-xs font-bold uppercase tracking-wider text-white/75">
    🌟 Nivel 3 — Aprendiz
  </p>
  <p className="text-sm font-semibold text-white mt-1 mb-2">
    150 / 300 XP
  </p>
  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700"
      style={{ width: '50%' }}
    />
  </div>
  <p className="text-white font-semibold text-sm mt-2">🪙 25 monedas</p>
</div>
```

---

## COMPONENTE: Stats Row

```
4 cols desktop → 2 cols tablet → 2 cols móvil
Gap: 16px

Cada stat card:
┌─────────────────────────────┐
│  [Icono 20px en caja 40px]  │ ← bg-primary-bg rounded-lg
│  "32"                       │ ← Syne 800, 26px
│  Cursos activos             │ ← DM Sans 400, 12px, text-muted
│  ↑ 4 nuevos esta semana     │ ← DM Sans 400, 11px, text-mint
└─────────────────────────────┘

Hover: translateY(-2px) + sombra upgrade
Transición: 200ms ease
```

---

## COMPONENTE: Curso Card

```
Border izquierdo: 4px solid [color único por asignatura]
  Matemáticas → #1a6fa8 (azul)
  Lenguaje    → #6c5ce7 (violeta)
  Ciencias    → #2db88a (mint)
  Historia    → #e8a020 (ámbar)

Hover: translateY(-3px) + shadow-hover

Estructura interna:
┌─────────────────────────────────────────────┐
│  📐 Matemáticas              Prof. García   │
│  2°B · 12 materiales                        │
│  ──────────────────────────────────────── │
│  Progreso: ████████░░░░ 65%                 │ ← 6px, gradiente azul→menta
│  [📶 Offline] [📱 Móvil] [🆕 Nuevo]        │ ← Tags pill
└─────────────────────────────────────────────┘
```

---

## COMPONENTE: Bottom Nav (móvil <900px)

```
Posición: fixed bottom-0, full width
Altura: 56px + padding-bottom: env(safe-area-inset-bottom)
Fondo: var(--bg-card)
Border top: 1px solid var(--border)
Sombra: 0 -4px 20px rgba(0,0,0,0.08)

5 ítems centrados:
  [Inicio]  [Cursos]  [Tareas]  [Logros]  [Tienda]
  Icono 20px + label 10px debajo
  Activo: color del rol (primary / mint / violet)
  Badge: círculo 16px naranja en esquina superior-derecha del ícono
```

---

## COMPONENTE: Toast Notifications

```
Posición: fixed bottom-24 right-6 (sobre bottom nav)
Border-radius: 12px
Sombra: 0 8px 32px rgba(0,0,0,0.18)
Padding: 12px 16px
Animación: slideUpFade (150ms ease-out desde abajo)
Auto-dismiss: 3 segundos

Variantes:
  Azul:   "✓ Tarea entregada correctamente"
  Ámbar:  "🌟 +50 XP · 🪙 +10 monedas"
  Verde:  "↑ 3 elementos sincronizados"

Stack automático: gap-2 entre múltiples toasts
```

---

## COMPONENTE: Barra de Progreso de Tarea

```css
/* Barra de upload de material — docente */
.upload-bar {
  height: 8px;
  background: rgba(0,0,0,0.06);
  border-radius: 9999px;
  overflow: hidden;
}
.upload-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a6fa8, #2db88a);
  border-radius: 9999px;
  transition: width 200ms ease;
}
/* Estado: 0% animando → 100% → "✓ Subido" con check verde */
```

---

## COMPONENTE: Logros Grid

```
Grid: 4 cols desktop / 3 cols tablet / 3 cols móvil
Gap: 12px

Medalla desbloqueada:
┌─────────────┐
│    🏆        │ ← Fondo dorado gradiente
│  Dedicado   │ ← Syne 700, 13px
│ 5 tareas   │ ← DM Sans 400, 11px, muted
└─────────────┘

Medalla bloqueada:
┌─────────────┐
│    🔒        │ ← Fondo gris, filtro grayscale
│  ???        │
│ 3 más       │ ← Tooltip al hover
└─────────────┘

Clic en desbloqueada → efecto confetti (canvas-confetti)
```

---

## COMPONENTE: Tienda de Canjes

```
Header:
  "Mi saldo: 🪙 25 monedas" — Syne 700, fondo primary-bg

Filtros (pills horizontales scrollables):
  [Todos] [Educativo] [Recreativo] [Escolar] [Digital] [Especial]

Premio Card:
┌────────────────────────────────┐
│  [Banner de color 60px alto]   │ ← Color por categoría
│  Categoría: EDUCATIVO          │ ← 10px uppercase
│  Cuaderno extra                │ ← Syne 700, 16px
│  Descripción breve             │ ← DM Sans 400, 13px
│  ─────────────────             │
│  🪙 15 monedas   [Canjear →]  │ ← Precio + botón
└────────────────────────────────┘

Modal de confirmación:
  Overlay blur
  "¿Confirmar canje?"
  Nombre del premio + precio
  [Cancelar] [Confirmar]
  → Confetti al confirmar
```

---

## ANIMACIONES REQUERIDAS

```css
/* XP Float: número flotante que sube y desaparece */
@keyframes xpFloat {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  80%  { opacity: 1; transform: translateY(-48px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-64px) scale(0.9); }
}
.xp-float {
  position: fixed;
  font-family: var(--font-display);
  font-weight: 800;
  color: #e8a020;
  font-size: 22px;
  pointer-events: none;
  animation: xpFloat 1.5s ease-out forwards;
  z-index: 9999;
}

/* Hover en cards */
.card-hover {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 32px rgba(0,0,0,0.10);
}

/* Toast slideUp */
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Barra de progreso fluida */
.progress-fill {
  transition: width 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ConnBanner color change */
.conn-banner {
  transition: background-color 500ms ease;
}
```

---

## RESPONSIVE BREAKPOINTS

```css
/* Mobile first — columna única, sin sidebar */
.app-layout { display: flex; flex-direction: column; }

@media (min-width: 640px) {
  .stats-row   { grid-template-columns: repeat(2, 1fr); }
  .cursos-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 900px) {
  .app-layout  { display: grid; grid-template-columns: 240px 1fr; }
  .sidebar     { display: flex; flex-direction: column; }
  .bottom-nav  { display: none; }
  .stats-row   { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1200px) {
  .app-layout  { max-width: 1200px; margin: 0 auto; }
  .canjes-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## LOGO SVG (Inline)

```svg
<!-- Logo principal — EduPlataforma -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="EduPlataforma logo">
  <!-- Libro base -->
  <rect x="4" y="8" width="24" height="18" rx="3" fill="#1a6fa8"/>
  <!-- Páginas -->
  <rect x="15" y="8" width="1.5" height="18" fill="white" opacity="0.4"/>
  <!-- Señal WiFi (LAN) arriba -->
  <path d="M11 5 Q16 2 21 5" stroke="#2db88a" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M13.5 7 Q16 5.5 18.5 7" stroke="#2db88a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <circle cx="16" cy="8.5" r="1" fill="#2db88a"/>
  <!-- Líneas de texto en el libro -->
  <rect x="7" y="14" width="6" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
  <rect x="7" y="17" width="5" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
  <rect x="19" y="14" width="6" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
  <rect x="19" y="17" width="4" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
</svg>
```

---

## PANTALLA DE LOGIN

```
Fondo: gradiente suave #f2f6fb → #e8f4fd
Centro de la pantalla, máximo 380px de ancho

┌──────────────────────────────────┐
│  [Logo 48px]                     │
│  EduPlataforma v2.0              │ ← Syne 800, 26px
│  "Tu escuela, sin límites"       │ ← DM Sans 400, 14px, text-muted
│                                  │
│  ┌──────────────────────────┐    │
│  │  📧 correo@escuela.cl   │    │ ← Input con icono
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │  🔒 ••••••••             │    │
│  └──────────────────────────┘    │
│  [         Ingresar          ]    │ ← Botón full-width, primary
│                                  │
│  ● Estado: Conectado a Supabase  │ ← Indicador de conectividad
└──────────────────────────────────┘

Card con sombra modal, border-radius xl
```

---

## CONVENCIONES VISUALES GENERALES

- **Sin bordes de color lateral en cards** — usar elevación de superficie
- **Íconos sin fondo decorativo** — directamente en contexto, tamaño 20px
- **Texto centrado solo en estadísticas y héroe** — todo lo demás alineado a la izquierda
- **Un solo color de acento por pantalla** — el del rol activo
- **Gradientes solo en XP Bar, banners de premios y ConnBanner**
- **Modo oscuro con bg-card: #1e2a3a** — no negro puro
- **Touch targets mínimo 44px** — todos los botones e ítems de nav
- **Focus ring visible** — 2px solid primary, offset 3px

---

*J2N Software — Jorell Inostroza · Nicolás Ponce · Juan David Churata*
*EduPlataforma v2.0 · Santo Tomás Arica 2026*
