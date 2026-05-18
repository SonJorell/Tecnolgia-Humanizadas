import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { useSyncStore } from '../../stores/syncStore'
import {
  Home, BookOpen, ClipboardList, Trophy, Search, MessageSquare, ShoppingBag,
  LayoutDashboard, Users, Upload, BarChart3, FileText,
  Building2, TrendingUp, Server, Bell, LogOut, Wifi, WifiOff, Database, HardDrive
} from 'lucide-react'

const NAV_ITEMS: Record<string, { path: string; label: string; icon: React.ReactNode }[]> = {
  alumno: [
    { path: '/alumno', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/alumno/cursos', label: 'Cursos', icon: <BookOpen size={20} /> },
    { path: '/alumno/tareas', label: 'Tareas', icon: <ClipboardList size={20} /> },
    { path: '/alumno/logros', label: 'Logros', icon: <Trophy size={20} /> },
    { path: '/alumno/buscador', label: 'Buscador', icon: <Search size={20} /> },
    { path: '/alumno/feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    { path: '/alumno/tienda', label: 'Tienda', icon: <ShoppingBag size={20} /> },
  ],
  docente: [
    { path: '/docente', label: 'Panel', icon: <LayoutDashboard size={20} /> },
    { path: '/docente/alumnos', label: 'Alumnos', icon: <Users size={20} /> },
    { path: '/docente/materiales', label: 'Materiales', icon: <Upload size={20} /> },
    { path: '/docente/dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { path: '/docente/reportes', label: 'Reportes', icon: <FileText size={20} /> },
  ],
  directivo: [
    { path: '/directivo', label: 'Resumen', icon: <Building2 size={20} /> },
    { path: '/directivo/rendimiento', label: 'Rendimiento', icon: <TrendingUp size={20} /> },
    { path: '/directivo/infraestructura', label: 'Infra', icon: <Server size={20} /> },
    { path: '/directivo/alertas', label: 'Alertas', icon: <Bell size={20} /> },
  ]
}

const XP_LEVELS = [
  { min: 0, max: 100, label: 'Novato' },
  { min: 100, max: 250, label: 'Aprendiz' },
  { min: 250, max: 500, label: 'Dedicado' },
  { min: 500, max: 800, label: 'Avanzado' },
  { min: 800, max: 1200, label: 'Experto' },
  { min: 1200, max: 2000, label: 'Maestro' },
]

function getXPInfo(xp: number) {
  const level = XP_LEVELS.find(l => xp >= l.min && xp < l.max) || XP_LEVELS[XP_LEVELS.length - 1]
  const idx = XP_LEVELS.indexOf(level)
  return { nivel: idx + 1, label: level.label, xpMax: level.max, xpMin: level.min }
}

export default function Sidebar() {
  const perfil = useAuthStore((s) => s.perfil)
  const signOut = useAuthStore((s) => s.signOut)
  const conexion = useAppStore((s) => s.conexion)
  const pendientes = useSyncStore((s) => s.pendientes)
  const location = useLocation()

  if (!perfil) return null

  const items = NAV_ITEMS[perfil.rol] || []
  const xpInfo = getXPInfo(perfil.xp)

  const CONN_STATUS = {
    ONLINE_SUPABASE: { color: 'bg-[#2db88a]', label: 'Online' },
    ONLINE_LAN_ONLY: { color: 'bg-[#e8a020]', label: 'LAN' },
    OFFLINE_TOTAL:   { color: 'bg-[#e05050]', label: 'Offline' }
  }

  return (
    <aside className="sidebar flex-col gap-3 p-3 w-60 bg-card dark:bg-dark-card border-r border-border dark:border-white/10 h-[calc(100dvh-96px)] sticky top-[96px] overflow-y-auto">
      {/* Profile section */}
      <div className="flex items-center gap-3 p-3 mb-1">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-lg font-bold font-display flex-shrink-0">
          {perfil.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-sm text-text dark:text-dark-text truncate">{perfil.nombre}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            perfil.rol === 'alumno' ? 'bg-primary-bg text-primary' :
            perfil.rol === 'docente' ? 'bg-mint-bg text-mint' :
            'bg-violet-bg text-violet'
          }`}>
            {perfil.rol.charAt(0).toUpperCase() + perfil.rol.slice(1)}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== `/${perfil.rol}` && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${perfil.rol}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors ${
                isActive
                  ? perfil.rol === 'alumno' ? 'bg-primary-bg text-primary font-medium' :
                    perfil.rol === 'docente' ? 'bg-mint-bg text-mint font-medium' :
                    'bg-violet-bg text-violet font-medium'
                  : 'text-text-muted dark:text-dark-muted hover:bg-surface dark:hover:bg-dark-card2'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.label === 'Tareas' && pendientes > 0 && (
                <span className="ml-auto bg-amber text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendientes}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* XP Bar - only for students */}
      {perfil.rol === 'alumno' && (
        <div className="mt-3 bg-gradient-to-br from-primary to-primary-light rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-white/75">
            🌟 Nivel {xpInfo.nivel} — {xpInfo.label}
          </p>
          <p className="text-sm font-semibold text-white mt-1 mb-2">
            {perfil.xp} / {xpInfo.xpMax} XP
          </p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber to-amber-light rounded-full progress-fill"
              style={{ width: `${Math.min(((perfil.xp - xpInfo.xpMin) / (xpInfo.xpMax - xpInfo.xpMin)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-white font-semibold text-sm mt-2">🪙 {perfil.monedas} monedas</p>
        </div>
      )}

      {/* System status chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <div className="flex items-center gap-1 bg-surface dark:bg-dark-card2 px-2 py-1 rounded-full">
          <div className={`w-1.5 h-1.5 rounded-full ${CONN_STATUS[conexion].color}`} />
          <span className="text-[10px] text-text-muted dark:text-dark-muted font-medium">{CONN_STATUS[conexion].label}</span>
        </div>
        <div className="flex items-center gap-1 bg-surface dark:bg-dark-card2 px-2 py-1 rounded-full">
          {conexion === 'OFFLINE_TOTAL' ? <WifiOff size={10} className="text-text-muted" /> : <Wifi size={10} className="text-text-muted" />}
          <span className="text-[10px] text-text-muted dark:text-dark-muted font-medium">WiFi</span>
        </div>
        <div className="flex items-center gap-1 bg-surface dark:bg-dark-card2 px-2 py-1 rounded-full">
          <HardDrive size={10} className="text-text-muted" />
          <span className="text-[10px] text-text-muted dark:text-dark-muted font-medium">Caché</span>
        </div>
        <div className="flex items-center gap-1 bg-surface dark:bg-dark-card2 px-2 py-1 rounded-full">
          <Database size={10} className="text-text-muted" />
          <span className="text-[10px] text-text-muted dark:text-dark-muted font-medium">Supabase</span>
        </div>
      </div>

      {/* Logout at bottom */}
      <button
        onClick={signOut}
        className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-muted dark:text-dark-muted hover:bg-danger-bg hover:text-danger transition-colors"
      >
        <LogOut size={20} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
