import React from 'react'
import { useAppStore } from '../../stores/appStore'

const ESTADOS = {
  ONLINE_SUPABASE: {
    bg: 'bg-[#2db88a]',
    icon: '●',
    text: 'Conectado · LAN activo · Supabase OK'
  },
  ONLINE_LAN_ONLY: {
    bg: 'bg-[#e8a020]',
    icon: '◐',
    text: 'Solo LAN · Guardando offline'
  },
  OFFLINE_TOTAL: {
    bg: 'bg-[#e05050]',
    icon: '○',
    text: 'Sin conexión · Modo offline activo'
  }
} as const

export default function ConnBanner() {
  const conexion = useAppStore((s) => s.conexion)
  const estado = ESTADOS[conexion]

  return (
    <div
      className={`conn-banner fixed top-0 left-0 right-0 z-50 h-9 flex items-center justify-center gap-2 ${estado.bg}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-white text-xs font-medium font-body tracking-wide">
        {estado.icon} {estado.text}
      </span>
    </div>
  )
}
