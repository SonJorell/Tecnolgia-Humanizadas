import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types/user'

interface AuthState {
  user: any | null
  perfil: Perfil | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loadPerfil: () => Promise<void>
  clearError: () => void
  updatePerfil: (updates: Partial<Perfil>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  perfil: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      set({ user: data.user })
      await get().loadPerfil()
    } catch (err: any) {
      set({ error: err.message || 'Error al iniciar sesión', loading: false })
      throw err
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, perfil: null, error: null })
  },

  loadPerfil: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false, user: null, perfil: null })
        return
      }
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      set({ user, perfil: data as Perfil, loading: false })
    } catch (err) {
      console.error('[Auth] Error loading profile:', err)
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null }),

  updatePerfil: (updates: Partial<Perfil>) => {
    const current = get().perfil
    if (current) {
      set({ perfil: { ...current, ...updates } })
    }
  }
}))

// Persist session across reloads
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    useAuthStore.getState().loadPerfil()
  } else {
    useAuthStore.setState({ user: null, perfil: null, loading: false })
  }
})
