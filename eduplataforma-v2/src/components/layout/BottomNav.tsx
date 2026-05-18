import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useSyncStore } from '../../stores/syncStore'
import {
  Home, BookOpen, ClipboardList, Trophy, ShoppingBag,
  LayoutDashboard, Users, Upload, BarChart3, FileText,
  Building2, TrendingUp, Server, Bell
} from 'lucide-react'

const NAV_ITEMS: Record<string, { path: string; label: string; icon: React.ReactNode }[]> = {
  alumno: [
    { path: '/alumno', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/alumno/cursos', label: 'Cursos', icon: <BookOpen size={20} /> },
    { path: '/alumno/tareas', label: 'Tareas', icon: <ClipboardList size={20} /> },
    { path: '/alumno/logros', label: 'Logros', icon: <Trophy size={20} /> },
    { path: '/alumno/tienda', label: 'Tienda', icon: <ShoppingBag size={20} /> },
  ],
  docente: [
    { path: '/docente', label: 'Panel', icon: <LayoutDashboard size={20} /> },
    { path: '/docente/alumnos', label: 'Alumnos', icon: <Users size={20} /> },
    { path: '/docente/materiales', label: 'Material', icon: <Upload size={20} /> },
    { path: '/docente/dashboard', label: 'Datos', icon: <BarChart3 size={20} /> },
    { path: '/docente/reportes', label: 'Reportes', icon: <FileText size={20} /> },
  ],
  directivo: [
    { path: '/directivo', label: 'Resumen', icon: <Building2 size={20} /> },
    { path: '/directivo/rendimiento', label: 'Rendim.', icon: <TrendingUp size={20} /> },
    { path: '/directivo/infraestructura', label: 'Infra', icon: <Server size={20} /> },
    { path: '/directivo/alertas', label: 'Alertas', icon: <Bell size={20} /> },
  ]
}

export default function BottomNav() {
  const perfil = useAuthStore((s) => s.perfil)
  const pendientes = useSyncStore((s) => s.pendientes)
  const location = useLocation()

  if (!perfil) return null

  const items = NAV_ITEMS[perfil.rol] || []

  const activeColor = perfil.rol === 'alumno' ? 'text-primary' :
                      perfil.rol === 'docente' ? 'text-mint' : 'text-violet'

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 h-14 bg-card dark:bg-dark-card border-t border-border dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-full">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== `/${perfil.rol}` && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${perfil.rol}`}
              className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
                isActive ? activeColor : 'text-text-light dark:text-dark-muted'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.label === 'Tareas' && pendientes > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendientes > 9 ? '9+' : pendientes}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
