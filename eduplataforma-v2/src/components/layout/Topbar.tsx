import React from 'react'
import { Sun, Moon, LogOut, RefreshCw, Wifi } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { useSync } from '../../hooks/useSync'
import Logo from '../ui/Logo'

const ROL_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  alumno:    { bg: 'bg-primary-bg', text: 'text-primary', label: 'Alumno' },
  docente:   { bg: 'bg-mint-bg', text: 'text-mint', label: 'Docente' },
  directivo: { bg: 'bg-violet-bg', text: 'text-violet', label: 'Directivo' }
}

const CONN_DOTS: Record<string, string> = {
  ONLINE_SUPABASE: 'bg-[#2db88a]',
  ONLINE_LAN_ONLY: 'bg-[#e8a020]',
  OFFLINE_TOTAL:   'bg-[#e05050]'
}

export default function Topbar() {
  const perfil = useAuthStore((s) => s.perfil)
  const signOut = useAuthStore((s) => s.signOut)
  const { darkMode, toggleDarkMode, conexion } = useAppStore()
  const { syncing, syncAhora } = useSync()

  const rolBadge = perfil ? ROL_BADGES[perfil.rol] : null

  return (
    <header className="sticky top-9 z-40 h-[60px] md:h-[60px] bg-card dark:bg-dark-card shadow-topbar flex items-center justify-between px-4 md:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Logo size={32} />
        <span className="font-display font-bold text-lg text-text dark:text-dark-text hidden sm:block">
          EduPlataforma
        </span>
        {rolBadge && (
          <span className={`${rolBadge.bg} ${rolBadge.text} text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline-block`}>
            {rolBadge.label}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Desktop controls */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Connection chip */}
          <div className="flex items-center gap-1.5 bg-surface dark:bg-dark-card2 px-2.5 py-1.5 rounded-full">
            <Wifi size={14} className="text-text-muted dark:text-dark-muted" />
            <div className={`w-2 h-2 rounded-full ${CONN_DOTS[conexion]}`} />
          </div>

          {/* Sync button */}
          <button
            onClick={syncAhora}
            className="p-2 rounded-lg hover:bg-surface dark:hover:bg-dark-card2 transition-colors text-text-muted dark:text-dark-muted"
            title="Sincronizar ahora"
            disabled={syncing}
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-surface dark:hover:bg-dark-card2 transition-colors text-text-muted dark:text-dark-muted"
            title="Cambiar tema"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Avatar */}
        {perfil && (
          <div className="flex items-center gap-2">
            {/* Mobile conn dot */}
            <div className={`sm:hidden w-2.5 h-2.5 rounded-full ${CONN_DOTS[conexion]}`} />

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold font-display">
              {perfil.nombre.charAt(0).toUpperCase()}
            </div>

            {/* Logout - desktop only */}
            <button
              onClick={signOut}
              className="hidden sm:flex p-2 rounded-lg hover:bg-danger-bg transition-colors text-text-muted dark:text-dark-muted hover:text-danger"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
