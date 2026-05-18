import { create } from 'zustand'

interface SyncState {
  syncing: boolean
  pendientes: number
  ultimoSync: number | null
  setSyncing: (val: boolean) => void
  setPendientes: (n: number) => void
  setUltimoSync: (ts: number) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  syncing: false,
  pendientes: 0,
  ultimoSync: null,

  setSyncing: (val) => set({ syncing: val }),
  setPendientes: (n) => set({ pendientes: n }),
  setUltimoSync: (ts) => set({ ultimoSync: ts })
}))
