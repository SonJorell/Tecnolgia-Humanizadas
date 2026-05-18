import type { EstadoConexion } from '../lib/connectivity'

export interface Toast {
  id: string
  tipo: 'info' | 'xp' | 'sync' | 'error'
  mensaje: string
  duracion?: number
}

export interface Alerta {
  id: string
  tipo: 'info' | 'warning' | 'success' | 'error'
  titulo: string
  mensaje: string
  leida: boolean
  creado_en: string
}

export interface AppState {
  conexion: EstadoConexion
  darkMode: boolean
  sidebarOpen: boolean
  toasts: Toast[]
}

export type NavItem = {
  path: string
  label: string
  icon: string
  badge?: number
}
