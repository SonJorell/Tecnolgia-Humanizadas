import { create } from 'zustand'
import type { EstadoConexion } from '../lib/connectivity'

interface Toast {
  id: string
  tipo: 'info' | 'xp' | 'sync' | 'error'
  mensaje: string
  duracion?: number
}

interface AppState {
  conexion: EstadoConexion
  darkMode: boolean
  sidebarOpen: boolean
  toasts: Toast[]

  setConexion: (estado: EstadoConexion) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  conexion: 'OFFLINE_TOTAL',
  darkMode: (() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })(),
  sidebarOpen: false,
  toasts: [],

  setConexion: (estado) => set({ conexion: estado }),

  toggleDarkMode: () => {
    const next = !get().darkMode
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ darkMode: next })
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (toast) => {
    const id = crypto.randomUUID()
    const newToast = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    // Auto-dismiss after duration (default 3s)
    const dur = toast.duracion || 3000
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, dur)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))
